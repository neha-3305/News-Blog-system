const jwt = require("jsonwebtoken");

const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      returnres.redirect("/admin/");
    }
    const tokenData = jwt.verify(token, process.env.JWT_SECRET);
    req.id = tokenData.id;
    req.role = tokenData.role;
    req.fullname = tokenData.fullname;
    next();
  } catch (error) {
    res.status(401).send("Unauthorized: Invalid token");
  }
};

module.exports = isLoggedIn;
