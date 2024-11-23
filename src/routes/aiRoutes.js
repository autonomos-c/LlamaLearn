const express = require("express");
const { generateActivity } = require("../controllers/aiController");

const router = express.Router();

router.post("/activity", generateActivity);

module.exports = router;
