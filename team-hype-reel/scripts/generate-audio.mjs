// Synthesizes the original, royalty-free soundtrack and sound effects.
// 120 BPM -> 1 beat = 0.5s = 15 frames at 30fps, so visuals can sync to the grid.
// Run: node scripts/generate-audio.mjs
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const BPM = 120;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const DURATION = 20;
const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
mkdirSync(outDir, {recursive: true});

// Deterministic noise
let seed = 1234567;
const rnd = () => {
	seed = (seed * 1664525 + 1013904223) >>> 0;
	return seed / 4294967296;
};
const noise = () => rnd() * 2 - 1;

const makeStereo = (seconds) => [
	new Float32Array(Math.ceil(seconds * SR)),
	new Float32Array(Math.ceil(seconds * SR)),
];

const add = (buf, t, mono, gain = 1, pan = 0) => {
	const start = Math.round(t * SR);
	const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4);
	const gr = gain * Math.sin(((pan + 1) * Math.PI) / 4);
	for (let i = 0; i < mono.length; i++) {
		const j = start + i;
		if (j < 0 || j >= buf[0].length) continue;
		buf[0][j] += mono[i] * gl;
		buf[1][j] += mono[i] * gr;
	}
};

const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

// Chamberlin state-variable filter, cutoff may be a function of time
const svf = (input, cutoff, q = 0.7, mode = 'lp') => {
	const out = new Float32Array(input.length);
	let low = 0;
	let band = 0;
	for (let i = 0; i < input.length; i++) {
		const fc = typeof cutoff === 'function' ? cutoff(i / SR) : cutoff;
		const f = 2 * Math.sin((Math.PI * Math.min(fc, SR / 6)) / SR);
		low += f * band;
		const high = input[i] - low - (1 / q) * band;
		band += f * high;
		out[i] = mode === 'lp' ? low : mode === 'bp' ? band : high;
	}
	return out;
};

const saw = (phase) => 2 * (phase - Math.floor(phase + 0.5));

// ---------- Instruments ----------
const kick = (len = 0.45) => {
	const n = Math.round(len * SR);
	const out = new Float32Array(n);
	let ph = 0;
	for (let i = 0; i < n; i++) {
		const t = i / SR;
		const f = 45 + 110 * Math.exp(-t * 28);
		ph += f / SR;
		const amp = Math.exp(-t * 7);
		const click = i < 60 ? noise() * (1 - i / 60) * 0.4 : 0;
		out[i] = Math.tanh(Math.sin(2 * Math.PI * ph) * amp * 1.6) + click;
	}
	return out;
};

const clap = () => {
	const n = Math.round(0.35 * SR);
	const raw = new Float32Array(n);
	for (let i = 0; i < n; i++) {
		const t = i / SR;
		let env = Math.exp(-t * 18);
		for (const o of [0, 0.011, 0.022]) {
			if (t >= o && t < o + 0.01) env += Math.exp(-(t - o) * 250);
		}
		raw[i] = noise() * env;
	}
	return svf(raw, 1400, 1.2, 'bp').map((v) => v * 2.2);
};

const hat = (decay) => {
	const n = Math.round((decay * 6 + 0.01) * SR);
	const raw = new Float32Array(n);
	for (let i = 0; i < n; i++) raw[i] = noise() * Math.exp(-(i / SR) / decay);
	return svf(raw, 7500, 0.8, 'hp');
};

const snare = () => {
	const n = Math.round(0.2 * SR);
	const out = new Float32Array(n);
	for (let i = 0; i < n; i++) {
		const t = i / SR;
		out[i] =
			noise() * Math.exp(-t * 22) * 0.7 +
			Math.sin(2 * Math.PI * 190 * t) * Math.exp(-t * 30) * 0.5;
	}
	return out;
};

const crash = (len = 2.2) => {
	const n = Math.round(len * SR);
	const raw = new Float32Array(n);
	for (let i = 0; i < n; i++) raw[i] = noise() * Math.exp(-(i / SR) * 2.2);
	return svf(raw, 5000, 0.6, 'hp');
};

const bassNote = (midi, len) => {
	const n = Math.round(len * SR);
	const raw = new Float32Array(n);
	const f = mtof(midi);
	for (let i = 0; i < n; i++) {
		const t = i / SR;
		const env = Math.min(1, t * 400) * Math.exp(-t * 5);
		raw[i] =
			(saw(f * t) * 0.6 + Math.sin(2 * Math.PI * f * t) * 0.8) * env;
	}
	return svf(raw, (t) => 300 + 1400 * Math.exp(-t * 18), 1.4, 'lp');
};

