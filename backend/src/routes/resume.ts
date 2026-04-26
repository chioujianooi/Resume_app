import { Router } from 'express';
import { createResume, getResume, getResumes, updateResume, removeResume } from '../controllers/resumeController';
import { exportPdf } from '../controllers/pdfController';
import { TEMPLATES } from '../templates';

const router = Router();

router.post('/resumes', createResume);
router.get('/resumes', getResumes);
router.get('/resumes/:id', getResume);
router.put('/resumes/:id', updateResume);
router.delete('/resumes/:id', removeResume);
router.get('/resumes/:id/pdf', exportPdf);
router.get('/templates', (_req, res) => res.json(TEMPLATES));

export default router;
