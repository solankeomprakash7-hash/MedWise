import csv, ast, random, re, sys, json
D = sys.argv[1]
random.seed(7)
rows = list(csv.DictReader(open(f'{D}/ptbxl_database.csv')))
def clean(r): return r['validated_by_human']=='True' and not any(r[k] for k in ('static_noise','burst_noise','electrodes_problems','baseline_drift'))
# (pattern id, title, track(s), codes, n, extra filter, note)
# NOTE: shortlist.csv's 'tracks' column was later relabelled to learning levels (Level 1-4, Ignore list).
SPEC = [
 ('normal','Normal ECG','Foundations; Ignore list',['NORM'],14,None,''),
 ('sinus_brady','Sinus bradycardia','Rhythm; Pre-op',['SBRAD'],6,None,''),
 ('sinus_tachy','Sinus tachycardia','Rhythm; Post-op; OBGYN',['STACH'],6,None,''),
 ('sinus_arrh','Sinus arrhythmia','Ignore list',['SARRH'],4,None,''),
 ('af','Atrial fibrillation','Rhythm; Post-op',['AFIB'],12,None,''),
 ('flutter','Atrial flutter','Rhythm',['AFLT'],6,None,''),
 ('svt','Supraventricular tachycardia','Rhythm; Casualty',['SVTAC','PSVT'],6,None,''),
 ('pvc','Ventricular ectopics','Rhythm; Ignore list',['PVC'],5,None,''),
 ('bigeminy','Bigeminy','Rhythm',['BIGU'],3,None,''),
 ('avb1','First-degree AV block','Conduction; Pre-op; Ignore list',['1AVB'],5,None,''),
 ('avb2','Second-degree AV block','Conduction; Pre-op',['2AVB'],4,None,''),
 ('chb','Complete heart block','Conduction; Casualty',['3AVB'],5,None,''),
 ('rbbb','Right bundle branch block','Conduction; Pre-op',['CRBBB'],6,None,''),
 ('irbbb','Incomplete RBBB','Ignore list',['IRBBB'],4,None,''),
 ('lbbb','Left bundle branch block','Conduction; Pre-op',['CLBBB'],6,None,''),
 ('lafb','Left anterior fascicular block','Conduction; Pre-op',['LAFB'],5,None,''),
 ('lpfb','Left posterior fascicular block','Conduction',['LPFB'],3,None,''),
 ('wpw','Wolff-Parkinson-White','Conduction; Casualty',['WPW'],5,None,''),
 ('paced','Paced rhythm','Conduction; Pre-op; Anaesthesia',['PACE'],6,None,''),
 ('acute_inj','Acute injury / evolving MI','Ischaemia; Casualty; Post-op',['INJAS','INJAL','INJIN','INJIL','INJLA'],10,None,'Confirm ST elevation vs depression on review'),
 ('acute_mi','Infarct, early stage','Ischaemia; Casualty',['IMI','AMI','ASMI','ALMI','ILMI','LMI'],10,lambda r:'Stadium I' in r['infarction_stadium1'] and 'II' not in r['infarction_stadium1'].replace('Stadium I','',1),'Stage I per PTB-XL; check it shows acute changes'),
 ('post_mi','Inferoposterior MI','Ischaemia',['IPMI','IPLMI','PMI'],4,None,''),
 ('old_mi','Old infarct (Q waves)','Ischaemia; Pre-op',['IMI','ASMI'],8,lambda r:'Stadium III' in r['infarction_stadium1'],''),
 ('isch_t','Ischaemic ST-T change','Ischaemia; Pre-op',['ISCAN','ISCAS','ISCAL','ISCIN','ISCIL','ISCLA'],8,None,''),
 ('lvh','LV hypertrophy','Chambers; Pre-op',['LVH'],6,None,''),
 ('rvh','RV hypertrophy','Chambers',['RVH'],4,None,''),
 ('lae','Left atrial enlargement','Chambers',['LAO/LAE'],3,None,''),
 ('rae','Right atrial enlargement','Chambers',['RAO/RAE'],3,None,''),
 ('longqt','Long QT','Metabolic; Drugs; Anaesthesia',['LNGQT'],5,None,''),
 ('digoxin','Digoxin effect','Metabolic; Drugs',['DIG'],4,None,''),
 ('electrolyte','Electrolyte or drug effect','Metabolic',['EL'],4,None,'PTB-XL does not say which electrolyte'),
 ('aneurysm','LV aneurysm pattern','Ischaemia',['ANEUR'],2,None,''),
]
out=[]; used=set()
for pid,title,track,codes,n,flt,note in SPEC:
    cand=[]
    for r in rows:
        if r['ecg_id'] in used or not clean(r): continue
        d=ast.literal_eval(r['scp_codes'])
        hit=[c for c in codes if d.get(c,0)>=100 or (c in ('AFIB','STACH','SBRAD','SARRH','AFLT','PVC','BIGU','PACE','SVTAC','PSVT') and c in d)]
        if not hit or (flt and not flt(r)): continue
        other=[k for k in d if k not in codes and k not in ('SR','NORM')]
        if pid=='normal' and other: continue
        cand.append((len(other)+random.random(), r, hit, d))
    cand.sort(key=lambda x:x[0])
    for _,r,hit,d in cand[:n]:
        used.add(r['ecg_id'])
        out.append(dict(uid=f"ptbxl-{r['ecg_id']}", source='PTB-XL', record=r['filename_lr'], pattern=pid, title=title, tracks=track,
          labels=';'.join(f'{k}:{int(v)}' for k,v in d.items()), age=r['age'], sex='M' if r['sex']=='0' else 'F',
          report=r['report'].strip()[:160], second_opinion=r['second_opinion'], note=note))
    print(f'{pid:12} {min(n,len(cand)):3}/{n:3}  pool {len(cand)}', file=sys.stderr)
