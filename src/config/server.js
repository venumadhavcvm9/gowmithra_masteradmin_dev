const app = require("./src/app");
const sequelize = require("./src/config/db");

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log("✅ DB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB Connection Failed:", err);
  });