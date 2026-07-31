const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const userModel = require("../models/User");
const newsModel = require("../models/News");
const categoryModel = require("../models/Category");
const Setting = require("../models/Setting");
const { validationResult } = require("express-validator");
const createError = require("../utils/error-message");
const fs = require("fs");
const path = require("path");

dotenv.config();
const loginPage = async (req, res) => {
  res.render("admin/login", { layout: false, errors: 0 });
};

const adminLogin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("admin/login", { layout: false, errors: errors.array() });
  }
  const { username, password } = req.body;
  try {
    const user = await userModel.findOne({ username });
    if (!user) {
      return res.render("admin/login", {
        layout: false,
        errors: [{ msg: "Invalid Username or password" }],
      });
    }
    // if (!user) {
    //   return next(createError("Invalid Username or password", 401));
    // }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("admin/login", {
        layout: false,
        errors: [{ msg: "Invalid Username or password" }],
      });
    }
    // if (!isMatch) {
    //   return next(createError("Invalid Username or password", 401));
    // }

    const jwtData = { id: user._id, fullname: user.fullname, role: user.role };
    const token = jwt.sign(jwtData, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, { httpOnly: true, maxAge: 60 * 60 * 1000 });
    res.redirect("/admin/dashboard");
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  res.clearCookie("token");
  res.redirect("/admin/");
};

const dashboard = async (req, res, next) => {
  try {
    let articlecount;
    if (req.role == "author") {
      articlecount = await newsModel.countDocuments({ author: req.id });
    } else {
      articlecount = await newsModel.countDocuments();
    }

    const categorycount = await categoryModel.countDocuments();
    const usercount = await userModel.countDocuments();

    res.render("admin/dashboard", {
      role: req.role,
      fullname: req.fullname,
      articlecount,
      categorycount,
      usercount,
    });
  } catch (err) {
    next(err);
  }
};

const settings = async (req, res, next) => {
  try {
    const settings = await Setting.findOne();
    res.render("admin/settings", { role: req.role, settings });
  } catch (err) {
    next(err);
  }
};

const saveSettings = async (req, res, next) => {
  // save in database
  const { website_title, footer_description } = req.body;
  const website_logo = req.file?.filename;

  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = new Setting();
    }

    setting.website_title = website_title;
    setting.footer_description = footer_description;

    if (website_logo) {
      if (setting.website_logo) {
        const logoPath = `./public/uploads/${setting.website_logo}`;
        if (fs.existsSync(logoPath)) {
          fs.unlinkSync(logoPath);
        }
      }
      setting.website_logo = website_logo;
    }

    await setting.save();
    res.redirect("/admin/settings");
  } catch (err) {
    next(err);
  }
};

const alluser = async (req, res) => {
  const users = await userModel.find();
  res.render("admin/users", { users, role: req.role });
};
const addUserPage = async (req, res) => {
  res.render("admin/users/create", { role: req.role, errors: 0 });
};
const addUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("admin/users/create", {
      role: req.role,
      errors: errors.array(),
    });
  }
  await userModel.create(req.body);
  res.redirect("/admin/users");
};

const updateUserPage = async (req, res, next) => {
  const id = req.params.id;
  try {
    const user = await userModel.findById(id);
    if (!user) {
      return next(createError("User noy found", 404));
    }
    res.render("admin/users/update", { user, role: req.role, errors: 0 });
  } catch (error) {
    next(error);
  }
};
const updateUser = async (req, res, next) => {
  const id = req.params.id;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("admin/users/update", {
      user: req.body,
      role: req.role,
      errors: errors.array(),
    });
  }
  const { fullname, password, role } = req.body;
  try {
    const user = await userModel.findById(id);
    if (!user) {
      return next(createError("User noy found", 404));
    }
    user.fullname = fullname || user.fullname;
    if (password) {
      user.password = password;
    }
    user.role = role || user.role;
    await user.save();

    res.redirect("/admin/users");
  } catch (error) {
    next(error);
  }
};
const deleteUser = async (req, res, next) => {
  const id = req.params.id;
  try {
    const user = await userModel.findById(id);
    if (!user) {
      return next(createError("User noy found", 404));
    }

    const article = await newsModel.findOne({ author: id });
    if (article) {
      // return next(createError("Category has articles", 400));
      return res.status(400).json({
        success: false,
        message: "User is associated with article",
      });
    }

    await user.deleteOne();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginPage,
  adminLogin,
  logout,
  dashboard,
  settings,
  saveSettings,
  alluser,
  addUserPage,
  addUser,
  updateUserPage,
  updateUser,
  deleteUser,
};
