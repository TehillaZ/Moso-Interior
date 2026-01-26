const express = require('express');
const router = express.Router();

const { authenticateToken, checkAdmin } = require('../../middleware/middleware');
const productsController = require('../../controllers/prodCon');

const adminAuth = [authenticateToken];

router.route('/')
  .get(productsController.getAlluproduct)
  .post(adminAuth, productsController.CreateNewProduct)
  .put(adminAuth, productsController.updateProduct)
  .delete(adminAuth, productsController.deleteProduct);

router.route('/:id')
  .get(productsController.getProduct);

module.exports = router;
