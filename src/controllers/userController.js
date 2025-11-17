const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users", error: err.message });
    }
};

const createUser = async (req, res) => {
    try {
        const { first_name, last_name, email, password, confirm_password } = req.body;

        if (!first_name || !email || !password || !confirm_password) {
            return res.status(400).json({ message: "All required fields must be provided." });
        }

        if (password !== confirm_password) {
            return res.status(400).json({ message: "Passwords do not match." });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            first_name,
            last_name,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            message: "User registered successfully.",
            user: {
                id: newUser.id,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                email: newUser.email,
            },
        });
    } catch (err) {
        res.status(500).json({ message: "Error creating user", error: err.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await user.destroy();
        res.json({ message: `User with ID ${id} deleted successfully` });
    } catch (err) {
        res.status(500).json({ message: "Error deleting user", error: err.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: false,         
            sameSite: "strict",
            maxAge: 1 * 60 * 60 * 1000, 
        });

        res.json({
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
            },
        });
    } catch (err) {
        res.status(500).json({ message: "Error logging in", error: err.message });
    }
};

module.exports = { getUsers, createUser, deleteUser, loginUser };