const supersaw = (midis, len, bright = 3200) => {
	const n = Math.round(len * SR);
	const raw = new Float32Array(n);
	const detunes = [-0.12, -0.05, 0, 0.05, 0.12];
	for (let i = 0; i < n; i++) {
		const t = i / SR;
		const env = Math.min(1, t * 300) * Math.exp(-t * 7);
		let s = 0;
		for (const m of midis) {
			for (const d of detunes) s += saw(mtof(m + d) * t + d * 7);
		}
		raw[i] = (s / (midis.length * detunes.length)) * env;
	}
	return svf(raw, bright, 0.9, 'lp');
};

const pluck = (midi, len = 0.22) => {
	const n = Math.round(len * SR);
	const raw = new Float32Array(n);
	const f = mtof(midi);
	for (let i = 0; i < n; i++) {
		const t = i / SR;
		const env = Math.min(1, t * 800) * Math.exp(-t * 16);
		const sq = Math.sin(2 * Math.PI * f * t) > 0 ? 1 : -1;
		raw[i] = (sq * 0.5 + saw(f * 2 * t) * 0.35) * env;
	}
	return svf(raw, (t) => 900 + 5000 * Math.exp(-t * 25), 1.1, 'lp');
};

const pad = (midis, len, cutoff) => {
	const n = Math.round(len * SR);
	const raw = new Float32Array(n);
	for (let i = 0; i < n; i++) {
		const t = i / SR;
		const env = Math.min(1, t * 3) * Math.min(1, (len - t) * 8);
		let s = 0;
		for (const m of midis) s += saw(mtof(m) * t) + saw(mtof(m + 0.08) * t);
		raw[i] = (s / (midis.length * 2)) * env;
	}
	return svf(raw, cutoff, 0.8, 'lp');
};

// ---------- Effects ----------
const reverb = (buf, wet = 0.25) => {
	const combs = [1557, 1617, 1491, 1422, 1277, 1356];
	const allp = [225, 556, 441];
	const out = [];
	for (let ch = 0; ch < 2; ch++) {
		const input = buf[ch];
		const acc = new Float32Array(input.length);
		for (const [ci, baseLen] of combs.entries()) {
			const len = baseLen + ch * 23 + ci;
			const line = new Float32Array(len);
			let idx = 0;
			let lp = 0;
			for (let i = 0; i < input.length; i++) {
				const y = line[idx];
				lp = y * 0.6 + lp * 0.4;
				line[idx] = input[i] + lp * 0.8;
				acc[i] += y / combs.length;
				idx = (idx + 1) % len;
			}
		}
		let sig = acc;
		for (const len of allp) {
			const line = new Float32Array(len + ch * 7);
			let idx = 0;
			const o = new Float32Array(sig.length);
			for (let i = 0; i < sig.length; i++) {
				const d = line[idx];
				const v = sig[i] + d * 0.5;
				line[idx] = v;
				o[i] = d - v * 0.5;
				idx = (idx + 1) % line.length;
			}
			sig = o;
		}
		out.push(input.map((v, i) => v + sig[i] * wet));
	}
	return out;
};

const delay = (buf, time, fb = 0.35, wet = 0.3) => {
	const d = Math.round(time * SR);
	return buf.map((ch, c) => {
		const out = new Float32Array(ch.length);
		const dd = d + c * 331; // ping-pong-ish stereo spread
		for (let i = 0; i < ch.length; i++) {
			out[i] = ch[i] + (i >= dd ? out[i - dd] * fb : 0);
		}
		return ch.map((v, i) => v * (1 - wet) + out[i] * wet);
	});
};

const mixInto = (dst, src, gain = 1) => {
	for (let c = 0; c < 2; c++) {
		for (let i = 0; i < dst[c].length; i++) dst[c][i] += src[c][i] * gain;
	}
};

