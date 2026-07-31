const categoryModel = require("../models/Category");
const newsModel = require("../models/News");
const userModel = require("../models/User");
const fs = require("fs");
const path = require("path");
const createError = require("../utils/error-message");
const { validationResult } = require("express-validator");

const allArticle = async (req, res, next) => {
  // populate join query like
  let articles;
  try {
    if (req.role === "admin") {
      articles = await newsModel
        .find()
        .populate("category", "name")
        .populate("author", "fullname");
    } else {
      articles = await newsModel
        .find({ author: req.id })
        .populate("category", "name")
        .populate("author", "fullname");
    }
    res.render("admin/articles", { role: req.role, articles });
  } catch (err) {
    next(err);
  }
};

const addArticlePage = async (req, res) => {
  const categories = await categoryModel.find();
  res.render("admin/articles/create", {
    role: req.role,
    errors: 0,
    categories,
  });
};
const addArticle = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const categories = await categoryModel.find();
    return res.render("admin/articles/create", {
      role: req.role,
      errors: errors.array(),
      categories,
    });
  }
  try {
    const { title, content, category } = req.body;
    const article = new newsModel({
      title,
      content,
      category,
      author: req.id,
      image: req.file.filename,
    });
    // filename save in database
    await article.save();
    res.redirect("/admin/article");
  } catch (error) {
    next(error);
  }
};
const updateArticlePage = async (req, res, next) => {
  const id = req.params.id;
  try {
    const article = await newsModel
      .findById(id)
      .populate("category", "name")
      .populate("author", "fullname");
    if (!article) {
      return next(createError("Aticle noy found", 404));
    }

    if (req.role == "author") {
      if (req.id != article.author._id) {
        return next(createError("Unauthorized", 401));
      }
    }
    const categories = await categoryModel.find();
    res.render("admin/articles/update", {
      role: req.role,
      article,
      categories,
      errors: 0,
    });
  } catch (err) {
    next(err);
  }
};

const updateArticle = async (req, res, next) => {
  const id = req.params.id;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const categories = await categoryModel.find();
    return res.render("admin/articles/update", {
      article: req.body,
      role: req.role,
      errors: errors.array(),
      categories,
    });
  }
  try {
    const { title, content, category } = req.body;
    const article = await newsModel.findById(id);
    if (!article) {
      return next(createError("Aticle noy found", 404));
    }
    if (req.role == "author") {
      if (req.id != article.author._id) {
        return next(createError("Unauthorized", 401));
      }
    }
    article.title = title;
    article.content = content;
    article.category = category;
    if (req.file) {
      // old image delete on server
      const imagepath = path.join(
        __dirname,
        "../public/uploads",
        article.image
      );
      fs.unlinkSync(imagepath);
      article.image = req.file.filename;
    }
    await article.save();
    res.redirect("/admin/article");
  } catch (err) {
    next(err);
  }
};
const deleteArticle = async (req, res, next) => {
  const id = req.params.id;
  try {
    const article = await newsModel.findById(id);
    if (!article) {
      return next(createError("Aticle noy found", 404));
    }
    if (req.role == "author") {
      if (req.id != article.author._id) {
        return next(createError("Unauthorized", 401));
      }
    }

    try {
      // old image delete on server
      const imagepath = path.join(
        __dirname,
        "../public/uploads",
        article.image
      );
      fs.unlinkSync(imagepath);
    } catch (err) {
      console.err("Error deleting image: ", err);
    }

    await article.deleteOne();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  allArticle,
  addArticlePage,
  addArticle,
  updateArticlePage,
  updateArticle,
  deleteArticle,
};
