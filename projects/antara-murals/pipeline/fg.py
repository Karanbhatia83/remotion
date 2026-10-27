"""Key every frame against the fitted plate, despill, grade, light-wrap, stream RGBA to a VP9-alpha WebM."""
import sys, subprocess, time, numpy as np
sys.path.insert(0,'/tmp/claude-0/-home-user/bc177f57-3943-5754-85d0-885de1143645/scratchpad/reel')
from keyer2 import to_ycc, despill
from scipy import ndimage
from PIL import Image
D='/tmp/claude-0/-home-user/bc177f57-3943-5754-85d0-885de1143645/scratchpad/reel/'
W,H=1080,1920
plate=np.load(D+'key/plate.npy')
bg=np.asarray(Image.open(D+'key/bg_shiva_1080.png').convert('RGB')).astype(np.float32)/255
bg_wrap=np.stack([ndimage.gaussian_filter(bg[...,c],18) for c in range(3)],-1)   # very soft bg for light wrap
def key_plate(a, lo=2.5, hi=6.5, yw=0.8, cblur=2.0, feather=0.8):
    y,cb,cr=to_ycc(a); cb=ndimage.gaussian_filter(cb,cblur); cr=ndimage.gaussian_filter(cr,cblur); y=ndimage.gaussian_filter(y,0.7)
    dd=np.sqrt(((y-plate[...,0])*yw)**2+(cb-plate[...,1])**2+(cr-plate[...,2])**2)
    al=np.clip((dd-lo)/(hi-lo),0,1)
    al=ndimage.grey_erosion(al,size=(3,3)); al=ndimage.gaussian_filter(al,feather); al[:14,:]=0
    return np.clip(al,0,1)
def grade(x):
    m=x.mean(-1,keepdims=True); x=m+(x-m)*1.75            # restore saturation
    x=(x-0.5)*1.22+0.5-0.025                              # contrast + black point
    # gentle S-curve
    x=np.clip(x,0,1); x=x+0.06*np.sin(2*np.pi*(x-0.5))*(-1)  # darken shadows / lift highlights slightly
    x=np.clip(x,0,1)
    # warm to match the amber background: +R, -B, more in the shadows
    x[...,0]=np.clip(x[...,0]*1.035+0.008,0,1); x[...,2]=np.clip(x[...,2]*0.93,0,1)
    return x
dec=subprocess.Popen(["ffmpeg","-v","error","-i",D+"in/raw.mp4","-vf",f"scale={W}:{H}","-f","rawvideo","-pix_fmt","rgb24","-"],stdout=subprocess.PIPE,bufsize=10**8)
enc=subprocess.Popen(["ffmpeg","-v","error","-y","-f","rawvideo","-pix_fmt","rgba","-s",f"{W}x{H}","-r","30","-i","-",
    "-c:v","libvpx-vp9","-pix_fmt","yuva420p","-auto-alt-ref","0","-b:v","0","-crf","22","-deadline","good","-cpu-used","4","-row-mt","1","-threads","4",
    D+"out/fg_alpha.webm"],stdin=subprocess.PIPE)
n=0; t0=time.time(); nbytes=W*H*3
while True:
    buf=dec.stdout.read(nbytes)
    if len(buf)<nbytes: break
    a=np.frombuffer(buf,np.uint8).reshape(H,W,3).astype(np.float32)/255
    al=key_plate(a)
    fg=grade(despill(a,al))
    # light wrap: pull soft background colour into the outer 10 px of the subject edge
    inner=ndimage.gaussian_filter(1-al,7)*al
    fg=fg+(bg_wrap-fg)*np.clip(inner*1.6,0,0.45)[...,None]
    rgba=np.dstack([fg,al]); enc.stdin.write((rgba*255+0.5).astype(np.uint8).tobytes())
    n+=1
    if n%150==0:
        print(f"frame {n} ({n/30:.1f}s) {time.time()-t0:.0f}s elapsed, {(time.time()-t0)/n:.2f}s/frame",flush=True)
        comp=fg*al[...,None]+bg*(1-al[...,None]); Image.fromarray((comp*255).astype(np.uint8)).resize((540,960)).save(D+f"out/check_{n:04d}.jpg",quality=85)
enc.stdin.close(); enc.wait(); dec.wait()
print(f"DONE {n} frames in {time.time()-t0:.0f}s",flush=True)
