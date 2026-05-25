const sequelize = require("../../config/db");

exports.getDashboardData = async (req, res, next) => {
  try {
    const [vendors] = await sequelize.query(
      "SELECT COUNT(*) as count FROM vendors"
    );

    const [doctors] = await sequelize.query(
      "SELECT COUNT(*) as count FROM area_doctors"
    );

    const [users] = await sequelize.query(
      "SELECT COUNT(*) as count FROM users"
    );

    const [sales] = await sequelize.query(
      "SELECT SUM(total_amount) as total FROM orders WHERE status = 'DELIVERED'"
    );

    res.json({
      vendors: vendors[0].count || 0,
      doctors: doctors[0].count || 0,
      users: users[0].count || 0,
      sales: sales[0].total || 0
    });

  } catch (err) {
    next(err);
  }
};