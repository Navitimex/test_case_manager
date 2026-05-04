import React from 'react';

export default function Dashboard() {
  const recentRuns = [
    { 
      name: 'Core Authentication Flow', 
      status: 'Passed', 
      time: '12m ago', 
      duration: '45s', 
      dotColor: 'bg-emerald-400', 
      glow: 'shadow-emerald-400/50', 
      badgeBg: 'bg-emerald-400/10', 
      badgeText: 'text-emerald-400', 
      badgeBorder: 'border-emerald-400/20' 
    },
    { 
      name: 'Payment Gateway Integration', 
      status: 'Failed', 
      time: '1h ago', 
      duration: '2m 14s', 
      dotColor: 'bg-rose-400', 
      glow: 'shadow-rose-400/50', 
      badgeBg: 'bg-rose-400/10', 
      badgeText: 'text-rose-400', 
      badgeBorder: 'border-rose-400/20' 
    },
    { 
      name: 'User Profile Settings', 
      status: 'Passed', 
      time: '3h ago', 
      duration: '18s', 
      dotColor: 'bg-emerald-400', 
      glow: 'shadow-emerald-400/50', 
      badgeBg: 'bg-emerald-400/10', 
      badgeText: 'text-emerald-400', 
      badgeBorder: 'border-emerald-400/20' 
    },
    { 
      name: 'Weekly Regression Suite', 
      status: 'Running', 
      time: 'Just now', 
      duration: '...', 
      dotColor: 'bg-indigo-400', 
      glow: 'shadow-indigo-400/50', 
      badgeBg: 'bg-indigo-400/10', 
      badgeText: 'text-indigo-400', 
      badgeBorder: 'border-indigo-400/20' 
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
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
              <button className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Projects
              </button>
              <button className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Runs
              </button>
              <button className="px-4 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-300">
                New Test Run
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              Dashboard Overview
            </h1>
            <p className="text-slate-400">
              Welcome back. Here&apos;s what&apos;s happening with your test suites today.
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Metric Card 1 */}
          <div className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-400 mb-1">Total Tests</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">2,845</span>
                <span className="text-sm text-emerald-400 font-medium">+12%</span>
              </div>
            </div>
          </div>

          {/* Metric Card 2 */}
          <div className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-400 mb-1">Passed</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-emerald-400">2,710</span>
                <span className="text-sm text-emerald-400/80 font-medium">95.2%</span>
              </div>
            </div>
          </div>

          {/* Metric Card 3 */}
          <div className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:border-rose-500/50 hover:shadow-2xl hover:shadow-rose-500/10">
             <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-400 mb-1">Failed</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-rose-400">84</span>
                <span className="text-sm text-rose-400/80 font-medium">2.9%</span>
              </div>
            </div>
          </div>

          {/* Metric Card 4 */}
          <div className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-400 mb-1">Flaky</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-amber-400">51</span>
                <span className="text-sm text-amber-400/80 font-medium">1.9%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl">
          <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Recent Test Runs</h2>
            <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
              View All Runs &rarr;
            </button>
          </div>
          <div className="divide-y divide-slate-800/60">
            {recentRuns.map((run, i) => (
              <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-800/30 transition-colors duration-200">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${run.dotColor} shadow-[0_0_8px_rgba(0,0,0,0)] ${run.glow} animate-pulse`} />
                  <div>
                    <h3 className="text-sm font-medium text-slate-200">{run.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{run.time} &middot; Duration: {run.duration}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 text-xs font-medium rounded-full ${run.badgeBg} ${run.badgeText} border ${run.badgeBorder}`}>
                  {run.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
