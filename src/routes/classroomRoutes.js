const express = require('express');
const router = express.Router();
const classroomService = require('../services/google/classroomService');
const credentials = require('../config/credentials/google-credentials');

router.post('/init', (req, res) => {
    try {
        console.log('Iniciando autenticación de Google Classroom');
        classroomService.initialize(credentials);
        const authUrl = classroomService.getAuthUrl();
        console.log('URL de autenticación generada:', authUrl);
        res.json({ authUrl });
    } catch (error) {
        console.error('Error en /init:', error);
        res.status(500).json({ error: 'Error al inicializar Classroom' });
    }
});

router.get('/oauth2callback', async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
        console.error('No se proporcionó código de autorización');
        return res.status(400).json({ error: 'Código no proporcionado' });
    }

    try {
        console.log('Procesando callback con código:', code);
        await classroomService.getToken(code);
        res.redirect('http://localhost:8501');
    } catch (error) {
        console.error('Error en callback OAuth:', error);
        res.status(500).json({ error: 'Error en autenticación' });
    }
});

router.get('/auth-status', (req, res) => {
    try {
        const isAuthenticated = classroomService.isAuthenticated();
        console.log('Estado de autenticación:', isAuthenticated);
        res.json({ isAuthenticated });
    } catch (error) {
        console.error('Error al verificar autenticación:', error);
        res.status(500).json({ error: 'Error al verificar autenticación' });
    }
});

router.get('/courses', async (req, res) => {
    try {
        await classroomService.refreshTokenIfNeeded();
        console.log('Obteniendo lista de cursos');
        const courses = await classroomService.listCourses();
        console.log('Cursos obtenidos:', courses);
        res.json({ courses });
    } catch (error) {
        console.error('Error al listar cursos:', error);
        res.status(500).json({ error: 'Error al obtener cursos' });
    }
});

module.exports = router;
