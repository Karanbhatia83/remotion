import {createEffect, type InteractivitySchema} from 'remotion';

/**
 * Chroma key in YUV space.
 *
 * Why not `colorKey()` from `@remotion/effects`?
 * `colorKey()` measures Euclidean distance in RGB, which folds brightness into
 * the decision. On this footage the backing is a desaturated olive (#8EA371)
 * and it is lit unevenly, so measured against the key colour:
 *
 *   backing (dim edge of the screen) ... 0.080
 *   skin ............................... 0.109
 *
 * Those overlap. Every threshold that clears the backing also punches holes in
 * her face. The unevenness is almost entirely *luma*, so dropping luma from the
 * comparison and keying on chroma alone opens the gap back up:
 *
 *   backing (dim edge of the screen) ... 0.016
 *   gold zari .......................... 0.076
 *   skin ............................... 0.092
 *
 * ~5x of headroom instead of 1.4x. Same `effects` array, same parameter names.
 */

const DEFAULT_KEY_COLOR = '#8ea371' as const;
const DEFAULT_SIMILARITY = 0.042 as const;
const DEFAULT_SMOOTHNESS = 0.018 as const;
const DEFAULT_SPILL_SUPPRESSION = 0.5 as const;
const DEFAULT_MATTE_SOFTNESS = 1.5 as const;

export const chromaKeySchema = {
	keyColor: {
		type: 'color',
		default: DEFAULT_KEY_COLOR,
		description: 'Key color',
	},
	similarity: {
		type: 'number',
		min: 0,
		max: 0.3,
		step: 0.001,
		default: DEFAULT_SIMILARITY,
		description: 'Similarity',
		hiddenFromList: false,
	},
	smoothness: {
		type: 'number',
		min: 0,
		max: 0.2,
		step: 0.001,
		default: DEFAULT_SMOOTHNESS,
		description: 'Smoothness',
		hiddenFromList: false,
	},
	spillSuppression: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_SPILL_SUPPRESSION,
		description: 'Spill suppression',
		hiddenFromList: false,
	},
	matteSoftness: {
		type: 'number',
		min: 0,
		max: 4,
		step: 0.1,
		default: DEFAULT_MATTE_SOFTNESS,
		description: 'Matte softness',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export type ChromaKeyParams = {
	/** Colour of the backing. Defaults to `'#8ea371'`, measured off this footage. */
	readonly keyColor?: string;
	/** Chroma distance below which a pixel is fully transparent (0-0.3). Defaults to `0.042`. */
	readonly similarity?: number;
	/** Width of the feathered band above `similarity` (0-0.2). Defaults to `0.018`. */
	readonly smoothness?: number;
	/** How hard to pull the key colour out of the pixels that survive (0-1). Defaults to `0.5`. */
	readonly spillSuppression?: number;
	/**
	 * Radius, in texels, over which chroma is averaged *before* the matte
	 * decision. Chroma is stored at half resolution in 4:2:0, so a single hair
	 * strand's chroma sample jitters between frames; averaging the neighbourhood
	 * stops that jitter flipping pixels across the threshold. Colour output is
	 * unaffected -- only the alpha decision is smoothed. Defaults to `1.5`.
	 */
	readonly matteSoftness?: number;
};

type ChromaKeyResolved = {
	keyColor: string;
	similarity: number;
	smoothness: number;
	spillSuppression: number;
	matteSoftness: number;
};

type ChromaKeyState = {
	readonly gl: WebGL2RenderingContext;
	readonly program: WebGLProgram;
	readonly vao: WebGLVertexArrayObject;
	readonly vbo: WebGLBuffer;
	readonly textureSource: WebGLTexture;
	readonly uniforms: {
		readonly uSource: WebGLUniformLocation | null;
		readonly uKeyColor: WebGLUniformLocation | null;
		readonly uSimilarity: WebGLUniformLocation | null;
		readonly uSmoothness: WebGLUniformLocation | null;
		readonly uSpillSuppression: WebGLUniformLocation | null;
		readonly uTexel: WebGLUniformLocation | null;
		readonly uMatteSoftness: WebGLUniformLocation | null;
	};
	readonly colorCtx: CanvasRenderingContext2D;
	cachedColor: string;
	cachedColorRgb: readonly [number, number, number];
};

const resolve = (p: ChromaKeyParams): ChromaKeyResolved => ({
	keyColor: p.keyColor ?? DEFAULT_KEY_COLOR,
	similarity: p.similarity ?? DEFAULT_SIMILARITY,
	smoothness: p.smoothness ?? DEFAULT_SMOOTHNESS,
	spillSuppression: p.spillSuppression ?? DEFAULT_SPILL_SUPPRESSION,
	matteSoftness: p.matteSoftness ?? DEFAULT_MATTE_SOFTNESS,
});

const assertUnitRange = (value: number, name: string, max: number): void => {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		throw new TypeError(`chromaKey(): ${name} must be a finite number.`);
	}

	if (value < 0 || value > max) {
		throw new RangeError(`chromaKey(): ${name} must be between 0 and ${max}.`);
	}
};

