# Draws the model variants from signals.json (tools/model_variants.js) on the same paper as the real ECGs.
import json, sys, numpy as np
sys.path.insert(0, 'tools')
import render
from scipy.signal import resample_poly
from PIL import Image
S = json.load(open('signals.json'))
x2 = np.arange(5000) / 2.0
data = {k: {l: np.interp(x2, np.arange(2500), np.array(v['leads'][l])) for l in v['leads']} for k, v in S.items()}  # 250 Hz -> 500 Hz, linear
for d in data.values():
    for l in d: d[l][-40:] = d[l][-41]  # the model's last samples jump; hold the strip steady at its end
render.load = lambda uid: data[uid]
for k in S:
    render.render(k, f'png/{k}.png')
    Image.open(f'png/{k}.png').convert('RGB').save(f'png/{k}.webp', 'WEBP', quality=82, method=6)
print(len(S), 'drawn')
