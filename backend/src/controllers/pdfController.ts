import { Request, Response } from 'express';
import { loadResume } from '../services/storageService';
import { generatePdf } from '../services/pdfService';

export async function exportPdf(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const resume = await loadResume(id);
  if (!resume) {
    res.status(404).json({ error: 'Resume not found' });
    return;
  }

  try {
    const pdf = await generatePdf(resume);
    const filename = `${resume.contact.name || 'resume'}-resume.pdf`.replace(/\s+/g, '-');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdf);
  } catch (err) {
    console.error('PDF generation failed:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
}
