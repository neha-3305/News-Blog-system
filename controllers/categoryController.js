const categoryModel = require("../models/Category");

const allCategory = async (req, res) => {
  const categories = await categoryModel.find();
  res.render("admin/categories", { categories, role: req.role });
};

const addCategoryPage = async (req, res) => {
  res.render("admin/categories/create", { role: req.role });
};

const addCategory = async (req, res, next) => {
  try {
    await categoryModel.create(req.body);
    res.redirect("/admin/category");
  } catch (error) {
    next(error);
  }
};
const updateCategoryPage = async (req, res, next) => {
  const id = req.params.id;
  try {
    const category = await categoryModel.findById(id);
    if (!category) {
      return next(createError("Category noy found", 404));
    }
    res.render("admin/categories/update", { category, role: req.role });
  } catch (err) {
    next(err);
  }
};
const updateCategory = async (req, res, next) => {
  const id = req.params.id;
  try {
    const category = await categoryModel.findByIdAndUpdate(id, req.body);
    if (!category) {
      return next(createError("Category noy found", 404));
    }
    res.redirect("/admin/category");
  } catch (err) {
    next(err);
  }
};
const deleteCategory = async (req, res, next) => {
  const id = req.params.id;
  console.log(id);
  try {
    const category = await categoryModel.findByIdAndDelete(id);

    if (!category) {
      return next(createError("Category noy found", 404));
    }
    res.json({ success: true });
    //res.redirect("/admin/category");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  allCategory,
  addCategoryPage,
  addCategory,
  updateCategoryPage,
  updateCategory,
  deleteCategory,
};
