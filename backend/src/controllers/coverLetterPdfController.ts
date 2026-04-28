import { Request, Response } from 'express';
import { loadCoverLetter } from '../services/coverLetterStorageService';
import { generateCoverLetterPdf } from '../services/pdfService';

export async function exportCoverLetterPdf(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const coverLetter = await loadCoverLetter(id);
  if (!coverLetter) {
    res.status(404).json({ error: 'Cover letter not found' });
    return;
  }

  try {
    const pdf = await generateCoverLetterPdf(coverLetter);
    const filename = `${coverLetter.contact.name || 'cover-letter'}-cover-letter.pdf`.replace(/\s+/g, '-');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdf);
  } catch (err) {
    console.error('Cover letter PDF generation failed:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
}
