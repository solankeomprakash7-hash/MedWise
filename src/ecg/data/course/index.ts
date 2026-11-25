// Modules that have the full format. A module listed here opens as a step-by-step lesson.
import type { Course } from './types';
import { SINUS } from './sinus';
import { WAVES } from './waves';
import { AVBLOCK } from './avblock';
import { BUNDLES } from './bundles';
import { SVT_COURSE } from './svt';
import { READ } from './read';
import { CHAMBERS } from './chambers';
import { VENTRICULAR } from './ventricular';
import { ACS } from './acs';
import { METABOLIC } from './metabolic';
import { MIMICS } from './mimics';
import { PREVIEW } from '../../lib/logic';

const TOPICS: Course[] = [WAVES, SINUS, AVBLOCK, BUNDLES, SVT_COURSE, CHAMBERS];
// The read drill draws from every curated real ECG in the topic lessons, minus its own worked and guided ECGs.
READ.pools.sinus = [...new Set(TOPICS.flatMap(c => [...c.pools.sinus, ...c.guided.map(g => g.ecg), c.worked.ecg]))];
// Lessons whose ECGs still wait for clinical review appear only in the reviewer preview.
const IN_REVIEW: Course[] = []; // all reviewed on 2026-11-25; add a lesson here while its new ECGs wait for review
export const COURSES: Record<string, Course> = Object.fromEntries([...TOPICS, READ, VENTRICULAR, ACS, METABOLIC, MIMICS, ...(PREVIEW ? IN_REVIEW : [])].map(c => [c.moduleId, c]));

/** Learning-path units whose content now lives in a full lab module (Learn and Lab are becoming one course). */
export const UNIT_TO_MODULE: Record<string, string> = { 'l1-heart': 'waves', 'l1-paper': 'waves', 'l1-p': 'waves', 'l1-qrs': 'waves', 'l1-t': 'waves', 'l2-rhythm': 'sinus', 'l3-blocks': 'avblock', 'l2-bbb': 'bundles', 'l2-order': 'read', 'l3-killers': 'ventricular', 'l3-stemi': 'acs', 'l3-equivalents': 'acs', 'l3-potassium': 'metabolic', 'l4-drugs': 'metabolic', 'l4-mimics': 'mimics' };
export const COURSE_STEPS = ['Before you start', 'Bedside story', 'Watch', 'Learn the rule', 'Worked example', 'Guided practice', 'Checkpoint', 'Review'] as const;
