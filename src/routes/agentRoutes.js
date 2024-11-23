const express = require('express');
const router = express.Router();
const directorCurricularAgent = require('../agents/directorCurricularAgent');

// Función para formatear la respuesta
function formatResponse(text) {
    try {
        // Separar las secciones principales
        const sections = text.split(/\d+\.\s+/);
        sections.shift(); // Eliminar el primer elemento vacío

        // Extraer y limpiar las secciones
        const formattedResponse = {
            analisisAlineacion: sections[0]
                ?.replace('Análisis de alineación:', '')
                .split('\n')
                .map(line => line.trim())
                .filter(line => line)
                .join(' '),

            aspectosEspecificos: sections[1]
                ?.replace('Aspectos específicos del material curricular que respaldan o contradicen el contenido:', '')
                .split('\n')
                .map(line => line.trim())
                .filter(line => line)
                .join(' '),

            sugerencias: {
                generales: [],
                educacionFinanciera: []
            }
        };

        // Procesar la sección de sugerencias
        if (sections[2]) {
            const sugerenciasText = sections[2].replace('Sugerencias para mejorar la alineación:', '');
            const sugerenciasParts = sugerenciasText.split('\n\n');

            sugerenciasParts.forEach(part => {
                const items = part
                    .split('*')
                    .map(item => item.trim())
                    .filter(item => item)
                    .map(item => item.replace(/^[-•]\s*/, ''));

                if (part.toLowerCase().includes('educación financiera')) {
                    formattedResponse.sugerencias.educacionFinanciera = items;
                } else {
                    formattedResponse.sugerencias.generales = items;
                }
            });
        }

        return formattedResponse;
    } catch (error) {
        console.error('Error al formatear la respuesta:', error);
        return { error: 'Error al formatear la respuesta', originalText: text };
    }
}

// Ruta para validar contenido
router.post('/validate', async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({
                error: true,
                message: 'Se requiere contenido para validar'
            });
        }

        const validationResult = await directorCurricularAgent.validateContent(content);
        const formattedResult = formatResponse(validationResult);

        // Formatear la respuesta final
        const response = {
            error: false,
            resultado: {
                contenidoAnalizado: content,
                analisis: {
                    alineacionCurricular: formattedResult.analisisAlineacion,
                    aspectosEspecificos: formattedResult.aspectosEspecificos,
                    sugerencias: {
                        mejoras: formattedResult.sugerencias.generales,
                        educacionFinanciera: formattedResult.sugerencias.educacionFinanciera
                    }
                }
            }
        };

        // Enviar respuesta con formato bonito
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response, null, 2));
    } catch (error) {
        console.error('Error en validación:', error);
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
});

// Ruta para recargar la base de conocimientos
router.post('/reload-knowledge', async (req, res) => {
    try {
        const result = await directorCurricularAgent.reloadKnowledgeBase();
        res.json({
            error: false,
            message: result
        });
    } catch (error) {
        console.error('Error al recargar base de conocimientos:', error);
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
});

module.exports = router;
