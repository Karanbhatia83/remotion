import numpy as np
from scipy import ndimage
def to_ycc(a):  # a: float 0..1 RGB -> Y,Cb,Cr in 0..255 scale
    r,g,b=a[...,0]*255,a[...,1]*255,a[...,2]*255
    y=0.299*r+0.587*g+0.114*b; cb=128-0.168736*r-0.331264*g+0.5*b; cr=128+0.5*r-0.418688*g-0.081312*b
    return y,cb,cr
def key(a, ref, lo=5.0, hi=13.0, yw=0.30, chroma_blur=1.4, feather=0.8, erode=1):
    y,cb,cr=to_ycc(a)
    if chroma_blur: cb=ndimage.gaussian_filter(cb,chroma_blur); cr=ndimage.gaussian_filter(cr,chroma_blur)
    y0,cb0,cr0=ref
    d=np.sqrt(((y-y0)*yw)**2+(cb-cb0)**2+(cr-cr0)**2)
    al=np.clip((d-lo)/(hi-lo),0,1)
    if erode: al=ndimage.grey_erosion(al,size=(2*erode+1,2*erode+1))
    if feather: al=ndimage.gaussian_filter(al,feather)
    return np.clip(al,0,1)
def despill(a, strength=1.0):
    r,g,b=a[...,0],a[...,1],a[...,2]
    lim=(r+b)/2*1.02+0.01
    g2=np.where(g>lim,g-(g-lim)*strength,g)
    out=a.copy(); out[...,1]=g2; return out
def backdrop_ref(a):
    y,cb,cr=to_ycc(a); sl=(slice(40,200),slice(40,200))
    return (float(y[sl].mean()),float(cb[sl].mean()),float(cr[sl].mean()))
