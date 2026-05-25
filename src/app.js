const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* =======================
   🔹 MIDDLEWARES
======================= */

// CORS
app.use(
  cors({
    origin: ["http://localhost:5173"], // frontend URL
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =======================
   🔹 HEALTH CHECK
======================= */

app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

/* =======================
   🔹 ROUTES
======================= */

// Auth
app.use("/api/auth", require("./modules/auth/auth.routes"));

// Shops
app.use("/api/shops", require("./modules/shop/shop.routes"));

// Area Doctors
app.use("/api/area-doctors", require("./modules/areaDoctor/areaDoctor.routes"));

// Medicines
app.use("/api/medicines", require("./modules/medicine/medicine.routes"));

// Users (if created)
app.use("/api/users", require("./modules/user/user.routes"));

// Dashboard
app.use("/api/dashboard", require("./modules/dashboard/dashboard.routes"));

// Locations (if created)
app.use("/api/states", require("./modules/location/state.routes"));
app.use("/api/districts", require("./modules/location/district.routes"));
app.use("/api/mandals", require("./modules/location/mandal.routes"));
app.use("/api/constituencies", require("./modules/location/constituency.routes"));
app.use("/api/villages", require("./modules/location/village.routes"));

/* =======================
   🔹 ERROR HANDLER
======================= */

app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: err,
  });
});

module.exports = app;