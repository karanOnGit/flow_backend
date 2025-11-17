const express = require("express");
const {
    getUsers,
    createUser,
    deleteUser,
    loginUser,
} = require("../controllers/userController");

const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/login", loginUser);
router.post("/", createUser);
router.get("/", authMiddleware, getUsers);
router.delete("/:id", authMiddleware, deleteUser);

router.post("/logout", (req, res) => {
    res.clearCookie("auth_token");
    res.json({ message: "Logged out" });
});

module.exports = router;