# Chapman supplement (physician-labelled rhythms)
names={}
for r in csv.reader(open(f'{D}/chapman_conditions.csv',encoding='utf-8-sig')):
    if r[0]!='Acronym Name': names.setdefault(r[2],r[0])
chap=[]
for line in open(f'{D}/chap/dx.txt',newline='').read().split('\n'):
    line=line.replace('\r','')
    dx=re.search(r'#Dx: ([0-9,]+)',line); ag=re.search(r'#Age: (\S+)',line); sx=re.search(r'#Sex: (\S+)',line)
    if dx and line.strip().endswith('.hea'): chap.append((ag.group(1) if ag else '',sx.group(1) if sx else 'U',[names.get(c,c) for c in dx.group(1).split(',')],line.split()[-1]))
CSPEC=[('flutter','Atrial flutter','Rhythm',{'AF'},6),('svt','Supraventricular tachycardia','Rhythm; Casualty',{'SVT','AVNRT','AVRT','AT'},6),
 ('avb2','Second-degree AV block','Conduction; Pre-op',{'2AVB','2AVB1','2AVB2'},5),('chb','Complete heart block','Conduction; Casualty',{'3AVB'},5),
 ('early_repol','Early repolarisation','Ignore list',{'ERV'},6),('sinus_brady','Sinus bradycardia','Ignore list; Pre-op',{'SB'},3),('junctional','Junctional escape','Rhythm',{'JEB'},3)]
random.shuffle(chap)
for pid,title,track,codes,n in CSPEC:
    c=[x for x in chap if codes & set(x[2])]; c.sort(key=lambda x:len(x[2]))
    for age,sex,dx,path in c[:n]:
        rec=path.replace('.hea','')
        out.append(dict(uid='chapman-'+rec.split('/')[-1], source='Chapman-Shaoxing', record='WFDBRecords/'+rec, pattern=pid, title=title, tracks=track,
          labels=';'.join(dx), age=age, sex=sex[0], report='', second_opinion='', note=''))
    print(f'chapman {pid:12} {min(n,len(c))}/{n} pool {len(c)}', file=sys.stderr)
w=csv.DictWriter(open(sys.argv[2],'w',newline=''),fieldnames=list(out[0].keys())); w.writeheader(); w.writerows(out)
print(len(out),'total', file=sys.stderr)
