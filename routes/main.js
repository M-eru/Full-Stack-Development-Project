const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const title = "Tuition Academy";
  res.render("index", { title });
});

module.exports = router;
