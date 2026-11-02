"""Original soundtrack for the Brahma Muhurta reel: clock ticks under the hook, a temple bell on the
turn, a soft tanpura-style drone under the body, and a light pluck on each beat. No samples, no licences."""
import numpy as np, wave, sys
SR=48000; DUR=float(sys.argv[2]) if len(sys.argv)>2 else 24.0; HOOK=float(sys.argv[3]) if len(sys.argv)>3 else 2.2
N=int(SR*DUR); t=np.arange(N)/SR; out=np.zeros(N)
def add(sig,at,gain=1.0):
    i=int(at*SR); j=min(N,i+len(sig)); out[i:j]+=sig[:j-i]*gain
def env(n,a,d): x=np.arange(n)/SR; return np.minimum(x/a,1)*np.exp(-x/d)
# clock ticks (two-tone tick-tock) through the hook, slightly accelerating
tk=int(0.03*SR); x=np.arange(tk)/SR
tick=np.sin(2*np.pi*2400*x)*env(tk,0.0005,0.006)+0.5*np.sin(2*np.pi*3900*x)*env(tk,0.0003,0.003)
tock=np.sin(2*np.pi*1800*x)*env(tk,0.0005,0.007)
at=0.0; k=0
while at<HOOK-0.05:
    add(tick if k%2==0 else tock,at,0.28); k+=1; at+=0.42-0.012*k
# temple bell at the turn (inharmonic partials)
bn=int(6*SR); bx=np.arange(bn)/SR; f0=523.0
bell=sum(a*np.sin(2*np.pi*f0*m*bx)*np.exp(-bx/d) for a,m,d in [(1,1,2.6),(0.6,2.01,1.6),(0.45,2.76,1.1),(0.3,5.40,0.6),(0.2,8.93,0.35)])
bell*=np.minimum(bx/0.002,1); add(bell,HOOK,0.16)
# tanpura-style drone on Sa-Pa (C3 / G3) from the turn, gently swelling
def string(f,dur,gain):
    n=int(dur*SR); x=np.arange(n)/SR; s=np.zeros(n)
    for h in range(1,14):
        s+=np.sin(2*np.pi*f*h*x*(1+0.0004*np.sin(2*np.pi*0.3*x)))*(0.8**h)*(1+0.6*np.sin(2*np.pi*(0.21+0.05*h)*x))
    return s*np.minimum(x/0.08,1)*np.exp(-x/2.8)*gain
pt=HOOK+0.2; pattern=[(196.0,0.11),(261.6,0.13),(261.6,0.13),(130.8,0.16)]
i=0
while pt<DUR-0.5:
    f,g=pattern[i%4]; add(string(f,4.0,g),pt); pt+=0.9; i+=1
# soft pluck accents passed as times
for a in [float(v) for v in (sys.argv[4].split(',') if len(sys.argv)>4 and sys.argv[4] else [])]:
    pn=int(0.6*SR); px=np.arange(pn)/SR
    add((np.sin(2*np.pi*784*px)+0.4*np.sin(2*np.pi*1568*px))*np.exp(-px/0.18)*np.minimum(px/0.002,1),a,0.10)
fade=np.ones(N); fl=int(1.2*SR); fade[-fl:]=np.linspace(1,0,fl); out*=fade
out=out/np.max(np.abs(out))*0.6
st=np.stack([out,np.roll(out,int(0.0006*SR))],1)
with wave.open(sys.argv[1],'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype(np.int16).tobytes())
print("wrote",sys.argv[1])
