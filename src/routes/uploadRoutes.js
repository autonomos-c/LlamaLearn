const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configuración de multer con rutas absolutas
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Sanitizar el nombre del archivo
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${sanitizedName}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Límite de 10MB
  }
});

// Ruta para subir archivos
router.post('/upload', (req, res) => {
  upload.array('pdfs', 10)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        // Error de Multer
        return res.status(400).json({
          error: true,
          message: err.code === 'LIMIT_FILE_SIZE' 
            ? 'El archivo es demasiado grande. Máximo 10MB.'
            : err.message
        });
      }
      // Otro tipo de error
      return res.status(400).json({
        error: true,
        message: err.message
      });
    }

    // Si no hay archivos
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'No se seleccionaron archivos'
      });
    }

    // Éxito
    res.status(200).json({
      error: false,
      message: 'Archivos subidos exitosamente',
      files: req.files.map(file => ({
        filename: file.filename,
        size: file.size
      }))
    });
  });
});

// Ruta para listar archivos
router.get('/files', (req, res) => {
  const fs = require('fs');
  const uploadsPath = path.join(__dirname, '../../uploads');
  
  fs.readdir(uploadsPath, (err, files) => {
    if (err) {
      return res.status(500).json({
        error: true,
        message: 'Error al leer los archivos'
      });
    }

    const pdfFiles = files.filter(file => file.endsWith('.pdf'));
    res.json({
      error: false,
      files: pdfFiles
    });
  });
});

module.exports = router;
