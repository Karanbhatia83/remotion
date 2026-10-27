import json, numpy as np, subprocess
from faster_whisper import WhisperModel
D='/tmp/claude-0/-home-user/bc177f57-3943-5754-85d0-885de1143645/scratchpad/reel/'
raw=subprocess.run(["ffmpeg","-v","error","-i",D+"audio/voice_clean.wav","-ac","1","-ar","16000","-f","f32le","-"],capture_output=True).stdout
a=np.frombuffer(raw,np.float32)
m=WhisperModel("medium",device="cpu",compute_type="int8",cpu_threads=2)
segs,info=m.transcribe(a,beam_size=3,language="hi",word_timestamps=True,vad_filter=True,condition_on_previous_text=True)
out=[]
for s in segs:
    out.append({"start":round(s.start,2),"end":round(s.end,2),"text":s.text.strip(),"words":[{"w":w.word.strip(),"s":round(w.start,2),"e":round(w.end,2)} for w in (s.words or [])]})
    print(f"[{s.start:5.1f}-{s.end:5.1f}] {s.text.strip()}")
json.dump(out,open(D+"audio/captions.json","w"),ensure_ascii=False,indent=1)
