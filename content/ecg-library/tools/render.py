import csv, os, re, sys, wfdb, numpy as np
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
from scipy.signal import resample_poly
LAY=[['I','aVR','V1','V4'],['II','aVL','V2','V5'],['III','aVF','V3','V6']]
def load(uid):
    h=open(f'wf/{uid}.hea').read().split('\n'); ext='.dat' if os.path.exists(f'wf/{uid}.dat') else '.mat'
    out=[h[0].replace(h[0].split()[0],uid,1)]+[re.sub(r'^\S+',uid+ext,l) if i>0 and l and not l.startswith('#') else l for i,l in enumerate(h[1:],1)]
    open(f'wf/{uid}.hea','w').write('\n'.join(out))
    r=wfdb.rdrecord(f'wf/{uid}'); sig=r.p_signal; fs=r.fs
    names=[n.upper().replace('AVR','aVR').replace('AVL','aVL').replace('AVF','aVF') for n in r.sig_name]
    if fs!=500: sig=resample_poly(sig,500,int(fs),axis=0)
    sig=np.nan_to_num(sig); return {n:sig[:,i] for i,n in enumerate(names)}
def render(uid,path):
    L=load(uid); fs=500; n=min(len(next(iter(L.values()))),5000)
    for k in L: L[k]=L[k]-np.median(L[k][:n])
    W,H=262,126; px=4.2
    fig=plt.figure(figsize=(W*px/100,H*px/100),dpi=100); ax=fig.add_axes([0,0,1,1]); ax.set_xlim(0,W); ax.set_ylim(H,0); ax.axis('off')
    for x in range(W+1): ax.axvline(x,color='#f2b8b0' if x%5 else '#e07a6e',lw=.3 if x%5 else .6,zorder=0)
    for y in range(H+1): ax.axhline(y,color='#f2b8b0' if y%5 else '#e07a6e',lw=.3 if y%5 else .6,zorder=0)
    ax.add_patch(plt.Rectangle((0,0),W,H,color='#fff6f2',zorder=-1))
    rows=[17,47,77,108]
    for ri,row in enumerate(LAY):
        for ci,ld in enumerate(row):
            a=L.get(ld); 
            if a is None: continue
            i0,i1=ci*1250,min((ci+1)*1250,n); t=np.arange(i0,i1)/fs*25-ci*62.5+8+ci*62.5
            ax.plot(t,rows[ri]-np.clip(a[i0:i1],-2.6,2.6)*10,color='#111',lw=.7,zorder=3); ax.text(8+ci*62.5+1,rows[ri]-9,ld,fontsize=9,family='monospace',zorder=4)
    a=L['II']; t=np.arange(n)/fs*25+8; ax.plot(t,rows[3]-np.clip(a[:n],-2.6,2.6)*10,color='#111',lw=.7,zorder=3); ax.text(9,rows[3]-9,'II',fontsize=9,family='monospace')
    for y in rows: ax.plot([1.5,2.5,2.5,7.5,7.5,8],[y,y,y-10,y-10,y,y],color='#111',lw=.8)
    fig.savefig(path,dpi=100); plt.close(fig)
for r in csv.DictReader(open('data/shortlist.csv')):
    p=f"png/{r['uid']}.png"
    if os.path.exists(p): continue
    try: render(r['uid'],p)
    except Exception as e: print('FAIL',r['uid'],e)
print('done')
