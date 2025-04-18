import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';
import { adminAuth } from '../middleware/auth';

const router = express.Router();

// Configure multer for PDF upload
const uploadDir = path.join(__dirname, '../../uploads/pdf');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('Only PDF files are allowed'));
      return;
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Upload PDF endpoint
router.post('/upload-pdf', adminAuth, upload.single('pdf'), async (req, res) => {
  try {
    const file = req.file;
    const { templateName, description } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    const template = await prisma.template.create({
      data: {
        template_name: templateName,
        template_type: '', // Empty string as requested
        pdfPath: file.filename,
        template_desc: description || null,
        template_baseconfig: {}, // Empty object as requested
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    res.status(201).json({
      message: 'PDF uploaded successfully',
      template
    });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).json({ error: 'Failed to upload PDF' });
  }
});

// Get all templates
router.get('/', async (_req, res) => {
  try {
    const templates = await prisma.template.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

export default router; 