const writeWav = (file, buf, peak = 0.89) => {
	const n = buf[0].length;
	let max = 0;
	for (const ch of buf) for (const v of ch) max = Math.max(max, Math.abs(v));
	const norm = max > 0 ? peak / max : 1;
	const data = Buffer.alloc(44 + n * 4);
	data.write('RIFF', 0);
	data.writeUInt32LE(36 + n * 4, 4);
	data.write('WAVEfmt ', 8);
	data.writeUInt32LE(16, 16);
	data.writeUInt16LE(1, 20);
	data.writeUInt16LE(2, 22);
	data.writeUInt32LE(SR, 24);
	data.writeUInt32LE(SR * 4, 28);
	data.writeUInt16LE(4, 32);
	data.writeUInt16LE(16, 34);
	data.write('data', 36);
	data.writeUInt32LE(n * 4, 40);
	for (let i = 0; i < n; i++) {
		for (let c = 0; c < 2; c++) {
			// soft clip for loudness + glue
			const v = Math.tanh(buf[c][i] * norm * 1.15) / Math.tanh(1.15);
			data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 4 + c * 2);
		}
	}
	writeFileSync(join(outDir, file), data);
	console.log(`wrote public/${file} (${(n / SR).toFixed(2)}s)`);
};

// ---------- Song ----------
// Progression: Am - F - C - G (vi-IV-I-V), one chord per bar
const chords = [
	{root: 45, notes: [69, 72, 76]},
	{root: 41, notes: [65, 69, 72]},
	{root: 48, notes: [67, 72, 76]},
	{root: 43, notes: [67, 71, 74]},
];
const chordAt = (bar) => chords[((bar - 1) % 4 + 4) % 4];

const drums = makeStereo(DURATION + 3);
const bass = makeStereo(DURATION + 3);
const synths = makeStereo(DURATION + 3);
const leads = makeStereo(DURATION + 3);
const fx = makeStereo(DURATION + 3);

const K = kick();
const CL = clap();
const HC = hat(0.012);
const HO = hat(0.06);
const SN = snare();

// Sections (seconds): intro 0-2, drop 2-7.5, rewind gap 7.5-8, drop 8-19, final hit 19
const DROP = 2;
const GAP_START = 7.5;
const GAP_END = 8;
const FINAL = 19;
const isPlaying = (t) => t >= DROP && !(t >= GAP_START && t < GAP_END) && t < FINAL;

// Intro: filtered pad + accelerating snare roll + riser
add(synths, 0, pad(chords[3].notes.map((m) => m - 12), 2, (t) => 400 + 3000 * (t / 2) ** 2), 0.5);
for (let t = 0; t < DROP - 0.01; ) {
	const step = t < 1 ? BEAT / 2 : t < 1.5 ? BEAT / 4 : BEAT / 8;
	add(drums, t, SN, 0.25 + 0.5 * (t / DROP), (rnd() - 0.5) * 0.3);
	t += step;
}
{
	const len = DROP;
	const n = Math.round(len * SR);
	const raw = new Float32Array(n);
	let ph = 0;
	for (let i = 0; i < n; i++) {
		const t = i / SR;
		ph += (200 + 1400 * (t / len) ** 2) / SR;
		raw[i] = (noise() * 0.6 + Math.sin(2 * Math.PI * ph) * 0.25) * (t / len) ** 2;
	}
	add(fx, 0, svf(raw, (t) => 300 + 7000 * (t / len) ** 2, 2, 'bp'), 0.9);
}

// Main groove
const sixteenth = BEAT / 4;
for (let step = 0; step * sixteenth < FINAL; step++) {
	const t = step * sixteenth;
	if (!isPlaying(t)) continue;
	const bar = Math.floor(t / BAR);
	const inBeat = step % 4;
	const beatInBar = Math.floor(step / 4) % 4;
	const ch = chordAt(bar);

	if (inBeat === 0) add(drums, t, K, 1);
	if (inBeat === 0 && (beatInBar === 1 || beatInBar === 3)) add(drums, t, CL, 0.55, 0.05);
	if (inBeat === 2) add(drums, t, HO, 0.28, 0.25);
	else add(drums, t, HC, inBeat % 2 === 1 ? 0.2 : 0.12, -0.25);

	// Bass: pumping offbeat 8ths with octave jump
	if (inBeat === 2) add(bass, t, bassNote(ch.root, BEAT / 2 - 0.02), 0.55);
	if (inBeat === 3 && beatInBar === 3) add(bass, t, bassNote(ch.root + 12, sixteenth), 0.35);

	// Chord stabs on offbeats
	if (inBeat === 2) add(synths, t, supersaw(ch.notes, 0.24), 0.45);

	// Lead arp (after first 2 bars of the drop) - bouncy 16ths
	if (t >= 4) {
		const pattern = [0, 1, 2, 1, 0, 2, 1, 2];
		const n = ch.notes[pattern[step % 8]] + 12;
		const accent = step % 8 === 0 ? 0.3 : 0.2;
		add(leads, t, pluck(n), accent, step % 2 === 0 ? -0.35 : 0.35);
	}
}

