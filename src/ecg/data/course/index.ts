// Modules that have the full format. A module listed here opens as a step-by-step lesson.
import type { Course } from './types';
import { SINUS } from './sinus';
import { WAVES } from './waves';
import { AVBLOCK } from './avblock';
import { BUNDLES } from './bundles';
import { SVT_COURSE } from './svt';

export const COURSES: Record<string, Course> = { waves: WAVES, sinus: SINUS, avblock: AVBLOCK, bundles: BUNDLES, svt: SVT_COURSE };

/** Learning-path units whose content now lives in a full lab module (Learn and Lab are becoming one course). */
export const UNIT_TO_MODULE: Record<string, string> = { 'l1-heart': 'waves', 'l1-paper': 'waves', 'l1-p': 'waves', 'l1-qrs': 'waves', 'l1-t': 'waves', 'l2-rhythm': 'sinus', 'l3-blocks': 'avblock', 'l2-bbb': 'bundles' };
export const COURSE_STEPS = ['Before you start', 'Bedside story', 'Watch', 'Learn the rule', 'Worked example', 'Guided practice', 'Checkpoint', 'Review'] as const;
