'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { authApi } from '@/lib/api';
import { useElements, useCreateElement, useUpdateElement, useDeleteElement } from '@/lib/queries';
import { canEdit } from '@/lib/utils';
import { Element } from '@/types';
import { LayoutGrid, LogOut, Plus, Loader2, Pencil, Trash2, Check, X, Users } from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const { user, selectedElementId, setSelectedElementId, clearAuth } = useAppStore();
  const { data: elements = [], isLoading } = useElements(!!user);
  const createElement = useCreateElement();
  const updateElement = useUpdateElement();
  const deleteElement = useDeleteElement();

  const [newElementName, setNewElementName] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [createError, setCreateError] = useState('');

  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState('');
  const [elementToDelete, setElementToDelete] = useState<Element | null>(null);

  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (elements.length > 0 && selectedElementId === null) {
      setSelectedElementId(elements[0].id);
    }
  }, [elements, selectedElementId, setSelectedElementId]);

  useEffect(() => {
    if (renamingId !== null) renameInputRef.current?.focus();
  }, [renamingId]);

  async function handleAddElement() {
    if (!newElementName.trim()) return;
    setCreateError('');
    try {
      const el = await createElement.mutateAsync({ name: newElementName.trim() });
      setNewElementName('');
      setShowInput(false);
      setSelectedElementId(el.id);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Could not create the element.');
    }
  }

  function startRename(el: Element) {
    setRenamingId(el.id);
    setRenameValue(el.name);
    setRenameError('');
  }

  async function commitRename(id: number) {
    const trimmed = renameValue.trim();
    if (!trimmed) { setRenamingId(null); return; }
    setRenameError('');
    try {
      await updateElement.mutateAsync({ id, data: { name: trimmed } });
      setRenamingId(null);
    } catch (err) {
      setRenameError(err instanceof Error ? err.message : 'Could not rename element.');
    }
  }

  async function confirmDelete(el: Element) {
    try {
      await deleteElement.mutateAsync(el.id);
      if (selectedElementId === el.id) setSelectedElementId(null);
    } catch {
      // error visible via mutation state if needed
    } finally {
      setElementToDelete(null);
    }
  }

  async function handleLogout() {
    try { await authApi.logout(); } catch { /* clear local state regardless */ }
    clearAuth();
    router.replace('/login');
  }

  const userCanEdit = canEdit(user);

  return (
    <>
      <aside className="fixed top-0 left-0 h-screen w-[260px] bg-[#F4F5F7] border-r border-[#DFE1E6] flex flex-col z-20">
        <div className="h-16 flex items-center px-5 border-b border-[#DFE1E6] shrink-0">
          <LayoutGrid className="text-[#0C66E4] mr-2" size={22} strokeWidth={2} />
          <span className="font-semibold text-[#172B4D] text-[15px] tracking-tight">TestFlow</span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B778C]">Elements</span>
            {userCanEdit && (
              <button
                onClick={() => setShowInput((v) => !v)}
                className="text-[#6B778C] hover:text-[#0C66E4] transition-colors"
                title="Add Element"
              >
                <Plus size={15} strokeWidth={2} />
              </button>
            )}
          </div>

          {showInput && (
            <div className="mb-2 flex gap-1 px-1">
              <input
                autoFocus
                value={newElementName}
                onChange={(e) => setNewElementName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddElement();
                  if (e.key === 'Escape') { setShowInput(false); setNewElementName(''); }
                }}
                placeholder="Element name…"
                className="flex-1 text-sm px-2 py-1 rounded border border-[#DFE1E6] bg-white text-[#172B4D] focus:outline-none focus:border-[#0C66E4]"
              />
              <button
                onClick={handleAddElement}
                disabled={createElement.isPending}
                className="text-xs bg-[#0C66E4] text-white px-2 py-1 rounded hover:bg-[#0052CC] disabled:opacity-50"
              >
                {createElement.isPending ? <Loader2 size={12} className="animate-spin" /> : 'Add'}
              </button>
            </div>
          )}

          {createError && <p className="text-xs text-[#BF2600] px-2 mb-2">{createError}</p>}

          {isLoading ? (
            <div className="flex justify-center mt-8">
              <Loader2 size={20} className="animate-spin text-[#6B778C]" />
            </div>
          ) : elements.length === 0 ? (
            <p className="text-xs text-[#6B778C] px-2 mt-4">No elements yet.</p>
          ) : (
            <ul className="space-y-0.5">
              {elements.map((el) => {
                const active = selectedElementId === el.id;
                const renaming = renamingId === el.id;

                return (
                  <li key={el.id}>
                    {renaming ? (
                      <div className="px-1">
                        <div className="flex items-center gap-1">
                          <input
                            ref={renameInputRef}
                            value={renameValue}
                            onChange={(e) => { setRenameValue(e.target.value); setRenameError(''); }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitRename(el.id);
                              if (e.key === 'Escape') { setRenamingId(null); setRenameError(''); }
                            }}
                            className={`flex-1 text-sm px-2 py-1 rounded border bg-white text-[#172B4D] focus:outline-none ${renameError ? 'border-[#BF2600]' : 'border-[#0C66E4]'}`}
                          />
                          <button
                            onClick={() => commitRename(el.id)}
                            disabled={updateElement.isPending}
                            className="text-[#006644] hover:text-[#00441E] p-0.5 disabled:opacity-50"
                          >
                            {updateElement.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={2} />}
                          </button>
                          <button onClick={() => { setRenamingId(null); setRenameError(''); }} className="text-[#6B778C] hover:text-[#172B4D] p-0.5">
                            <X size={14} strokeWidth={2} />
                          </button>
                        </div>
                        {renameError && (
                          <p className="text-xs text-[#BF2600] mt-1 px-1">{renameError}</p>
                        )}
                      </div>
                    ) : (
                      <div className={`group flex items-center rounded-md transition-colors ${active ? 'bg-[#0C66E4]' : 'hover:bg-[#DFE1E6]'}`}>
                        <button
                          onClick={() => setSelectedElementId(el.id)}
                          className={`flex-1 flex items-center justify-between px-3 py-2 text-sm min-w-0 ${
                            active ? 'text-white font-medium' : 'text-[#172B4D]'
                          }`}
                        >
                          <span className="truncate">{el.name}</span>
                          <span className={`text-xs ml-2 shrink-0 ${active ? 'text-blue-100' : 'text-[#6B778C]'}`}>
                            {el._count?.testCases ?? 0}
                          </span>
                        </button>

                        {userCanEdit && (
                          <div className={`flex items-center gap-0.5 pr-1 opacity-0 group-hover:opacity-100 transition-opacity ${active ? 'opacity-100' : ''}`}>
                            <button
                              onClick={() => startRename(el)}
                              title="Rename"
                              className={`p-1 rounded ${active ? 'text-blue-200 hover:text-white' : 'text-[#6B778C] hover:text-[#0C66E4]'}`}
                            >
                              <Pencil size={12} strokeWidth={1.5} />
                            </button>
                            <button
                              onClick={() => setElementToDelete(el)}
                              title="Delete"
                              className={`p-1 rounded ${active ? 'text-blue-200 hover:text-white' : 'text-[#6B778C] hover:text-[#BF2600]'}`}
                            >
                              <Trash2 size={12} strokeWidth={1.5} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-[#DFE1E6] px-4 py-3 shrink-0 space-y-2">
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => router.push('/admin')}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-[#6B778C] hover:bg-[#DFE1E6] hover:text-[#172B4D] transition-colors"
            >
              <Users size={15} strokeWidth={1.5} />
              Manage Users
            </button>
          )}
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#172B4D] truncate">{user?.name}</p>
              <p className="text-xs text-[#6B778C] truncate">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="text-[#6B778C] hover:text-[#BF2600] transition-colors ml-2 shrink-0"
            >
              <LogOut size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </aside>

      {elementToDelete && (
        <ConfirmDeleteElementModal
          name={elementToDelete.name}
          count={elementToDelete._count?.testCases ?? 0}
          loading={deleteElement.isPending}
          onCancel={() => setElementToDelete(null)}
          onConfirm={() => confirmDelete(elementToDelete)}
        />
      )}
    </>
  );
}

function ConfirmDeleteElementModal({
  name,
  count,
  loading,
  onCancel,
  onConfirm,
}: {
  name: string;
  count: number;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-white rounded-lg border border-[#DFE1E6] shadow-xl w-full max-w-sm p-6">
        <h3 className="text-[15px] font-semibold text-[#172B4D] mb-1">Delete element</h3>
        <p className="text-sm text-[#6B778C] mb-5">
          Are you sure you want to delete{' '}
          <span className="font-medium text-[#172B4D]">{name}</span>?
          {count > 0 && (
            <span className="block mt-1 text-[#BF2600]">
              This will also permanently delete {count} test case{count !== 1 ? 's' : ''}.
            </span>
          )}
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
