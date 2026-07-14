'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { TestCase, TestCaseFormData } from '@/types';
import {
  useElements,
  useTestCases,
  useCreateTestCase,
  useUpdateTestCase,
  useDeleteTestCase,
  useBulkCreateTestCases,
} from '@/lib/queries';
import { usePagination } from '@/lib/usePagination';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';
import TestCaseDrawer from '@/components/TestCaseDrawer';
import GenerateWithAIDrawer from '@/components/GenerateWithAIDrawer';
import Pagination from '@/components/Pagination';
import { Plus, Pencil, Trash2, Loader2, ChevronRight, Sparkles } from 'lucide-react';
import { STATUS_BADGE, PRIORITY_BADGE } from '@/lib/constants';
import { canEdit } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { user, selectedElementId, searchQuery } = useAppStore();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<TestCase | null>(null);
  const [caseToDelete, setCaseToDelete] = useState<TestCase | null>(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  const { data: elements = [] } = useElements(!!user);
  const { data: testCases = [], isLoading: loadingCases, error: loadError } = useTestCases(selectedElementId);

  const createMut = useCreateTestCase(selectedElementId);
  const updateMut = useUpdateTestCase(selectedElementId);
  const deleteMut = useDeleteTestCase(selectedElementId);
  const bulkCreateMut = useBulkCreateTestCases(selectedElementId);

  const query = searchQuery.trim().toLowerCase();
  const visibleCases = query
    ? testCases.filter(
        (tc) =>
          tc.title.toLowerCase().includes(query) ||
          (tc.description ?? '').toLowerCase().includes(query)
      )
    : testCases;

  // Reset to page 1 whenever the selected element changes
  const pagination = usePagination(visibleCases, selectedElementId);

  async function handleSave(data: TestCaseFormData) {
    if (editingCase) {
      await updateMut.mutateAsync({ id: editingCase.id, data });
    } else {
      await createMut.mutateAsync(data);
    }
  }

  async function confirmDelete() {
    if (!caseToDelete) return;
    setActionError('');
    try {
      await deleteMut.mutateAsync(caseToDelete.id);
      setCaseToDelete(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to delete test case.');
      setCaseToDelete(null);
    }
  }

  function openCreate() {
    setEditingCase(null);
    setDrawerOpen(true);
  }

  function openEdit(tc: TestCase) {
    setEditingCase(tc);
    setDrawerOpen(true);
  }

  const userCanEdit = canEdit(user);
  const selectedElement = elements.find((el) => el.id === selectedElementId);
  const errorMessage = actionError || (loadError instanceof Error ? loadError.message : '');

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col ml-[260px] overflow-hidden">
        <TopNav elementName={selectedElement?.name} />

        <main className="flex-1 overflow-y-auto pt-16">
          <div className="px-8 py-8">
            {selectedElementId === null ? (
              <EmptySelection />
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-xl font-semibold text-[#172B4D]">{selectedElement?.name ?? ''}</h1>
                    <p className="text-sm text-[#6B778C] mt-0.5">
                      {query
                        ? `${visibleCases.length} of ${testCases.length} test case${testCases.length !== 1 ? 's' : ''}`
                        : `${testCases.length} test case${testCases.length !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  {userCanEdit && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setAiDrawerOpen(true)}
                        className="flex items-center gap-2 border border-[#DFE1E6] text-[#42526E] text-sm font-medium px-4 py-2 rounded-md hover:bg-[#F4F5F7] transition-colors"
                      >
                        <Sparkles size={15} strokeWidth={2} className="text-[#0C66E4]" />
                        Generate with AI
                      </button>
                      <button
                        onClick={openCreate}
                        className="flex items-center gap-2 bg-[#0C66E4] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#0052CC] transition-colors"
                      >
                        <Plus size={15} strokeWidth={2} />
                        New Test Case
                      </button>
                    </div>
                  )}
                </div>

                {errorMessage && (
                  <div className="mb-4 text-sm text-[#BF2600] bg-[#FFEBE6] px-3 py-2 rounded-md">
                    {errorMessage}
                  </div>
                )}

                {loadingCases ? (
                  <div className="flex justify-center py-20">
                    <Loader2 size={24} className="animate-spin text-[#6B778C]" />
                  </div>
                ) : testCases.length === 0 ? (
                  <EmptyElement onAdd={userCanEdit ? openCreate : undefined} />
                ) : visibleCases.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center border border-dashed border-[#DFE1E6] rounded-lg bg-white">
                    <p className="text-[#6B778C] text-sm">No test cases match your search.</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white border border-[#DFE1E6] rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#DFE1E6] bg-[#F4F5F7]">
                            <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#6B778C] w-8">#</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6B778C]">Title</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6B778C] w-28">Priority</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6B778C] w-28">Status</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6B778C] w-32">Author</th>
                            {userCanEdit && <th className="px-4 py-3 w-24" />}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DFE1E6]">
                          {pagination.paginated.map((tc, idx) => {
                            const statusBadge = STATUS_BADGE[tc.status];
                            const priorityBadge = PRIORITY_BADGE[tc.priority];
                            const globalIdx = pagination.rangeStart + idx - 1;
                            return (
                              <tr key={tc.id} className="hover:bg-[#F4F5F7] transition-colors">
                                <td className="px-5 py-3.5 text-[#6B778C] text-xs">{globalIdx + 1}</td>
                                <td className="px-4 py-3.5">
                                  <span className="font-medium text-[#172B4D]">{tc.title}</span>
                                  {tc.description && (
                                    <p className="text-xs text-[#6B778C] mt-0.5 line-clamp-1">{tc.description}</p>
                                  )}
                                </td>
                                <td className="px-4 py-3.5">
                                  <span
                                    className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
                                    style={{ backgroundColor: priorityBadge.bg, color: priorityBadge.text }}
                                  >
                                    {tc.priority}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5">
                                  <span
                                    className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
                                    style={{ backgroundColor: statusBadge.bg, color: statusBadge.text }}
                                  >
                                    {tc.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 text-[#6B778C] text-xs">{tc.author.name}</td>
                                {userCanEdit && (
                                  <td className="px-4 py-3.5">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => openEdit(tc)}
                                        className="p-1.5 text-[#6B778C] hover:text-[#0C66E4] transition-colors rounded"
                                        title="Edit"
                                      >
                                        <Pencil size={14} strokeWidth={1.5} />
                                      </button>
                                      <button
                                        onClick={() => setCaseToDelete(tc)}
                                        className="p-1.5 text-[#6B778C] hover:text-[#BF2600] transition-colors rounded"
                                        title="Delete"
                                      >
                                        <Trash2 size={14} strokeWidth={1.5} />
                                      </button>
                                    </div>
                                  </td>
                                )}
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
              </>
            )}
          </div>
        </main>
      </div>

      <TestCaseDrawer
        open={drawerOpen}
        editingCase={editingCase}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
      />

      <GenerateWithAIDrawer
        open={aiDrawerOpen}
        elementId={selectedElementId}
        elementName={selectedElement?.name}
        bulkCreateMut={bulkCreateMut}
        onClose={() => setAiDrawerOpen(false)}
      />

      {caseToDelete && (
        <ConfirmDeleteModal
          title={caseToDelete.title}
          loading={deleteMut.isPending}
          onCancel={() => setCaseToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

function EmptySelection() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <ChevronRight size={32} className="text-[#DFE1E6] mb-3" strokeWidth={1.5} />
      <p className="text-[#6B778C] text-sm">Select an element from the sidebar to view its test cases.</p>
    </div>
  );
}

function EmptyElement({ onAdd }: { onAdd?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center border border-dashed border-[#DFE1E6] rounded-lg bg-white">
      <p className="text-[#6B778C] text-sm mb-3">No test cases in this element yet.</p>
      {onAdd && (
        <button onClick={onAdd} className="text-sm text-[#0C66E4] hover:underline font-medium">
          + Create the first one
        </button>
      )}
    </div>
  );
}

function ConfirmDeleteModal({
  title,
  loading,
  onCancel,
  onConfirm,
}: {
  title: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-white rounded-lg border border-[#DFE1E6] shadow-xl w-full max-w-sm p-6">
        <h3 className="text-[15px] font-semibold text-[#172B4D] mb-1">Delete test case</h3>
        <p className="text-sm text-[#6B778C] mb-5">
          Are you sure you want to delete{' '}
          <span className="font-medium text-[#172B4D]">{title}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-[#42526E] border border-[#DFE1E6] rounded-md hover:bg-[#F4F5F7] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm bg-[#BF2600] text-white rounded-md hover:bg-[#A01E00] disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
