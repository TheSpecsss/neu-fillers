import express from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';
import { adminAuth } from '../middleware/auth';
import { fromPath } from 'pdf2pic';
import sharp from 'sharp';

const router = express.Router();

// Configure multer for PDF upload
const uploadDir = path.join(__dirname, '../../uploads/pdf');
const thumbnailsDir = path.join(__dirname, '../../uploads/thumbnails');

// Create uploads directories if they don't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
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
router.post('/upload-pdf', adminAuth, upload.single('pdf'), async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    const { templateName, description } = req.body;

    if (!file) {
      res.status(400).json({ error: 'No PDF file provided' });
      return;
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
router.get('/', async (_req: Request, res: Response): Promise<void> => {
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

// Get template thumbnail
router.get('/:id/thumbnail', async (req: Request, res: Response): Promise<void> => {
  try {
    const template = await prisma.template.findUnique({
      where: { template_id: Number.parseInt(req.params.id) }
    });

    if (!template || !template.pdfPath) {
      res.status(404).json({ error: 'Template or PDF not found' });
      return;
    }

    const pdfPath = path.join(uploadDir, template.pdfPath);
    const tempFullImagePath = path.join(thumbnailsDir, `${path.parse(template.pdfPath).name}.1.jpg`);
    const thumbnailPath = path.join(thumbnailsDir, `${path.parse(template.pdfPath).name}.thumb.jpg`);

    // Check if cropped thumbnail already exists
    if (fs.existsSync(thumbnailPath)) {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Content-Type', 'image/jpeg');
      res.sendFile(thumbnailPath);
      return;
    }

    // Generate full page image temporarily
    const options = {
      density: 100,
      saveFilename: path.parse(template.pdfPath).name,
      savePath: thumbnailsDir,
      format: "jpg",
      width: 300,
      height: 400
    };

    const convert = fromPath(pdfPath, options);
    await convert(1);
    await new Promise(resolve => setTimeout(resolve, 100));

    // Crop the image to keep only top 30%
    await sharp(tempFullImagePath)
      .metadata()
      .then(metadata => {
        const height = metadata.height || 400;
        return sharp(tempFullImagePath)
          .extract({ 
            left: 0, 
            top: 0, 
            width: metadata.width || 300, 
            height: Math.floor(height * 0.3) 
          })
          .toFile(thumbnailPath);
      });

    // Delete the temporary full page image
    try {
      fs.unlinkSync(tempFullImagePath);
    } catch (err) {
      console.error('Error deleting temporary full page image:', err);
    }

    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Content-Type', 'image/jpeg');
    res.sendFile(thumbnailPath);
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    res.status(500).json({ error: 'Failed to generate thumbnail' });
  }
});

// Edit template
router.put('/:id', adminAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const templateId = Number.parseInt(req.params.id);
    const { templateName, description } = req.body;

    const template = await prisma.template.update({
      where: { template_id: templateId },
      data: {
        template_name: templateName,
        template_desc: description || null,
        updatedAt: new Date()
      }
    });

    res.json({
      message: 'Template updated successfully',
      template
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Delete template
router.delete('/:id', adminAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const templateId = Number.parseInt(req.params.id);
    
    // Get template info first to get the file paths
    const template = await prisma.template.findUnique({
      where: { template_id: templateId }
    });

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    // Delete the template from database
    await prisma.template.delete({
      where: { template_id: templateId }
    });

    // Delete the PDF file
    if (template.pdfPath) {
      const pdfPath = path.join(uploadDir, template.pdfPath);
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    // Delete the thumbnail
    const thumbnailPath = path.join(thumbnailsDir, `${path.parse(template.pdfPath || '').name}.thumb.jpg`);
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

export default router; 