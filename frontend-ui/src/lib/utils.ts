import { User } from '@/types';

export function canEdit(user: User | null | undefined): boolean {
  return user?.role === 'ADMIN' || user?.role === 'QA';
}
