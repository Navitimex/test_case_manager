'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { useUsers, useUpdateUserRole } from '@/lib/queries';
import { usePagination } from '@/lib/usePagination';
import { Role, User } from '@/types';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';
import Pagination from '@/components/Pagination';
import { Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';

const ROLE_OPTIONS: Role[] = ['ADMIN', 'QA', 'USER'];

const ROLE_BADGE: Record<Role, { bg: string; text: string }> = {
  ADMIN: { bg: '#EAE6FF', text: '#403294' },
  QA:    { bg: '#E3FCEF', text: '#006644' },
  USER:  { bg: '#DFE1E6', text: '#42526E' },
};

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAppStore();

  useEffect(() => {
    if (user === null) { router.replace('/login'); return; }
    if (user.role !== 'ADMIN') router.replace('/');
  }, [user, router]);

  const { data: users = [], isLoading, error } = useUsers(user?.role === 'ADMIN');
  const updateRole = useUpdateUserRole();
  const pagination = usePagination(users);

  const [pendingId, setPendingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');

  async function handleRoleChange(target: User, newRole: Role) {
    if (target.role === newRole) return;
    setPendingId(target.id);
    setActionError('');
    try {
      await updateRole.mutateAsync({ id: target.id, role: newRole });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setPendingId(null);
    }
  }

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col ml-[260px] overflow-hidden">
        <TopNav />

        <main className="flex-1 overflow-y-auto pt-16">
          <div className="px-8 py-8">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => router.push('/')}
                className="text-[#6B778C] hover:text-[#172B4D] transition-colors"
                title="Back"
              >
                <ArrowLeft size={18} strokeWidth={1.5} />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-[#172B4D] flex items-center gap-2">
                  <ShieldCheck size={20} strokeWidth={1.5} className="text-[#0C66E4]" />
                  User Management
                </h1>
                <p className="text-sm text-[#6B778C] mt-0.5">
                  {users.length} user{users.length !== 1 ? 's' : ''} registered.
                </p>
              </div>
            </div>

            {actionError && (
              <div className="mb-4 text-sm text-[#BF2600] bg-[#FFEBE6] px-3 py-2 rounded-md">
                {actionError}
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 size={24} className="animate-spin text-[#6B778C]" />
              </div>
            ) : error ? (
              <div className="text-sm text-[#BF2600] bg-[#FFEBE6] px-3 py-2 rounded-md">
                {error instanceof Error ? error.message : 'Failed to load users'}
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center border border-dashed border-[#DFE1E6] rounded-lg bg-white">
                <p className="text-[#6B778C] text-sm">No users found.</p>
              </div>
            ) : (
              <>
                <div className="bg-white border border-[#DFE1E6] rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#DFE1E6] bg-[#F4F5F7]">
                        <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#6B778C]">Name</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6B778C]">Email</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6B778C] w-28">Role</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6B778C] w-36">Change Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DFE1E6]">
                      {pagination.paginated.map((u) => {
                        const badge = ROLE_BADGE[u.role];
                        const isSelf = u.id === user.id;
                        const isPending = pendingId === u.id;

                        return (
                          <tr key={u.id} className="hover:bg-[#F4F5F7] transition-colors">
                            <td className="px-5 py-3.5 font-medium text-[#172B4D]">
                              {u.name}
                              {isSelf && (
                                <span className="ml-2 text-xs text-[#6B778C] font-normal">(you)</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-[#6B778C]">{u.email}</td>
                            <td className="px-4 py-3.5">
                              <span
                                className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
                                style={{ backgroundColor: badge.bg, color: badge.text }}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              {isSelf ? (
                                <span className="text-xs text-[#6B778C]">Cannot change own role</span>
                              ) : isPending ? (
                                <Loader2 size={14} className="animate-spin text-[#6B778C]" />
                              ) : (
                                <select
                                  value={u.role}
                                  onChange={(e) => handleRoleChange(u, e.target.value as Role)}
                                  className="text-sm px-2 py-1 rounded border border-[#DFE1E6] text-[#172B4D] bg-white focus:outline-none focus:border-[#0C66E4] transition-colors"
                                >
                                  {ROLE_OPTIONS.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                  ))}
                                </select>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalItems}
                  rangeStart={pagination.rangeStart}
                  rangeEnd={pagination.rangeEnd}
                  onPageChange={pagination.setPage}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
