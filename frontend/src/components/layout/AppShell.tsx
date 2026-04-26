import React from 'react';

interface AppShellProps {
  editor: React.ReactNode;
  preview: React.ReactNode;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
}

export default function AppShell({ editor, preview, headerLeft, headerRight }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Left panel — editor */}
      <div className="w-[42%] min-w-[400px] flex flex-col overflow-hidden border-r border-slate-200 bg-white">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-white">
          {headerLeft ?? <span className="font-semibold text-slate-800 text-lg">Resume Builder</span>}
          {headerRight ?? <span className="text-xs text-slate-400">Auto-saves</span>}
        </div>
        <div className="flex-1 overflow-y-auto">
          {editor}
        </div>
      </div>

      {/* Right panel — preview */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
        {preview}
      </div>
    </div>
  );
}
