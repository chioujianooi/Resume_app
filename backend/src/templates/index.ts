import { TemplateId, TemplateMetadata, ResumeData } from '@resume-app/shared';
import { renderClassic } from './classic';
import { renderModern } from './modern';
import { renderMinimal } from './minimal';

export const TEMPLATES: TemplateMetadata[] = [
  { id: 'classic', name: 'Classic', description: 'Traditional serif layout with clean section dividers' },
  { id: 'modern', name: 'Modern', description: 'Two-column layout with a bold navy sidebar' },
  { id: 'minimal', name: 'Minimal', description: 'Airy single-column with generous whitespace' },
];

export function renderTemplate(data: ResumeData, templateId: TemplateId): string {
  switch (templateId) {
    case 'modern': return renderModern(data);
    case 'minimal': return renderMinimal(data);
    case 'classic':
    default: return renderClassic(data);
  }
}
