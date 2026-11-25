# ECG library: open-dataset shortlist

Real 12-lead ECGs for the MedWise ECG product, picked from open PhysioNet datasets.
`shortlist.csv` holds 216 candidates (184 PTB-XL, 32 Chapman–Shaoxing), each tagged with a teaching
pattern and its learning level (Level 1–4, plus an "Ignore list" tag for benign look-alikes). Every ECG is reviewed by a doctor before it enters the product.

## Sources and licences

| Dataset | Licence | Link |
| --- | --- | --- |
| PTB-XL 1.0.3 | CC BY 4.0 | https://physionet.org/content/ptb-xl/1.0.3/ |
| Chapman–Shaoxing 12-lead ECG database 1.0.0 | CC BY 4.0 | https://physionet.org/content/ecg-arrhythmia/1.0.0/ |

Both require attribution in the product (an "ECG sources" page and the dataset name under each tracing).

## Rebuilding

Needs network access to physionet.org and `pip install wfdb matplotlib scipy`.

1. Download `ptbxl_database.csv`, `scp_statements.csv` (PTB-XL) and `ConditionNames_SNOMED-CT.csv` (Chapman) into a `data/` folder, plus Chapman `#Dx` header lines into `data/chap/dx.txt` (one line per record, ending in its `.hea` path).
2. `python3 tools/shortlist.py data shortlist.csv` picks candidates: human-validated, noise-free records with a 100%-confidence label, fewest co-existing labels first.
3. Download each record's `.hea` plus `.dat` (PTB-XL, 100 Hz) or `.mat` (Chapman) into `wf/` as `<uid>.<ext>`, then `python3 tools/render.py` draws 12-lead images at 25 mm/s and 10 mm/mV into `png/`.

## Additions after launch

On 2026-11-25, 17 PTB-XL records were added for Module 6 (chamber enlargement) and to replace the left anterior fascicular
block ECGs whose axis did not meet the −45° rule. They were picked with `tools/pick_by_criteria.py`, which checks the
textbook criteria on the PTB-XL+ 12SL measurements (Sokolow–Lyon for LVH, P width or terminal P in V1 for LAE, P height for
RAE, axis for LAFB) instead of trusting the label alone. They sit in `realEcgs.json` with `draft: true` and appear in
`shortlist.csv` with a note. Draft ECGs are hidden from learners; open `/ecg#/preview` to review them (and the Module 6
lesson), and `/ecg#/preview-off` to hide them again. After review, set `draft: false` and add `reviewed: <date>`.
