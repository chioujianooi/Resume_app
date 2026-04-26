import React from 'react';

export function parseBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? React.createElement('strong', { key: i }, part.slice(2, -2))
      : part
  );
}
