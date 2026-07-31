const express = require("express");
const router = express.Router();

const articleController = require("../controllers/articleController");
const userController = require("../controllers/userController");
const categoryController = require("../controllers/categoryController");
const commentController = require("../controllers/commentController");
const isLoggedIn = require("../middleware/isLoggedin");
const isAdmin = require("../middleware/idAdmin");
const upload = require("../middleware/multer");
const isValid = require("../middleware/validation");

//Login Routes
router.get("/", userController.loginPage);
router.post("/index", isValid.loginValidation, userController.adminLogin);
router.get("/logout", userController.logout);
router.get("/dashboard", isLoggedIn, userController.dashboard);
router.get("/settings", isLoggedIn, isAdmin, userController.settings);
router.post(
  "/save-settings",
  isLoggedIn,
  isAdmin,
  upload.single("website_logo"),
  userController.saveSettings
);

//User CRUD Routes
router.get("/users", isLoggedIn, isAdmin, userController.alluser);
router.get("/add-user", isLoggedIn, isAdmin, userController.addUserPage);
router.post(
  "/add-user",
  isValid.userValidation,
  isLoggedIn,
  isAdmin,
  userController.addUser
);
router.get(
  "/update-user/:id",
  isLoggedIn,
  isAdmin,
  userController.updateUserPage
);
router.post(
  "/update-user/:id",
  isValid.userUpdateValidation,
  isLoggedIn,
  isAdmin,
  userController.updateUser
);
router.delete(
  "/delete-user/:id",
  isLoggedIn,
  isAdmin,
  userController.deleteUser
);

//Category CRUD Routes
router.get("/category", isLoggedIn, isAdmin, categoryController.allCategory);
router.get(
  "/add-category",
  isLoggedIn,
  isAdmin,
  categoryController.addCategoryPage
);
router.post(
  "/add-category",
  isValid.categoryValidation,
  isLoggedIn,
  isAdmin,
  categoryController.addCategory
);
router.get(
  "/update-category/:id",
  isLoggedIn,
  isAdmin,
  categoryController.updateCategoryPage
);
router.post(
  "/update-category/:id",
  isValid.categoryValidation,
  isLoggedIn,
  isAdmin,
  categoryController.updateCategory
);
router.delete(
  "/delete-category/:id",
  isLoggedIn,
  categoryController.deleteCategory
);

//Article CRUD Routes
router.get("/article", isLoggedIn, articleController.allArticle);
router.get(
  "/add-article",

  isLoggedIn,
  articleController.addArticlePage
);
router.post(
  "/add-article",
  isLoggedIn,
  upload.single("image"),
  isValid.articleValidation,
  articleController.addArticle
);
router.get(
  "/update-article/:id",
  isLoggedIn,
  articleController.updateArticlePage
);
router.post(
  "/update-article/:id",
  isLoggedIn,
  upload.single("image"),
  isValid.articleValidation,
  articleController.updateArticle
);
router.delete(
  "/delete-article/:id",
  isLoggedIn,
  articleController.deleteArticle
);

// Comment Routes
router.get("/comments", isLoggedIn, commentController.allComment);

// 404 Middleware
router.use((req, res, next) => {
  res.status(404).render("admin/404", {
    message: "Page not found",
    role: req.role,
  });
});

// 500 Error Handler
router.use(isLoggedIn, (err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  let view;
  switch (status) {
    case 404:
      view = "admin.404";
      break;
    case 500:
      view = "admin/500";
      break;
    case 401:
      view = "";
      break;
    default:
      view = "admin/500";
  }
  // const view = status === 404 ? "admin/404" : "admin/500";
  res.status(status).render(view, {
    message: err.message || "Something went wrong",
    role: req.role,
  });
});

// router.use(isLoggedIn, (err, req, res, next) => {
//   res.status(500).render("admin/500", {
//     message: err.message || "Internal Server Error",
//     role: req.role,
//   });
// });
module.exports = router;
