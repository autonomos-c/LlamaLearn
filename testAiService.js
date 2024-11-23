const { generateTextFromAiMl } = require("./src/services/aiService");

const testAiMlApi = async () => {
  try {
    const prompt = "Create an educational activity about climate change.";
    const aiMlResponse = await generateTextFromAiMl(prompt);
    console.log("AI/ML API Response:", aiMlResponse);
  } catch (error) {
    console.error("Error with AI/ML API:", error.message);
  }
};

testAiMlApi();
