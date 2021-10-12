const express = require('express');
const validator = require('express-validator');
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

const validation = [
  validator
    .body('title', 'Please enter valid title')
    .trim()
    .isLength({ min: 3, max: 20 }),
  validator.body('imageUrl', 'Please enter valid image url').isURL().trim(),
  validator.body('price', 'Please enter valid price').isNumeric(),
  validator
    .body('description', 'Please enter valid description')
    .trim()
    .isLength({ min: 5, max: 200 }),
];

// /admin/add-product > GET
// left -> right ex: isAuth() -> adminController.getAddProduct()
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/add-product > POST
router.post('/add-product', validation, isAuth, adminController.postAddProduct);

// /admin/products > GET
router.get('/products', isAuth, adminController.getProducts);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post(
  '/edit-product',
  validation,
  isAuth,
  adminController.postEditProduct
);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