const validateChromaKeyParams = (params: ChromaKeyParams): void => {
	if (typeof params !== 'object' || params === null) {
		throw new TypeError('chromaKey(): params must be an object.');
	}

	if (params.keyColor !== undefined && typeof params.keyColor !== 'string') {
		throw new TypeError('chromaKey(): keyColor must be a CSS color string.');
	}

	const r = resolve(params);
	assertUnitRange(r.similarity, 'similarity', 0.3);
	assertUnitRange(r.smoothness, 'smoothness', 0.2);
	assertUnitRange(r.spillSuppression, 'spillSuppression', 1);
	assertUnitRange(r.matteSoftness, 'matteSoftness', 4);
};

const CHROMA_KEY_VS = /* glsl */ `#version 300 es
in vec2 aPos;
in vec2 aUv;
out vec2 vUv;

void main() {
vUv = aUv;
gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const CHROMA_KEY_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSource;
uniform vec3 uKeyColor;
uniform float uSimilarity;
uniform float uSmoothness;
uniform float uSpillSuppression;
uniform vec2 uTexel;
uniform float uMatteSoftness;

// BT.709 luma, then the Cb/Cr axes normalised the same way a YCbCr encoder does.
vec2 rgbToChroma(vec3 c) {
float y = dot(c, vec3(0.2126, 0.7152, 0.0722));
return vec2((c.b - y) / 1.8556, (c.r - y) / 1.5748);
}

// Pull the dominant key channel down towards the other two, which kills the
// green fringe on hair and shoulders without touching neutral or warm pixels.
vec3 suppressSpill(vec3 color, vec3 keyColor, float amount) {
if (keyColor.g > keyColor.r && keyColor.g > keyColor.b) {
float limit = (color.r + color.b) * 0.5;
color.g = mix(color.g, min(color.g, limit), amount);
} else if (keyColor.r > keyColor.g && keyColor.r > keyColor.b) {
float limit = (color.g + color.b) * 0.5;
color.r = mix(color.r, min(color.r, limit), amount);
} else if (keyColor.b > keyColor.r && keyColor.b > keyColor.g) {
float limit = (color.r + color.g) * 0.5;
color.b = mix(color.b, min(color.b, limit), amount);
}
return color;
}

vec2 chromaAt(vec2 uv) {
vec4 t = texture(uSource, uv);
float a = max(t.a, 0.001);
return rgbToChroma(t.rgb / a);
}

// 3x3 weighted average of chroma. Used ONLY to decide alpha -- the pixel's own
// colour is still what gets drawn, so detail is preserved while the matte stops
// chattering on thin structures like hair.
vec2 stableChroma(vec2 uv, float radius) {
if (radius <= 0.0) {
return chromaAt(uv);
}
vec2 o = uTexel * radius;
vec2 c = chromaAt(uv) * 4.0;
c += chromaAt(uv + vec2( o.x, 0.0)) * 2.0;
c += chromaAt(uv + vec2(-o.x, 0.0)) * 2.0;
c += chromaAt(uv + vec2(0.0,  o.y)) * 2.0;
c += chromaAt(uv + vec2(0.0, -o.y)) * 2.0;
c += chromaAt(uv + vec2( o.x,  o.y));
c += chromaAt(uv + vec2(-o.x,  o.y));
c += chromaAt(uv + vec2( o.x, -o.y));
c += chromaAt(uv + vec2(-o.x, -o.y));
return c / 16.0;
}

void main() {
vec4 texColor = texture(uSource, vUv);
float alpha = texColor.a;

if (alpha <= 0.001) {
fragColor = vec4(0.0);
return;
}

// The pipeline hands us premultiplied alpha; work in straight RGB.
vec3 rgb = texColor.rgb / alpha;

float chromaDistance = distance(stableChroma(vUv, uMatteSoftness), rgbToChroma(uKeyColor));

// Below uSimilarity -> fully keyed. Above uSimilarity + uSmoothness -> fully
// kept. The band between the two is the feathered edge.
float keepMask = uSmoothness <= 0.0001
? step(uSimilarity, chromaDistance)
: smoothstep(uSimilarity, uSimilarity + uSmoothness, chromaDistance);

vec3 cleanRgb = uSpillSuppression > 0.0
? suppressSpill(rgb, uKeyColor, uSpillSuppression)
: rgb;

float keyedAlpha = alpha * keepMask;
fragColor = vec4(cleanRgb * keyedAlpha, keyedAlpha);
}
`;

const compileShader = (
	gl: WebGL2RenderingContext,
	type: number,
	source: string,
): WebGLShader => {
	const shader = gl.createShader(type);
	if (!shader) {
		throw new Error('Failed to create WebGL shader');
	}

	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw new Error(`Chroma key shader compile failed: ${log ?? '(no log)'}`);
	}

	return shader;
};

const createProgram = (gl: WebGL2RenderingContext): WebGLProgram => {
	const vs = compileShader(gl, gl.VERTEX_SHADER, CHROMA_KEY_VS);
	const fs = compileShader(gl, gl.FRAGMENT_SHADER, CHROMA_KEY_FS);

	const program = gl.createProgram();
	if (!program) {
		throw new Error('Failed to create WebGL program');
	}

	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const log = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw new Error(`Chroma key program link failed: ${log ?? '(no log)'}`);
	}

	gl.deleteShader(vs);
	gl.deleteShader(fs);
	return program;
};

