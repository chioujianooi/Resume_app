import { useState, useRef } from 'react';

interface ResumeNameInputProps {
  name: string;
  onRename: (name: string) => void;
}

export default function ResumeNameInput({ name, onRename }: ResumeNameInputProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFocus() {
    setValue(name);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commit() {
    setEditing(false);
    const trimmed = value.trim();
    if (trimmed !== name) onRename(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') inputRef.current?.blur();
    if (e.key === 'Escape') {
      setValue(name);
      setEditing(false);
    }
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={editing ? value : name}
      placeholder="Untitled Resume"
      maxLength={80}
      className="bg-transparent border-none outline-none font-semibold text-slate-800 text-lg
        placeholder:text-slate-400 hover:underline focus:underline decoration-slate-300
        underline-offset-2 w-48 truncate cursor-pointer focus:cursor-text"
      onFocus={handleFocus}
      onChange={e => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
    />
  );
}
