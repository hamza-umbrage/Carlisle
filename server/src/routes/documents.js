const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const docQueries = require('../queries/documents.queries');
const config = require('../config/env');

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSize },
});

// GET /api/jobs/:jobId/documents
router.get('/:jobId/documents', authenticate, async (req, res, next) => {
  try {
    const result = await docQueries.listJobDocuments(req.params.jobId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs/:jobId/documents
router.post('/:jobId/documents', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { type } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const doc = await docQueries.createJobDocument({
      jobCode: jobId,
      type: type || 'Photo',
      name: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      filePath: req.file.path,
      uploadedBy: req.user.userId,
    });

    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/jobs/:jobId/documents/:docId
router.delete('/:jobId/documents/:docId', authenticate, async (req, res, next) => {
  try {
    const deleted = await docQueries.deleteJobDocument(req.params.docId);
    if (!deleted) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({ message: 'Document deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
