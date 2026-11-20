# Signal measurements for every shortlisted ECG: rate, regularity, axis (net QRS area I/aVF).
import json, numpy as np, sys
sys.path.insert(0, 'tools')
from render import load
from wfdb import processing
d = json.load(open('review/ecgs.json')); out = {}
for e in d:
    L = load(e['uid']); fs = 500; ii = L['II'][:5000]
    try:
        qrs = processing.xqrs_detect(sig=ii, fs=fs, verbose=False)
        qrs = processing.correct_peaks(ii, qrs, search_radius=40, smooth_window_size=20, peak_dir='compare')
    except Exception as ex:
        qrs = np.array([])
    rr = np.diff(qrs) / fs * 1000 if len(qrs) > 2 else np.array([])
    hr = round(len(qrs) * 6) if len(qrs) else None
    cv = float(np.std(rr) / np.mean(rr)) if len(rr) > 1 else None
    sI = sF = 0.0
    for p in qrs:
        a, b = max(0, p - 40), min(len(ii), p + 50)
        bl = lambda x: x[a:b] - np.median(x[max(0, p - 150):max(1, p - 80)]) if p > 150 else x[a:b] - np.median(x)
        sI += float(np.sum(bl(L['I'][:5000]))); sF += float(np.sum(bl(L['aVF'][:5000])))
    axis = int(round(np.degrees(np.arctan2(sF, sI)))) if len(qrs) else None
    out[e['uid']] = dict(n=len(qrs), hr_count=hr, rr_mean=float(np.mean(rr)) if len(rr) else None, cv=cv, axis=axis)
json.dump(out, open('data/sigmeas.json', 'w')); print(len(out))
