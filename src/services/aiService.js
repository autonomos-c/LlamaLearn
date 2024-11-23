const axios = require("axios");
const { aiMlApi } = require("../config/apiConfig");

const generateTextFromAiMl = async (prompt, maxTokens = 150) => {
  try {
    console.log("AI/ML API Request:", {
      url: aiMlApi.url,
      headers: {
        Authorization: `Bearer ${aiMlApi.key}`,
        "Content-Type": "application/json",
      },
      body: {
        model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.7,
      },
    });

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

    console.log("AI/ML API Response:", response.data);
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(
      "AI/ML API Error Details:",
      error.response?.data || error.message
    );
    throw new Error("Failed to generate text from AI/ML API");
  }
};

module.exports = { generateTextFromAiMl };
