'use client';

import { useEffect, useState } from 'react';
import { GeneratedTestCase, TestCase } from '@/types';
import { UseMutationResult } from '@tanstack/react-query';
import { PRIORITY_OPTIONS } from '@/lib/constants';
import { FormField, inputCls } from '@/components/FormField';
import { testCasesApi } from '@/lib/api';
import { Sparkles, X, Loader2, ArrowLeft, Trash2 } from 'lucide-react';

type ReviewItem = GeneratedTestCase & { _id: number; selected: boolean };

interface GenerateWithAIDrawerProps {
  open: boolean;
  elementId: number | null;
  elementName?: string;
  bulkCreateMut: UseMutationResult<TestCase[], Error, GeneratedTestCase[]>;
  onClose: () => void;
}

export default function GenerateWithAIDrawer({
  open,
  elementId,
  elementName,
  bulkCreateMut,
  onClose,
}: GenerateWithAIDrawerProps) {
  const [phase, setPhase] = useState<'input' | 'review'>('input');
  const [requirements, setRequirements] = useState('');
  const [count, setCount] = useState(6);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setPhase('input');
      setRequirements('');
      setCount(6);
      setItems([]);
      setError('');
      setGenerating(false);
    }
  }, [open]);

  async function handleGenerate() {
    if (elementId === null) return;
    if (!requirements.trim()) {
      setError('Please paste the requirements or user stories first.');
      return;
    }
    setGenerating(true);
    setError('');
    try {
      const { testCases } = await testCasesApi.generate(elementId, {
        requirements: requirements.trim(),
        count,
      });
      if (testCases.length === 0) {
        setError('The model returned no test cases. Try refining the requirements.');
        return;
      }
      setItems(testCases.map((tc, i) => ({ ...tc, _id: i, selected: true })));
      setPhase('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }

  function updateItem(id: number, field: keyof GeneratedTestCase, value: string) {
    setItems((prev) => prev.map((it) => (it._id === id ? { ...it, [field]: value } : it)));
  }

  function toggleItem(id: number) {
    setItems((prev) => prev.map((it) => (it._id === id ? { ...it, selected: !it.selected } : it)));
  }

  function removeItem(id: number) {
    setItems((prev) => prev.filter((it) => it._id !== id));
  }

  async function handleSave() {
    const selected = items.filter((it) => it.selected);
    if (selected.length === 0) {
      setError('Select at least one test case to save.');
      return;
    }
    setError('');
    try {
      const payload: GeneratedTestCase[] = selected.map((it) => ({
        title: it.title,
        description: it.description,
        preconditions: it.preconditions,
        steps: it.steps,
        expectedResult: it.expectedResult,
        priority: it.priority,
      }));
      await bulkCreateMut.mutateAsync(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  }

  const selectedCount = items.filter((it) => it.selected).length;

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-30 transition-opacity" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 right-0 h-screen w-[680px] max-w-full bg-white shadow-xl z-40 flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#DFE1E6] shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#0C66E4]" strokeWidth={2} />
            <h2 className="text-[15px] font-semibold text-[#172B4D]">Generate Test Cases with AI</h2>
          </div>
          <button onClick={onClose} className="text-[#6B778C] hover:text-[#172B4D] transition-colors">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <p className="text-sm text-[#BF2600] bg-[#FFEBE6] px-3 py-2 rounded mb-4">{error}</p>
          )}

          {phase === 'input' ? (
            <div className="space-y-4">
              <p className="text-sm text-[#6B778C]">
                Paste the requirements or user stories for{' '}
                <span className="font-medium text-[#172B4D]">{elementName ?? 'this element'}</span>. The AI
                will propose test cases for you to review before saving.
              </p>

              <FormField label="Requirements / User Stories">
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={12}
                  placeholder={
                    'e.g. As a user, I want to sign in with my email and password so I can access my dashboard. Password must be at least 8 characters. Show an error on invalid credentials...'
                  }
                  className={inputCls}
                />
              </FormField>

              <FormField label="Number of test cases">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={count}
                  onChange={(e) =>
                    setCount(Math.min(Math.max(parseInt(e.target.value, 10) || 1, 1), 20))
                  }
                  className={`${inputCls} w-28`}
                />
              </FormField>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-[#6B778C]">
                {items.length} proposed · {selectedCount} selected. Review, edit, or uncheck before saving.
              </p>

              {items.map((it) => (
                <div
                  key={it._id}
                  className={`border rounded-lg p-4 transition-colors ${
                    it.selected ? 'border-[#0C66E4] bg-white' : 'border-[#DFE1E6] bg-[#F4F5F7] opacity-70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={it.selected}
                      onChange={() => toggleItem(it._id)}
                      className="mt-1 accent-[#0C66E4] w-4 h-4 shrink-0"
                    />

                    <div className="flex-1 space-y-3 min-w-0">
                      <input
                        value={it.title}
                        onChange={(e) => updateItem(it._id, 'title', e.target.value)}
                        className={`${inputCls} font-medium`}
                        placeholder="Title"
                      />

                      <div className="grid grid-cols-[1fr_130px] gap-3">
                        <textarea
                          value={it.steps}
                          onChange={(e) => updateItem(it._id, 'steps', e.target.value)}
                          rows={4}
                          placeholder="Steps"
                          className={inputCls}
                        />
                        <select
                          value={it.priority}
                          onChange={(e) => updateItem(it._id, 'priority', e.target.value)}
                          className={`${inputCls} self-start`}
                        >
                          {PRIORITY_OPTIONS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>

                      <textarea
                        value={it.expectedResult}
                        onChange={(e) => updateItem(it._id, 'expectedResult', e.target.value)}
                        rows={2}
                        placeholder="Expected result"
                        className={inputCls}
                      />
                    </div>

                    <button
                      onClick={() => removeItem(it._id)}
                      className="text-[#6B778C] hover:text-[#BF2600] transition-colors p-1 shrink-0"
                      title="Discard"
                    >
                      <Trash2 size={15} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-[#DFE1E6] px-6 py-4 flex justify-between items-center shrink-0">
          {phase === 'review' ? (
            <button
              type="button"
              onClick={() => setPhase('input')}
              className="flex items-center gap-1.5 text-sm text-[#42526E] hover:text-[#172B4D] transition-colors"
            >
              <ArrowLeft size={15} strokeWidth={1.5} /> Back
            </button>
          ) : (
            <span />
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#42526E] border border-[#DFE1E6] rounded-md hover:bg-[#F4F5F7] transition-colors"
            >
              Cancel
            </button>

            {phase === 'input' ? (
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-4 py-2 text-sm bg-[#0C66E4] text-white rounded-md hover:bg-[#0052CC] disabled:opacity-60 transition-colors flex items-center gap-2"
              >
                {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} strokeWidth={2} />}
                {generating ? 'Generating…' : 'Generate'}
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={bulkCreateMut.isPending || selectedCount === 0}
                className="px-4 py-2 text-sm bg-[#0C66E4] text-white rounded-md hover:bg-[#0052CC] disabled:opacity-60 transition-colors flex items-center gap-2"
              >
                {bulkCreateMut.isPending && <Loader2 size={14} className="animate-spin" />}
                Save selected ({selectedCount})
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

