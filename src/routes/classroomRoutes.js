const express = require('express');
const router = express.Router();
const classroomService = require('../services/google/classroomService');

// Middleware para verificar autenticación
const requireAuth = (req, res, next) => {
    if (!req.session?.tokens) {
        return res.status(401).json({ 
            error: true, 
            message: 'No autenticado',
            authUrl: classroomService.getAuthUrl()
        });
    }
    next();
};

// Ruta para iniciar autenticación
router.get('/auth', (req, res) => {
    const authUrl = classroomService.getAuthUrl();
    res.json({ authUrl });
});

// Callback de autenticación
router.get('/auth/callback', async (req, res) => {
    try {
        const { code } = req.query;
        const tokens = await classroomService.getTokenFromCode(code);
        
        // Guardar tokens en sesión
        req.session.tokens = tokens;
        
        // Configurar credenciales en el servicio
        await classroomService.setCredentials(tokens);
        
        res.json({ success: true, message: 'Autenticación exitosa' });
    } catch (error) {
        console.error('Error en autenticación:', error);
        res.status(500).json({ 
            error: true, 
            message: 'Error en autenticación' 
        });
    }
});

// Obtener cursos
router.get('/courses', requireAuth, async (req, res) => {
    try {
        const courses = await classroomService.listCourses();
        res.json({ courses });
    } catch (error) {
        res.status(500).json({ 
            error: true, 
            message: error.message 
        });
    }
});

// Subir material a un curso
router.post('/courses/:courseId/materials', requireAuth, async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, description, filePath } = req.body;

        // Subir archivo a Drive
        const fileId = await classroomService.uploadPdfToDrive(filePath, title);

        // Crear material en el curso
        const material = await classroomService.createCourseMaterial(
            courseId,
            title,
            description,
            fileId
        );

        res.json({ 
            success: true, 
            material 
        });
    } catch (error) {
        res.status(500).json({ 
            error: true, 
            message: error.message 
        });
    }
});

// Crear tarea
router.post('/courses/:courseId/assignments', requireAuth, async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, description, dueDate } = req.body;

        const assignment = await classroomService.createAssignment(
            courseId,
            title,
            description,
            dueDate ? new Date(dueDate) : null
        );

        res.json({ 
            success: true, 
            assignment 
        });
    } catch (error) {
        res.status(500).json({ 
            error: true, 
            message: error.message 
        });
    }
});

// Obtener estudiantes de un curso
router.get('/courses/:courseId/students', requireAuth, async (req, res) => {
    try {
        const { courseId } = req.params;
        const students = await classroomService.getStudents(courseId);
        res.json({ students });
    } catch (error) {
        res.status(500).json({ 
            error: true, 
            message: error.message 
        });
    }
});

// Obtener profesores de un curso
router.get('/courses/:courseId/teachers', requireAuth, async (req, res) => {
    try {
        const { courseId } = req.params;
        const teachers = await classroomService.getTeachers(courseId);
        res.json({ teachers });
    } catch (error) {
        res.status(500).json({ 
            error: true, 
            message: error.message 
        });
    }
});

module.exports = router;
