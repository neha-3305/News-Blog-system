const categoryModel = require("../models/Category");

const allCategory = async (req, res) => {
  const categories = await categoryModel.find();
  res.render("admin/categories", { categories, role: req.role });
};

const addCategoryPage = async (req, res) => {
  res.render("admin/categories/create", { role: req.role });
};

const addCategory = async (req, res) => {
  //console.log(req.body);
  try {
    await categoryModel.create(req.body);
    res.redirect("/admin/category");
  } catch (error) {
    res.status(400).send(error);
  }
};
const updateCategoryPage = async (req, res) => {
  const id = req.params.id;
  try {
    const category = await categoryModel.findById(id);
    if (!category) {
      return res.status(404).send("Categpory not found");
    }
    res.render("admin/categories/update", { category, role: req.role });
  } catch (err) {
    console.log(err);
  }
};
const updateCategory = async (req, res) => {
  const id = req.params.id;
  try {
    const category = await categoryModel.findByIdAndUpdate(id, req.body);
    if (!category) {
      return res.status(400).send("Category not found");
    }
    res.redirect("/admin/category");
  } catch (err) {
    res.status(400).send(err);
  }
};
const deleteCategory = async (req, res) => {
  const id = req.params.id;
  console.log(id);
  try {
    const category = await categoryModel.findByIdAndDelete(id);

    if (!category) {
      res.status(404).send("Category not found");
    }
    res.json({ success: true });
    //res.redirect("/admin/category");
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
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
