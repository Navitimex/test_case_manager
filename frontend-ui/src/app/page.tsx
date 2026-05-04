'use client';

import React, { useState, useEffect } from 'react';

interface TestCaseStep {
  id?: number;
  order: number;
  description: string;
  expectedResult: string;
  actualResult: string;
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
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [severity, setSeverity] = useState('minor');
  const [status, setStatus] = useState('pending');
  const [steps, setSteps] = useState<TestCaseStep[]>([]);

  const checkHealth = async (url: string) => {
    try {
      setBackendStatus('checking');
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000); // 3s timeout
      
      const base = url.split('/api')[0];
      const res = await fetch(`${base}/health`, { signal: controller.signal });
      clearTimeout(id);
      
      if (res.ok) {
        setBackendStatus('online');
        return true;
      }
    } catch (e) {
      console.error('Health check failed', e);
    }
    setBackendStatus('offline');
    return false;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const port = 4000;
      const newUrl = `http://${hostname}:${port}/api/testcases`;
      setApiUrl(newUrl);
      checkHealth(newUrl);
    }
  }, []);

  const fetchCases = async () => {
    if (!apiUrl) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setTestCases(data);
    } catch (error: any) {
      console.error('Fetch error:', error);
      setError(`Error de conexión: No se pudo obtener datos de ${apiUrl}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apiUrl) {
      fetchCases();
    }
  }, [apiUrl]);

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
      setPriority('medium');
      setSeverity('minor');
      setStatus('pending');
      setSteps([{ order: 1, description: '', expectedResult: '', actualResult: '' }]);
    }
    setIsFormOpen(true);
  };

  const closeForm = () => setIsFormOpen(false);

  const handleStepChange = (index: number, field: keyof TestCaseStep, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const addStep = () => {
    setSteps([...steps, { order: steps.length + 1, description: '', expectedResult: '', actualResult: '' }]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const saveCase = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      description,
      priority,
      severity,
      status,
      steps: steps.filter(s => s.description.trim() !== ''),
    };

    try {
      let res;
      if (editingCase && editingCase.id) {
        res = await fetch(`${apiUrl}/${editingCase.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save test case');
      }
      
      closeForm();
      fetchCases();
    } catch (error: any) {
      console.error('Save error:', error);
      alert(`Error al guardar: ${error.message}`);
    }
  };

  const deleteCase = async (id: number) => {
    if (!confirm('Are you sure you want to delete this test case?')) return;
    try {
      const res = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete test case');
      fetchCases();
    } catch (error: any) {
      console.error('Delete error:', error);
      alert('Error al eliminar el caso.');
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pass': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'fail': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case 'skipped': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
    }
  };

  const totalCases = testCases.length;
  const passedCases = testCases.filter(tc => tc.status === 'pass').length;
  const failedCases = testCases.filter(tc => tc.status === 'fail').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 pb-12">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-slate-950/80 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                TestFlow
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div 
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors"
                onClick={() => apiUrl && checkHealth(apiUrl)}
                title={`API URL: ${apiUrl}`}
              >
                <div className={`w-2 h-2 rounded-full ${backendStatus === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : backendStatus === 'offline' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'}`}></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {backendStatus === 'checking' ? 'Checking...' : `API ${backendStatus}`}
                </span>
              </div>
              <button 
                onClick={() => openForm()}
                className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all duration-300 shadow-lg shadow-indigo-500/20"
              >
                + New Test Case
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Test Cases Management
          </h1>
          <p className="text-slate-400">
            View, create, and manage your test cases and execution steps.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <p className="text-sm font-medium text-slate-400 mb-1">Total Cases</p>
            <span className="text-4xl font-bold text-white">{totalCases}</span>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <p className="text-sm font-medium text-slate-400 mb-1">Passed</p>
            <span className="text-4xl font-bold text-emerald-400">{passedCases}</span>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <p className="text-sm font-medium text-slate-400 mb-1">Failed</p>
            <span className="text-4xl font-bold text-rose-400">{failedCases}</span>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl">
          <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">All Test Cases</h2>
            {loading && <span className="text-sm text-indigo-400 animate-pulse">Loading...</span>}
            {error && <span className="text-sm text-rose-400 font-medium">{error}</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/60 bg-slate-800/30 text-sm font-medium text-slate-400">
                  <th className="p-4">ID</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Steps</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {testCases.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No test cases found. Create one to get started!
                    </td>
                  </tr>
                ) : (
                  testCases.map((tc) => (
                    <tr key={tc.id} className="hover:bg-slate-800/30 transition-colors duration-200">
                      <td className="p-4 text-slate-400">#{tc.id}</td>
                      <td className="p-4 text-slate-200 font-medium">{tc.title}</td>
                      <td className="p-4 text-slate-400 capitalize">{tc.priority}</td>
                      <td className="p-4 text-slate-400 capitalize">{tc.severity}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(tc.status)} capitalize`}>
                          {tc.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{tc.steps?.length || 0} steps</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => openForm(tc)}
                          className="text-indigo-400 hover:text-indigo-300 mr-4 font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => tc.id && deleteCase(tc.id)}
                          className="text-rose-400 hover:text-rose-300 font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Create / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl my-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-xl font-bold text-white">
                {editingCase ? 'Edit Test Case' : 'New Test Case'}
              </h2>
              <button onClick={closeForm} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="tc-form" onSubmit={saveCase} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-300">Title</label>
                    <input 
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      placeholder="e.g., Verify Login functionality"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-300">Description</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors h-24 resize-none"
                      placeholder="Brief description of what this case tests..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Priority</label>
                    <select 
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Severity</label>
                    <select 
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="blocker">Blocker</option>
                      <option value="major">Major</option>
                      <option value="minor">Minor</option>
                      <option value="trivial">Trivial</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Status</label>
                    <select 
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="pending">Pending</option>
                      <option value="pass">Pass</option>
                      <option value="fail">Fail</option>
                      <option value="skipped">Skipped</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800/60">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Execution Steps</h3>
                    <button 
                      type="button"
                      onClick={addStep}
                      className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      + Add Step
                    </button>
                  </div>

                  <div className="space-y-4">
                    {steps.map((step, index) => (
                      <div key={index} className="flex gap-4 items-start bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-3">
                          <input 
                            required
                            placeholder="Step description (e.g. Click login button)"
                            value={step.description}
                            onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                          <input 
                            placeholder="Expected Result (optional)"
                            value={step.expectedResult || ''}
                            onChange={(e) => handleStepChange(index, 'expectedResult', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeStep(index)}
                          className="text-rose-400 hover:text-rose-300 p-2 shrink-0"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {steps.length === 0 && (
                      <p className="text-center text-slate-500 text-sm py-4">No steps added yet.</p>
                    )}
                  </div>
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={closeForm}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="tc-form"
                className="px-6 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all duration-300 shadow-lg shadow-indigo-500/20"
              >
                {editingCase ? 'Save Changes' : 'Create Case'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
