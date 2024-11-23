const { generateTextFromAiMl } = require("../services/aiService");

class DirectorCurricularAgent {
  async validateContent(prompt) {
    try {
      const validationPrompt = `Validate the following content for curriculum alignment: "${prompt}"`;
      const response = await generateTextFromAiMl(validationPrompt, 200);
      return response;
    } catch (error) {
      console.error("Director Curricular Validation Error:", error.message);
      throw new Error("Failed to validate content.");
    }
  }
}

module.exports = new DirectorCurricularAgent();
