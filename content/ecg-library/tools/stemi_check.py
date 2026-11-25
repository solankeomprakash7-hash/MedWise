# Usage: python3 tools/stemi_check.py <dir with ptbxl_database.csv and 12sl.csv> ptbxl-<id> ...
# STEMI check on PTB-XL+ 12SL J-point ST amplitudes (4th Universal Definition of MI).
import csv, json, sys
D = sys.argv[1]
F = {r['ecg_id']: r for r in csv.DictReader(open(f'{D}/12sl.csv'))}
db = {r['ecg_id']: r for r in csv.DictReader(open(f'{D}/ptbxl_database.csv'))}
LEADS = ['I','II','III','aVR','aVL','aVF','V1','V2','V3','V4','V5','V6']
GROUPS = {'inferior': [('II','III'),('III','aVF'),('II','aVF')], 'lateral': [('I','aVL'),('V5','V6'),('I','V6'),('aVL','I')],
          'anterior': [('V1','V2'),('V2','V3'),('V3','V4'),('V4','V5')]}
def st(i):
    f = F[i]; out = {}
    for l in LEADS:
        try: out[l] = float(f[f'ST_Amp_{l}'])
        except: out[l] = None
    return out
def unit(v):  # values may be in µV or mV
    return v / 1000 if v is not None and abs(v) > 20 else v
def thr(l, sex, age):
    if l in ('V2', 'V3'):
        if sex == 'F': return 0.15
        return 0.25 if (age or 99) < 40 else 0.2
    return 0.1
def check(i):
    r = db[i]; sex = 'F' if r['sex'] == '1' else 'M'
    try: age = float(r['age'])
    except: age = None
    s = {l: unit(v) for l, v in st(i).items()}
    ste = {g: [p for p in pairs if all(s[x] is not None and s[x] >= thr(x, sex, age) for x in p)] for g, pairs in GROUPS.items()}
    terr = [g for g, p in ste.items() if p]
    std = [l for l in LEADS if l != 'aVR' and s[l] is not None and s[l] <= -0.05]
    return dict(stemi=terr, std=std, avr=s['aVR'], st={l: round(v, 2) for l, v in s.items() if v is not None})
if __name__ == '__main__':
    ids = sys.argv[2:]
    for x in ids:
        i = x.split('-')[1]; c = check(i)
        print(x, 'STE territories:', c['stemi'], '| STD leads:', c['std'], '| aVR', c['avr'], '|', {k: v for k, v in c['st'].items()})