// Crashes on section changes
for (const t of [DROP, GAP_END, 12, 16]) add(fx, t, crash(), 0.35);

// Final hit: big kick + chord + crash, ringing out
add(drums, FINAL, K, 1.2);
add(drums, FINAL, CL, 0.6);
add(fx, FINAL, crash(3), 0.45);
add(synths, FINAL, pad([57, 60, 64, 69], 1.0, 2500), 0.6);
add(bass, FINAL, bassNote(33, 0.9), 0.8);

// Sidechain duck (synths/bass/leads) on every kick
const duck = (buf) => {
	for (let i = 0; i < buf[0].length; i++) {
		const t = i / SR;
		if (!isPlaying(t)) continue;
		const since = (t - DROP) % BEAT;
		const g = 0.35 + 0.65 * Math.min(1, since / 0.18);
		buf[0][i] *= g;
		buf[1][i] *= g;
	}
};
duck(bass);
duck(synths);
duck(leads);

const master = makeStereo(DURATION + 3);
mixInto(master, drums, 1);
mixInto(master, bass, 0.9);
mixInto(master, reverb(synths, 0.35), 0.8);
mixInto(master, reverb(delay(leads, BEAT * 0.75, 0.35, 0.35), 0.3), 0.75);
mixInto(master, reverb(fx, 0.4), 0.8);

// Fade the very end
const trimmed = master.map((ch) => ch.slice(0, DURATION * SR));
for (let i = 0; i < trimmed[0].length; i++) {
	const t = i / SR;
	const g = t > DURATION - 0.6 ? (DURATION - t) / 0.6 : 1;
	trimmed[0][i] *= g;
	trimmed[1][i] *= g;
}
writeWav('music.wav', trimmed);

// ---------- Standalone SFX ----------
const sfx = (seconds, fn, file, fxFn = (b) => b) => {
	const buf = makeStereo(seconds);
	fn(buf);
	writeWav(file, fxFn(buf), 0.8);
};

// Whoosh: swept band-passed noise
sfx(
	0.6,
	(buf) => {
		const n = Math.round(0.6 * SR);
		const raw = new Float32Array(n);
		for (let i = 0; i < n; i++) {
			const t = i / SR;
			raw[i] = noise() * Math.sin((Math.PI * t) / 0.6) ** 2;
		}
		add(buf, 0, svf(raw, (t) => 400 + 6000 * Math.sin((Math.PI * t) / 0.6), 3, 'bp'), 1, 0);
	},
	'whoosh.wav',
);

// Pop: quick pitch-dropping sine blip
sfx(
	0.15,
	(buf) => {
		const n = Math.round(0.15 * SR);
		const raw = new Float32Array(n);
		let ph = 0;
		for (let i = 0; i < n; i++) {
			const t = i / SR;
			ph += (1400 * Math.exp(-t * 30) + 300) / SR;
			raw[i] = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 35);
		}
		add(buf, 0, raw);
	},
	'pop.wav',
);

// Tape rewind: fast descending warble
sfx(
	0.5,
	(buf) => {
		const n = Math.round(0.5 * SR);
		const raw = new Float32Array(n);
		let ph = 0;
		for (let i = 0; i < n; i++) {
			const t = i / SR;
			const f = 1800 * Math.exp(-t * 3) + 120 * Math.sin(2 * Math.PI * 22 * t);
			ph += f / SR;
			raw[i] = (saw(ph) * 0.6 + noise() * 0.25) * Math.min(1, t * 40) * Math.min(1, (0.5 - t) * 20);
		}
		add(buf, 0, svf(raw, 3500, 0.9, 'lp'));
	},
	'rewind.wav',
);

// Camera shutter: two clicks
sfx(
	0.35,
	(buf) => {
		for (const o of [0, 0.09]) {
			const n = Math.round(0.06 * SR);
			const raw = new Float32Array(n);
			for (let i = 0; i < n; i++) raw[i] = noise() * Math.exp(-(i / SR) * 90);
			add(buf, o, svf(raw, 3000, 1.5, 'bp'), o === 0 ? 1 : 0.7);
		}
	},
	'shutter.wav',
	(b) => reverb(b, 0.2),
);
