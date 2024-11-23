const directorCurricularAgent = require("../agents/directorCurricularAgent");

const validateActivity = async (req, res) => {
  const { activity } = req.body;
  try {
    const validation = await directorCurricularAgent.validateContent(activity);
    res.status(200).json({ validation });
  } catch (error) {
    console.error("Error in validateActivity:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { validateActivity };
