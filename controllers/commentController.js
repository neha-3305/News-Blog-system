const commentModel = require("../models/Comment");

const allComment = async (req, res) => {
  res.render("admin/comments", { role: req.role });
};

module.exports = { allComment };
