# Finds extra real ECGs for a pattern by checking textbook criteria on the PTB-XL+ 12SL measurements,
# not only the PTB-XL label (2026-11-25: LVH, LAE, RAE, and LAFB with a true axis beyond -45°).
# Usage: python3 tools/pick_by_criteria.py <dir with ptbxl_database.csv and 12sl.csv (PTB-XL+ features/12sl_features.csv)>
# Writes cands.json. Download the chosen records (.hea + .dat, 100 Hz) into wf/ as ptbxl-<id>.*, render them with
# tools/render.py, then add them to src/ecg/data/realEcgs.json with draft: true until a doctor reviews them.
import csv, ast, json, sys
D = sys.argv[1]
db = {r['ecg_id']: r for r in csv.DictReader(open(f'{D}/ptbxl_database.csv'))}
F = {r['ecg_id']: r for r in csv.DictReader(open(f'{D}/12sl.csv'))}
have = {e['id'] for e in json.load(open('../../src/ecg/data/realEcgs.json'))}
def num(r, k):
    try: v = float(r[k]); return v
    except: return None
def clean(r): return r['validated_by_human'] == 'True' and not any(r[k] for k in ('static_noise', 'burst_noise', 'electrodes_problems', 'baseline_drift'))
BAD = {'CLBBB', 'CRBBB', 'IRBBB', 'WPW', 'PACE', 'AFIB', 'AFLT', 'IMI', 'AMI', 'ASMI', 'ALMI', 'ILMI', 'LMI', 'PMI', 'IPMI', 'IPLMI', 'ILBBB', 'IVCD', '3AVB', '2AVB', 'PVC', 'BIGU', 'TRIGU', 'STACH', 'SBRAD', 'SARRH', 'SVTAC', 'PSVT', 'ISCAN', 'ISCAS', 'ISCAL', 'ISCIN', 'ISCIL', 'ISCLA', 'INJAS', 'INJAL', 'INJIN', 'INJIL', 'INJLA', 'LNGQT', 'DIG', 'EL', 'ANEUR'}
def cands(code, test, extra_ok=()):
    out = []
    for i, r in db.items():
        if f'ptbxl-{i}' in have or not clean(r): continue
        d = ast.literal_eval(r['scp_codes'])
        if d.get(code, 0) < 100 or 'SR' not in d: continue
        others = [k for k in d if k not in (code, 'SR', 'NORM') and k not in extra_ok]
        if any(k in BAD for k in others): continue
        f = F.get(i)
        if not f: continue
        m = dict(hr=num(f, 'HR__Global'), ax=num(f, 'R_AxisFrontal_Global'), pr=num(f, 'PR_Int_Global'), qrs=num(f, 'QRS_Dur_Global'), qt=num(f, 'QT_Int_Global'),
                 sv1=num(f, 'Max_S_Amp_V1'), rv1=num(f, 'Max_R_Amp_V1'), rv5=num(f, 'Max_R_Amp_V5'), rv6=num(f, 'Max_R_Amp_V6'), sv5=num(f, 'Max_S_Amp_V5'), sv6=num(f, 'Max_S_Amp_V6'),
                 pII=num(f, 'P_Amp_II'), pdII=num(f, 'P_Dur_II'), ppV1=num(f, 'Pp_Amp_V1'), ppdV1=num(f, 'Pp_Dur_V1'), pV1=num(f, 'P_Amp_V1'))
        if None in (m['hr'], m['qrs'], m['qt'], m['ax']): continue
        if not (50 <= m['hr'] <= 100) or m['qrs'] >= 120: continue
        if m['pr'] is not None and not (120 <= m['pr'] <= 200): continue
        if m['ax'] > 180: m['ax'] -= 360
        if test(m): out.append((len(others), i, m, [k for k in d]))
    out.sort(key=lambda x: x[0]); return out
T = {
 'lvh': ('LVH', lambda m: m['sv1'] and (m['sv1'] + max(m['rv5'] or 0, m['rv6'] or 0)) >= 3500),
 'rvh': ('RVH', lambda m: m['ax'] > 90 and m['rv1'] is not None and m['rv1'] >= 700 and (m['sv1'] is None or m['rv1'] > m['sv1'])),
 'lae': ('LAO/LAE', lambda m: (m['pdII'] or 0) >= 120 or ((m['ppV1'] or 0) <= -0.1 and (m['ppdV1'] or 0) >= 40)),
 'rae': ('RAO/RAE', lambda m: (m['pII'] or 0) >= 0.25),
 'lafb': ('LAFB', lambda m: m['ax'] <= -45),
}
res = {}
for p, (code, t) in T.items():
    c = cands(code, t); res[p] = c
    print(p, len(c), [(x[1], round(x[2]['ax']), x[2]['sv1'], x[2]['rv5'], x[2]['rv1'], x[2]['pII'], x[2]['pdII'], x[3]) for x in c[:4]])
json.dump({p: [[x[1], x[2], x[3]] for x in c] for p, c in res.items()}, open('cands.json', 'w'))
