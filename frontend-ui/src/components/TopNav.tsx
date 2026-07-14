'use client';

import { useAppStore } from '@/store/useAppStore';
import { Search } from 'lucide-react';

interface TopNavProps {
  elementName?: string;
}

export default function TopNav({ elementName }: TopNavProps) {
  const { user, searchQuery, setSearchQuery } = useAppStore();

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?';

  return (
    <header className="fixed top-0 left-[260px] right-0 h-16 bg-white border-b border-[#DFE1E6] flex items-center justify-between px-8 z-10">
      {/* Breadcrumbs */}
      <nav className="text-sm text-[#6B778C]">
        <span>TestFlow</span>
        <span className="mx-1.5">/</span>
        <span>Elements</span>
        {elementName && (
          <>
            <span className="mx-1.5">/</span>
            <span className="text-[#172B4D] font-medium">{elementName}</span>
          </>
        )}
      </nav>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search
            size={14}
            strokeWidth={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B778C]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search test cases…"
            className="pl-8 pr-3 py-1.5 text-sm bg-[#F4F5F7] border border-[#DFE1E6] rounded-md text-[#172B4D] focus:outline-none focus:border-[#0C66E4] w-48"
          />
        </div>

        {/* Avatar */}
        <div
          title={user?.email}
          className="w-8 h-8 rounded-full bg-[#0C66E4] flex items-center justify-center text-white text-xs font-semibold select-none"
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
