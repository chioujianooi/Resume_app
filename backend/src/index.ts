import express from 'express';
import cors from 'cors';
import resumeRoutes from './routes/resume';
import { closeBrowser } from './services/pdfService';

const app = express();
const PORT = process.env.PORT || 3010;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/api', resumeRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

process.on('SIGTERM', async () => {
  await closeBrowser();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await closeBrowser();
  process.exit(0);
});
