# Builds draft answer keys for the real-ECG drill. Every key is checked by a doctor before release.
import json, sys
d = json.load(open('review/ecgs.json')); m = json.load(open('data/ptbxl_meas.json')); s = json.load(open('data/sigmeas.json'))
STT = ['ste', 'std', 'twi']
# pattern -> (level, rhythm keys, required tags, optional tags, next-step keys, teaching line)
P = {
 'normal': (1, ['sinus'], [], ['u'], ['routine'], 'Sinus rhythm with normal intervals, axis, R progression and ST-T. Use it as your reference.'),
 'sinus_brady': (1, ['sinus'], [], ['u', 'twi'], ['routine'], 'Sinus rhythm under 60/min. Normal in athletes and sleep; otherwise check drugs, thyroid and symptoms.'),
 'sinus_tachy': (1, ['sinus'], [], STT, ['routine', 'admit'], 'Sinus rhythm over 100/min. A response, not a diagnosis: look for fever, pain, hypovolaemia, sepsis, PE, anaemia.'),
 'sinus_arrh': (1, ['sinus'], [], [], ['routine'], 'P before every QRS, but the R-R interval varies with breathing. Normal, especially in the young.'),
 'af': (2, ['af'], ['nop'], STT, ['bedside', 'routine'], 'No P waves and an irregularly irregular rhythm. Control the rate, find the trigger, score stroke risk.'),
 'flutter': (2, ['flutter'], ['nop'], STT, ['bedside'], 'Sawtooth flutter waves, best in II, III, aVF and V1, usually at about 300/min with fixed or variable block.'),
 'svt': (3, ['svt'], ['nop'], STT, ['bedside'], 'Regular narrow-complex tachycardia without visible P waves. Vagal manoeuvre, then adenosine if stable.'),
 'pvc': (2, ['ectopic'], [], STT, ['routine'], 'Sinus rhythm with wide premature beats not preceded by a P wave. Check K+, Mg2+, ischaemia and drugs.'),
 'bigeminy': (2, ['ectopic'], [], STT, ['routine'], 'Every second beat is premature. Count only the normal beats for the underlying rhythm.'),
 'avb1': (2, ['sinus', 'avb'], [], STT, ['routine'], 'Every P conducts, but the PR is over 200 ms. Usually benign; review AV-nodal drugs.'),
 'avb2': (3, ['avb'], [], STT, ['pace', 'admit'], 'Some P waves are not followed by a QRS. Decide Mobitz I (PR lengthens) or II (PR fixed): Mobitz II needs pacing.'),
 'chb': (3, ['avb', 'vent', 'junc'], [], STT, ['pace'], 'P waves and QRS complexes march at their own rates with no relationship. Prepare pacing.'),
 'rbbb': (2, ['sinus'], [], ['twi', 'std'], ['routine'], 'QRS 120 ms or more, rSR′ in V1 and a wide S in I and V6. Often benign; new RBBB with chest pain or breathlessness needs thought.'),
 'irbbb': (2, ['sinus'], [], ['twi'], ['routine'], 'rSR′ in V1 with a QRS under 120 ms. Usually a normal variant.'),
 'lbbb': (2, ['sinus'], [], STT, ['routine', 'admit'], 'QRS 120 ms or more, broad notched R in I, aVL, V6, no septal q, QS in V1. Discordant ST-T is expected.'),
 'lafb': (2, ['sinus'], [], [], ['routine'], 'Left axis beyond -45° with qR in I and aVL and rS in II, III, aVF.'),
 'lpfb': (2, ['sinus'], [], [], ['routine'], 'Right axis deviation with rS in I and aVL and qR in III and aVF, after excluding RVH and lateral MI.'),
 'wpw': (4, ['sinus'], ['delta'], ['twi', 'std', 'q'], ['routine', 'admit'], 'Short PR and a slurred delta wave. Avoid AV-nodal blockers if AF develops; refer for ablation.'),
 'paced': (4, ['vent', 'sinus'], ['spike'], STT, ['routine'], 'Pacing spikes followed by wide paced complexes. Check capture and sensing.'),
 'acute_inj': (3, ['sinus'], ['std'], ['ste', 'twi', 'q'], ['admit', 'reperf'], 'Acute ischaemic ST change in one territory. Compare with old ECGs, repeat serially, treat as ACS.'),
 'acute_mi': (3, ['sinus'], ['q'], STT, ['admit', 'reperf'], 'Evolving infarct pattern in one coronary territory. Look for ST elevation, reciprocal change and Q waves.'),
 'post_mi': (3, ['sinus'], ['q'], ['rv1', 'std', 'twi', 'ste'], ['admit', 'routine'], 'Inferior Q waves with a tall R in V1-V2: the posterior wall is involved.'),
 'old_mi': (2, ['sinus'], ['q'], ['twi'], ['routine'], 'Pathological Q waves in two contiguous leads with the ST back at baseline: a completed old infarct.'),
 'isch_t': (2, ['sinus'], ['twi'], ['std'], ['admit', 'routine'], 'T inversion or ST depression in a coronary territory. Correlate with symptoms and troponin.'),
 'lvh': (2, ['sinus'], ['highv'], ['std', 'twi'], ['routine'], 'High QRS voltage (S V1 + R V5/V6 of 35 mm or more), often with lateral strain. Confirm on echo.'),
 'rvh': (2, ['sinus'], ['rv1'], ['twi', 'highv'], ['routine', 'admit'], 'Right axis, dominant R in V1 and deep S in V5-V6. Think pulmonary hypertension, mitral stenosis, lung disease.'),
 'lae': (2, ['sinus'], [], [], ['routine'], 'Broad notched P in II and a deep, wide terminal P in V1: left atrial enlargement.'),
 'rae': (2, ['sinus'], [], ['twi'], ['routine'], 'Tall peaked P of 2.5 mm or more in II, III, aVF: right atrial enlargement.'),
 'longqt': (3, ['sinus'], [], ['u', 'twi'], ['bedside'], 'QTc over 470 ms in men or 480 ms in women. Stop QT-prolonging drugs and correct K+ and Mg2+.'),
 'digoxin': (4, ['sinus', 'af'], ['std'], ['twi', 'nop'], ['routine'], 'Scooped "reverse tick" ST depression with a short QT: the effect of digoxin, not toxicity by itself.'),
 'electrolyte': (3, ['sinus'], [], STT + ['u', 'peakT'], ['bedside'], 'ST-T changes from an electrolyte or drug effect. Check K+, Ca2+, Mg2+ and the drug chart.'),
 'aneurysm': (4, ['sinus'], ['q', 'ste'], ['twi'], ['routine', 'admit'], 'Persistent ST elevation with Q waves weeks after an MI: LV aneurysm. Compare with old ECGs.'),
 'early_repol': (2, ['sinus'], ['ste'], [], ['routine'], 'Concave ST elevation with J-point notching in a young, well person: benign early repolarisation.'),
 'junctional': (2, ['junc', 'sinus'], [], ['nop'], ['routine', 'admit'], 'Narrow QRS with absent or retrograde P waves: a junctional rhythm. Check drugs and digoxin.'),
}
out = []
for e in d:
    lv, rhy, tags, opt, act, teach = P[e['pattern']]
    sg = s[e['uid']]; key = {}
    mm = m.get(e['uid'].split('-')[1]) if e['source'] == 'PTB-XL' else None
    f = lambda k: (round(float(mm[k])) if mm and mm.get(k) not in (None, '', 'nan') else None)
    hr = f('HR__Global') or sg['hr_count']
    irregular = sg['cv'] is not None and sg['cv'] > 0.1
    key['hr'] = hr; key['regular'] = not irregular
    key['axis'] = f('axis') if mm else None
    if key['axis'] is not None and key['axis'] > 180: key['axis'] -= 360
    key['pr'] = f('PR_Int_Global') if mm and e['pattern'] not in ('af', 'flutter', 'avb2', 'chb', 'svt', 'junctional', 'paced') else None
    if key['pr'] is not None and key['pr'] < 60: key['pr'] = None
    key['qrs'] = f('QRS_Dur_Global'); key['qt'] = f('QT_Int_Global')
    for k in ('qrs', 'qt'):
        if key[k] is not None and key[k] <= 0: key[k] = None
    key.update(rhythm=rhy, tags=tags, opt=opt, act=act)
    out.append(dict(id=e['uid'], src=e['source'], rec=e['record'], pattern=e['pattern'], title=e['title'], level=lv,
                    age=e['age'], sex=e['sex'], key=key, teach=teach, draft=True))
# After clinical review, set draft=False and add reviewed=<date> (done for the 216-ECG launch set on 2026-11-20).
json.dump(out, open(sys.argv[1], 'w'), separators=(',', ':'))
print(len(out), sum(1 for o in out if o['key']['axis'] is None), 'without axis')