const setupChromaKey = (target: HTMLCanvasElement): ChromaKeyState => {
	const gl = target.getContext('webgl2', {
		premultipliedAlpha: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});
	if (!gl) {
		throw new Error('Could not get a WebGL2 context for chromaKey().');
	}

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	const program = createProgram(gl);

	const vao = gl.createVertexArray();
	if (!vao) {
		throw new Error('Failed to create WebGL vertex array');
	}

	gl.bindVertexArray(vao);

	const vbo = gl.createBuffer();
	if (!vbo) {
		throw new Error('Failed to create WebGL buffer');
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1]),
		gl.STATIC_DRAW,
	);

	const aPos = gl.getAttribLocation(program, 'aPos');
	const aUv = gl.getAttribLocation(program, 'aUv');
	gl.enableVertexAttribArray(aPos);
	gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
	gl.enableVertexAttribArray(aUv);
	gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);

	gl.bindVertexArray(null);

	const textureSource = gl.createTexture();
	if (!textureSource) {
		throw new Error('Failed to create WebGL texture');
	}

	gl.bindTexture(gl.TEXTURE_2D, textureSource);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_2D, null);

	const colorCanvas = document.createElement('canvas');
	colorCanvas.width = 1;
	colorCanvas.height = 1;
	const colorCtx = colorCanvas.getContext('2d', {willReadFrequently: true});
	if (!colorCtx) {
		throw new Error('Failed to acquire 2D context for colour parsing');
	}

	return {
		gl,
		program,
		vao,
		vbo,
		textureSource,
		uniforms: {
			uSource: gl.getUniformLocation(program, 'uSource'),
			uKeyColor: gl.getUniformLocation(program, 'uKeyColor'),
			uSimilarity: gl.getUniformLocation(program, 'uSimilarity'),
			uSmoothness: gl.getUniformLocation(program, 'uSmoothness'),
			uSpillSuppression: gl.getUniformLocation(
				program,
				'uSpillSuppression',
			),
			uTexel: gl.getUniformLocation(program, 'uTexel'),
			uMatteSoftness: gl.getUniformLocation(program, 'uMatteSoftness'),
		},
		colorCtx,
		cachedColor: '',
		cachedColorRgb: [0, 1, 0],
	};
};

const parseKeyColor = (
	state: ChromaKeyState,
	color: string,
): readonly [number, number, number] => {
	if (state.cachedColor === color) {
		return state.cachedColorRgb;
	}

	const {colorCtx} = state;
	colorCtx.clearRect(0, 0, 1, 1);
	colorCtx.fillStyle = '#000000';
	colorCtx.fillStyle = color;
	colorCtx.fillRect(0, 0, 1, 1);
	const [r, g, b] = colorCtx.getImageData(0, 0, 1, 1).data;

	state.cachedColor = color;
	state.cachedColorRgb = [r / 255, g / 255, b / 255];
	return state.cachedColorRgb;
};

export const chromaKey = createEffect<ChromaKeyParams, ChromaKeyState>({
	type: 'com.antara.chromaKey',
	label: 'chromaKey()',
	documentationLink: null,
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `chroma-key-${r.keyColor}-${r.similarity}-${r.smoothness}-${r.spillSuppression}-${r.matteSoftness}`;
	},
	setup: (target) => setupChromaKey(target),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		const keyColor = parseKeyColor(state, r.keyColor);
		const {gl, program, textureSource, uniforms, vao} = state;

		gl.viewport(0, 0, width, height);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, textureSource);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipSourceY);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			source as TexImageSource,
		);

		gl.useProgram(program);
		if (uniforms.uSource) gl.uniform1i(uniforms.uSource, 0);
		if (uniforms.uKeyColor)
			gl.uniform3f(uniforms.uKeyColor, keyColor[0], keyColor[1], keyColor[2]);
		if (uniforms.uSimilarity) gl.uniform1f(uniforms.uSimilarity, r.similarity);
		if (uniforms.uSmoothness) gl.uniform1f(uniforms.uSmoothness, r.smoothness);
		if (uniforms.uSpillSuppression)
			gl.uniform1f(uniforms.uSpillSuppression, r.spillSuppression);
		if (uniforms.uTexel) gl.uniform2f(uniforms.uTexel, 1 / width, 1 / height);
		if (uniforms.uMatteSoftness)
			gl.uniform1f(uniforms.uMatteSoftness, r.matteSoftness);

		gl.bindVertexArray(vao);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.bindVertexArray(null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.useProgram(null);
	},
	cleanup: ({gl, program, vao, vbo, textureSource}) => {
		gl.deleteTexture(textureSource);
		gl.deleteBuffer(vbo);
		gl.deleteProgram(program);
		gl.deleteVertexArray(vao);
	},
	schema: chromaKeySchema,
	validateParams: validateChromaKeyParams,
});
