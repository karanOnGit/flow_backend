const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB, sequelize } = require("./src/config/db");
const userRoutes = require("./src/routes/userRoutes");
const errorHandler = require("./src/middlewares/errorHandler");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

connectDB();

app.use("/api/users", userRoutes);

app.use(errorHandler);

sequelize.sync({ alter: true }).then(() => console.log("✅ Database synced!"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
