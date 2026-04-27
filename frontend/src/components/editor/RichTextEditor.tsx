import { useRef, useEffect, useCallback } from 'react';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const skipSync = useRef(false);

  useEffect(() => {
    if (!ref.current || skipSync.current) { skipSync.current = false; return; }
    ref.current.innerHTML = value;
  }, [value]);

  const sync = useCallback(() => {
    if (!ref.current) return;
    skipSync.current = true;
    onChange(ref.current.innerHTML);
  }, [onChange]);

  const cmd = useCallback((command: string) => {
    ref.current?.focus();
    document.execCommand(command);
    sync();
  }, [sync]);

  return (
    <div className="flex-1 flex flex-col gap-1">
      <style>{`.rte:empty::before{content:attr(data-placeholder);color:#94a3b8;pointer-events:none}.rte ul{list-style-type:disc;padding-left:20px;margin:2px 0}.rte ol{list-style-type:decimal;padding-left:20px;margin:2px 0}.rte li{margin-bottom:2px}`}</style>
      <div className="flex gap-1">
        <button type="button" title="Bold (Ctrl+B)"
          onMouseDown={e => { e.preventDefault(); cmd('bold'); }}
          className="px-1.5 py-0.5 text-xs font-bold border border-slate-300 rounded hover:bg-slate-100 text-slate-600 leading-none">B</button>
        <button type="button" title="Bullet List"
          onMouseDown={e => { e.preventDefault(); cmd('insertUnorderedList'); }}
          className="px-1.5 py-0.5 text-xs border border-slate-300 rounded hover:bg-slate-100 text-slate-600 leading-none">• List</button>
        <button type="button" title="Numbered List"
          onMouseDown={e => { e.preventDefault(); cmd('insertOrderedList'); }}
          className="px-1.5 py-0.5 text-xs border border-slate-300 rounded hover:bg-slate-100 text-slate-600 leading-none">1. List</button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={sync}
        onKeyDown={e => { if (e.ctrlKey && e.key === 'b') { e.preventDefault(); cmd('bold'); } }}
        className="rte w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[6rem]"
      />
    </div>
  );
}
