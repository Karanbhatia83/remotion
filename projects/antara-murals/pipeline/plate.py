import numpy as np
from PIL import Image
import sys; sys.path.insert(0,'/tmp/claude-0/-home-user/bc177f57-3943-5754-85d0-885de1143645/scratchpad/reel')
from keyer2 import to_ycc
d='/tmp/claude-0/-home-user/bc177f57-3943-5754-85d0-885de1143645/scratchpad/reel/key/'
H,W=1920,1080
ys,xs=np.mgrid[0:H,0:W]; X=xs/W-0.5; Y=ys/H-0.5
def basis(X,Y): return np.stack([np.ones_like(X),X,Y,X*X,X*Y,Y*Y,X**3,Y**3,X*X*Y,X*Y*Y],-1)
chans=[[],[],[]]; coords=[]
for t in (2,15,30,45):
    a=np.asarray(Image.open(d+f'flat{t}.png').convert('RGB')).astype(np.float32)/255
    y,cb,cr=to_ycc(a)
    # rough backdrop mask: close to global backdrop chroma, generous
    m=(np.abs(cb-116.5)<2.5)&(np.abs(cr-126)<2.5)&(y>110)
    # keep only strips that are surely backdrop: outer 18% columns + top 12%
    strip=np.zeros_like(m); strip[:, :int(W*.18)]=1; strip[:, int(W*.82):]=1; strip[:int(H*.12), :]=1
    m&=strip.astype(bool)
    idx=np.where(m); sel=np.random.default_rng(0).choice(len(idx[0]),min(60000,len(idx[0])),replace=False)
    coords.append((idx[0][sel],idx[1][sel]))
    for c,ch in enumerate((y,cb,cr)): chans[c].append(ch[idx[0][sel],idx[1][sel]])
    print(f"t={t}: backdrop samples {m.sum()}")
yy=np.concatenate([c[0] for c in coords]); xx=np.concatenate([c[1] for c in coords])
B=basis(xx/W-0.5,yy/H-0.5)
plate=np.zeros((H,W,3),np.float32)
for c in range(3):
    v=np.concatenate(chans[c]); coef,res,_,_=np.linalg.lstsq(B,v,rcond=None)
    fit=basis(X,Y)@coef; plate[...,c]=fit
    print(f"chan {c}: fit residual std {np.sqrt(((B@coef-v)**2).mean()):.2f}, plate range {fit.min():.1f}..{fit.max():.1f}")
np.save(d+'plate.npy',plate)
