const axios = require("axios");
const { aiMlApi } = require("../config/apiConfig");

const generateTextFromAiMl = async (prompt, maxTokens = 150) => {
  try {
    console.log("Enviando solicitud a AI/ML API...");

    const response = await axios.post(
      aiMlApi.url,
      {
        model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${aiMlApi.key}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Respuesta recibida de AI/ML API");
    
    if (response.data.choices && response.data.choices.length > 0) {
      const content = response.data.choices[0].message.content;
      console.log("Contenido generado:", content);
      return content;
    } else {
      console.error("No se encontró contenido en la respuesta:", response.data);
      throw new Error("No se pudo generar el contenido");
    }
  } catch (error) {
    console.error("Error detallado de AI/ML API:", error.response?.data || error.message);
    throw new Error(`Error al generar texto: ${error.message}`);
  }
};

module.exports = { generateTextFromAiMl };
