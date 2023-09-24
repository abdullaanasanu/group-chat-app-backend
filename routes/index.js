var router = require("express").Router();

// routes
router.use("/user", require("./user"));
router.use("/group", require("./group"));



module.exports = router;
