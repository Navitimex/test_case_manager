import { Status, Priority } from '@/types';

export const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'] as const;
export const STATUS_OPTIONS = ['DRAFT', 'PASSED', 'FAILED', 'SKIPPED'] as const;

export const STATUS_BADGE: Record<Status, { bg: string; text: string }> = {
  PASSED: { bg: '#E3FCEF', text: '#006644' },
  FAILED: { bg: '#FFEBE6', text: '#BF2600' },
  SKIPPED: { bg: '#FFFAE6', text: '#FF8B00' },
  DRAFT: { bg: '#DFE1E6', text: '#42526E' },
};

export const PRIORITY_BADGE: Record<Priority, { bg: string; text: string }> = {
  Low:      { bg: '#DFE1E6', text: '#42526E' },
  Medium:   { bg: '#E9F2FF', text: '#0C66E4' },
  High:     { bg: '#FFFAE6', text: '#FF8B00' },
  Critical: { bg: '#FFEBE6', text: '#BF2600' },
};
