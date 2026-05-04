'use client';

import React, { useState, useEffect } from 'react';

interface TestCaseStep {
  id?: number;
  order: number;
  description: string;
  expectedResult: string;
}

interface TestCase {
  id?: number;
  title: string;
  description: string;
  priority: string;
  severity: string;
  status: string;
  steps: TestCaseStep[];
}

export default function Dashboard() {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<TestCase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [severity, setSeverity] = useState('minor');
  const [status, setStatus] = useState('pending');
  const [steps, setSteps] = useState<TestCaseStep[]>([]);

  useEffect(() => {
    const hostname = window.location.hostname;
    setApiUrl(`http://${hostname}:4000/api/testcases`);
  }, []);

  const fetchCases = async () => {
    if (!apiUrl) return;
    try {
      setLoading(true);
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setTestCases(data);
      setError(null);
    } catch (err) {
      setError('Could not connect to API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apiUrl) fetchCases();
  }, [apiUrl]);

  const saveCase = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { title, description, priority, severity, status, steps };

    try {
      // 4. FRONTEND FETCH: Correct Full URL, Methods, and Headers
      const res = await fetch(editingCase ? `${apiUrl}/${editingCase.id}` : apiUrl, {
        method: editingCase ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Save failed');
      setIsFormOpen(false);
      fetchCases();
    } catch (err) {
      alert('Error saving test case. Check backend logs.');
    }
  };

  const deleteCase = async (id: number) => {
    if (!confirm('Delete?')) return;
    try {
      const res = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      fetchCases();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const openForm = (tc?: TestCase) => {
    if (tc) {
      setEditingCase(tc);
      setTitle(tc.title);
      setDescription(tc.description || '');
      setPriority(tc.priority);
      setSeverity(tc.severity);
      setStatus(tc.status);
      setSteps(tc.steps || []);
    } else {
      setEditingCase(null);
      setTitle('');
      setDescription('');
      setSteps([{ order: 1, description: '', expectedResult: '' }]);
    }
    setIsFormOpen(true);
  };

  const handleStepChange = (index: number, field: keyof TestCaseStep, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">TestFlow Manager</h1>
          <button 
            onClick={() => openForm()}
            className="bg-indigo-600 px-6 py-2 rounded-full font-bold hover:bg-indigo-500 transition-all"
          >
            + New Test Case
          </button>
        </div>

        {error && <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl mb-6">{error}</div>}

        <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 text-slate-400 text-sm">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {testCases.map(tc => (
                <tr key={tc.id} className="hover:bg-slate-800/30 transition-all">
                  <td className="p-4 font-medium">{tc.title}</td>
                  <td className="p-4 uppercase text-xs font-bold">{tc.priority}</td>
                  <td className="p-4 capitalize text-indigo-400">{tc.status}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => openForm(tc)} className="text-indigo-400 mr-4">Edit</button>
                    <button onClick={() => tc.id && deleteCase(tc.id)} className="text-rose-400">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">{editingCase ? 'Edit Case' : 'New Case'}</h2>
            <form onSubmit={saveCase} className="space-y-4">
              <input 
                required placeholder="Title" value={title} onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl"
              />
              <textarea 
                placeholder="Description" value={description} onChange={e => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl h-24"
              />
              <div className="grid grid-cols-2 gap-4">
                <select value={priority} onChange={e => setPriority(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select value={status} onChange={e => setStatus(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                  <option value="pending">Pending</option>
                  <option value="pass">Pass</option>
                  <option value="fail">Fail</option>
                </select>
              </div>
              
              <div className="pt-4">
                <h3 className="font-bold mb-2">Steps</h3>
                {steps.map((s, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input 
                      placeholder="Step description" value={s.description} 
                      onChange={e => handleStepChange(i, 'description', e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 p-2 rounded-lg text-sm"
                    />
                  </div>
                ))}
                <button 
                  type="button" onClick={() => setSteps([...steps, { order: steps.length + 1, description: '', expectedResult: '' }])}
                  className="text-indigo-400 text-sm font-bold"
                >
                  + Add Step
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2">Cancel</button>
                <button type="submit" className="bg-indigo-600 px-8 py-2 rounded-xl font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
