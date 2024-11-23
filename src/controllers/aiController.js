const { generateTextFromAiMl } = require("../services/aiService");

const generateActivity = async (req, res) => {
  const { prompt } = req.body;
  try {
    const activity = await generateTextFromAiMl(prompt);
    res.status(200).json({ activity });
  } catch (error) {
    console.error("Error in generateActivity:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { generateActivity };
