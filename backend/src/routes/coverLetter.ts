import { Router } from 'express';
import {
  createCoverLetter,
  getCoverLetter,
  getCoverLetters,
  updateCoverLetter,
  removeCoverLetter,
} from '../controllers/coverLetterController';
import { exportCoverLetterPdf } from '../controllers/coverLetterPdfController';

const router = Router();

router.post('/cover-letters', createCoverLetter);
router.get('/cover-letters', getCoverLetters);
router.get('/cover-letters/:id/pdf', exportCoverLetterPdf);
router.get('/cover-letters/:id', getCoverLetter);
router.put('/cover-letters/:id', updateCoverLetter);
router.delete('/cover-letters/:id', removeCoverLetter);

export default router;
