import { Router } from 'express';
import {
  createSubmissions,
  getSubmissions,
  getCount,
} from '../controllers/submissionsController';

const router = Router();

// GET /api/submissions/count — must be before /:id routes to avoid conflicts
router.get('/count', getCount);

// GET /api/submissions
router.get('/', getSubmissions);

// POST /api/submissions
router.post('/', createSubmissions);

export default router;
