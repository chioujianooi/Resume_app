import { useRef, useEffect, useCallback } from 'react';

function toHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
}

function fromHtml(html: string): string {
  return html
    .replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<b>([\s\S]*?)<\/b>/gi, '**$1**')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<div>/gi, '\n')
    .replace(/<\/div>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function BulletEditor({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const skipSync = useRef(false);

  // Sync external value → innerHTML, but skip when the change came from user typing
  useEffect(() => {
    if (!ref.current) return;
    if (skipSync.current) {
      skipSync.current = false;
      return;
    }
    ref.current.innerHTML = toHtml(value);
  }, [value]);

  const sync = useCallback(() => {
    if (!ref.current) return;
    skipSync.current = true;
    onChange(fromHtml(ref.current.innerHTML));
  }, [onChange]);

  const applyBold = useCallback(() => {
    ref.current?.focus();
    document.execCommand('bold');
    sync();
  }, [sync]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      applyBold();
    }
  }, [applyBold]);

  return (
    <div className="flex-1 flex flex-col gap-1">
      <style>{`.bullet-editor:empty::before{content:attr(data-placeholder);color:#94a3b8;pointer-events:none}`}</style>
      <div className="flex gap-1">
        <button
          type="button"
          title="Bold (Ctrl+B)"
          onMouseDown={e => { e.preventDefault(); applyBold(); }}
          className="px-1.5 py-0.5 text-xs font-bold border border-slate-300 rounded hover:bg-slate-100 text-slate-600 leading-none"
        >B</button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={sync}
        onKeyDown={handleKeyDown}
        className="bullet-editor w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[2.5rem]"
      />
    </div>
  );
}
