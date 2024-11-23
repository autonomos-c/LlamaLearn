const { generateTextFromAiMl } = require("../services/aiService");
const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');

class DirectorCurricularAgent {
  constructor() {
    this.knowledgeBase = '';
    this.pdfCacheDir = path.join(__dirname, '../../uploads');
  }

  async loadPdfContent(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      console.error(`Error loading PDF ${filePath}:`, error.message);
      return '';
    }
  }

  async loadAllPdfs() {
    try {
      const files = await fs.readdir(this.pdfCacheDir);
      const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
      
      const contents = await Promise.all(
        pdfFiles.map(async file => {
          const filePath = path.join(this.pdfCacheDir, file);
          const content = await this.loadPdfContent(filePath);
          return `[${file}]: ${content}`;
        })
      );

      this.knowledgeBase = contents.join('\n\n');
      console.log(`Loaded ${pdfFiles.length} PDF files as knowledge base`);
    } catch (error) {
      console.error("Error loading PDFs:", error.message);
      throw new Error("Failed to load PDF knowledge base.");
    }
  }

  async validateContent(prompt) {
    try {
      // Cargar PDFs si aún no se han cargado
      if (!this.knowledgeBase) {
        await this.loadAllPdfs();
      }

      const validationPrompt = `
Basándote en el siguiente contenido curricular como base de conocimientos:

${this.knowledgeBase}

Realizar una clase con el material disponible.

:

"${prompt}"

Proporciona:
1. Una guía para la clase de 15 minutos para los alumnos.
2. Tema: Introducción a la educación financiera.
3. Grado de los estudiantes segundo basico.
4. Incluye actividades para el hogar. Sean simples y entretenidas, que podrian complemetar la clase. 
5. Incluye una guia para el profesor.

      const response = await generateTextFromAiMl(validationPrompt, 500);
      return response;
    } catch (error) {
      console.error("Director Curricular Validation Error:", error.message);
      throw new Error("Failed to validate content.");
    }
  }

  // Método para recargar la base de conocimientos
  async reloadKnowledgeBase() {
    this.knowledgeBase = '';
    await this.loadAllPdfs();
    return "Base de conocimientos actualizada exitosamente";
  }
}

module.exports = new DirectorCurricularAgent();
