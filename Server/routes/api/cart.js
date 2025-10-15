
const express = require("express");
const { addToCart, viewCart, removeFromCart } = require("../../controllers/cartCon");

const router = express.Router();

router.post("/add", addToCart);
router.get("/view", viewCart);
router.delete("/:productId", removeFromCart); 

module.exports = router;

