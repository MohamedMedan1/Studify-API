const express = require("express");
const {
  getAllLevels,
  createNewLevel,
  getLevel,
  updateLevel,
  deleteLevel,
} = require("../controllers/levelController");
const { protect,restrictTo } = require("../controllers/authController");

const router = express.Router();

// Main Routes
router.route("/")
  .get(getAllLevels);
  
router.route("/:id")
  .get(getLevel);

// Check User logged in ot not (Authentiation)
router.use(protect);

// =====  Admin and Super Admin Specific  =====
router.use(restrictTo("admin", "super admin"));

router.route("/")
  .post(createNewLevel);

router.route("/:id")
  .patch(updateLevel)
  .delete(deleteLevel);

module.exports = router;
