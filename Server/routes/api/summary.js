// routes/api/summary.js
const express = require('express');
const router = express.Router();
const Order = require('../../models/orderModel');

router.get('/summary', async (req, res) => {
 try {
    // Total orders
    const totalOrders = await Order.countDocuments();

    // Total revenue
    const totalRevenueAgg = await Order.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: "$finalPrice" }
            }
        }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // Sales by month
    const monthlySalesAgg = await Order.aggregate([
        {
            $group: {
                _id: { $month: "$orderDate" },
                total: { $sum: "$finalPrice" }
            }
        },
        { $sort: { "_id": 1 } }
    ]);

    const months = monthlySalesAgg.map(m => `Month ${m._id}`);
    const monthlySales = monthlySalesAgg.map(m => m.total);

    // Orders by category
    const categoriesAgg = await Order.aggregate([
        { $unwind: "$products" }, // separate each product in orders
        {
            $lookup: {
                from: "products", // your Product collection
                localField: "products.productId",
                foreignField: "_id",
                as: "productInfo"
            }
        },
        { $unwind: "$productInfo" }, // flatten the joined product info
        {
            $group: {
                _id: { $ifNull: ["$productInfo.category", "Uncategorized"] }, // default if no category
                count: { $sum: 1 } // count products in this category
            }
        },
        { $sort: { _id: 1 } } // optional: sort categories alphabetically
    ]);

    // Now you can use these arrays for your Pie Chart
    const categories = categoriesAgg.map(c => c._id);
    const categoryData = categoriesAgg.map(c => c.count);

    console.log(categories, categoryData);

    res.json({
        totalOrders,
        totalRevenue,
        months,
        monthlySales,
        categories,
        categoryData
    });
} catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
}

// END MANAGER


module.exports = router;


