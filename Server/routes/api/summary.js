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
            { $group: { _id: null, total: { $sum: "$finalPrice" } } }
        ]);
        const totalRevenue = totalRevenueAgg[0]?.total || 0;

        // Sales by month
        const monthlySalesAgg = await Order.aggregate([
            { $group: { _id: { $month: "$orderDate" }, total: { $sum: "$finalPrice" } } },
            { $sort: { "_id": 1 } }
        ]);
        const months = monthlySalesAgg.map(m => `Month ${m._id}`);
        const monthlySales = monthlySalesAgg.map(m => m.total);

        // Orders by category
        const categoriesAgg = await Order.aggregate([
            { $unwind: "$products" },
            { $lookup: { from: "products", localField: "products.productId", foreignField: "_id", as: "productInfo" } },
            { $unwind: "$productInfo" },
            { $group: { _id: { $ifNull: ["$productInfo.category", "Uncategorized"] }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

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
});

module.exports = router;



