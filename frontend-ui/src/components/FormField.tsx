export const inputCls =
  'w-full text-sm px-3 py-2 rounded-md border border-[#DFE1E6] text-[#172B4D] bg-white focus:outline-none focus:border-[#0C66E4] transition-colors resize-none';

export function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#6B778C] uppercase tracking-wide mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
