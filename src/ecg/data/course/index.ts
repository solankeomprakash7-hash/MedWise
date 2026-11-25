// Modules that have the full format. A module listed here opens as a step-by-step lesson.
import type { Course } from './types';
import { SINUS } from './sinus';

export const COURSES: Record<string, Course> = { sinus: SINUS };
export const COURSE_STEPS = ['Before you start', 'Bedside story', 'Watch', 'Learn the rule', 'Worked example', 'Guided practice', 'Checkpoint', 'Review'] as const;
