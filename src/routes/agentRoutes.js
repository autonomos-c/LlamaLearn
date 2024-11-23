const express = require("express");
const { validateActivity } = require("../controllers/agentController");

const router = express.Router();

router.post("/validate-activity", validateActivity);

module.exports = router;
