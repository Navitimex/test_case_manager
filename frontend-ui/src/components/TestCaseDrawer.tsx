'use client';

import { useEffect, useState } from 'react';
import { TestCase, TestCaseFormData } from '@/types';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '@/lib/constants';
import { FormField, inputCls } from '@/components/FormField';
import { X, Loader2 } from 'lucide-react';

const EMPTY_FORM: TestCaseFormData = {
  title: '',
  description: '',
  preconditions: '',
  steps: '',
  expectedResult: '',
  status: 'DRAFT',
  priority: 'Medium',
};

interface TestCaseDrawerProps {
  open: boolean;
  editingCase: TestCase | null;
  onClose: () => void;
  onSave: (data: TestCaseFormData) => Promise<void>;
}

export default function TestCaseDrawer({ open, editingCase, onClose, onSave }: TestCaseDrawerProps) {
  const [form, setForm] = useState<TestCaseFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingCase) {
      setForm({
        title: editingCase.title,
        description: editingCase.description ?? '',
        preconditions: editingCase.preconditions ?? '',
        steps: editingCase.steps,
        expectedResult: editingCase.expectedResult,
        status: editingCase.status,
        priority: editingCase.priority,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError('');
  }, [editingCase, open]);

  function set(field: keyof TestCaseFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.steps.trim() || !form.expectedResult.trim()) {
      setError('Title, Steps, and Expected Result are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30 transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-screen w-[520px] bg-white shadow-xl z-40 flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#DFE1E6] shrink-0">
          <h2 className="text-[15px] font-semibold text-[#172B4D]">
            {editingCase ? 'Edit Test Case' : 'New Test Case'}
          </h2>
          <button onClick={onClose} className="text-[#6B778C] hover:text-[#172B4D] transition-colors">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && (
            <p className="text-sm text-[#BF2600] bg-[#FFEBE6] px-3 py-2 rounded">{error}</p>
          )}

          <FormField label="Title *">
            <input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Verify Sign In button is visible"
              className={inputCls}
            />
          </FormField>

          <FormField label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={2}
              className={inputCls}
            />
          </FormField>

          <FormField label="Preconditions">
            <textarea
              value={form.preconditions}
              onChange={(e) => set('preconditions', e.target.value)}
              rows={2}
              placeholder="e.g. User must be logged out"
              className={inputCls}
            />
          </FormField>

          <FormField label="Steps *">
            <textarea
              value={form.steps}
              onChange={(e) => set('steps', e.target.value)}
              rows={4}
              placeholder={"1. Navigate to homepage\n2. Click Sign In button"}
              className={inputCls}
            />
          </FormField>

          <FormField label="Expected Result *">
            <textarea
              value={form.expectedResult}
              onChange={(e) => set('expectedResult', e.target.value)}
              rows={3}
              className={inputCls}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Status">
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className={inputCls}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Priority">
              <select
                value={form.priority}
                onChange={(e) => set('priority', e.target.value)}
                className={inputCls}
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </FormField>
          </div>
        </form>

        <div className="border-t border-[#DFE1E6] px-6 py-4 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#42526E] border border-[#DFE1E6] rounded-md hover:bg-[#F4F5F7] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 text-sm bg-[#0C66E4] text-white rounded-md hover:bg-[#0052CC] disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {editingCase ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </aside>
    </>
  );
}
