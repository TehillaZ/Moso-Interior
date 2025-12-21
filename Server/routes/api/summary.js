// routes/api/summary.js
const express = require('express');
const router = express.Router();
const Order = require('../../models/orderModel');

router.get('/summary', async (req, res) => {
  try {
    const orders = await Order.find();

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.finalPrice, 0);

    // ממוצע הזמנה
    const averageOrder = totalOrders ? (totalRevenue / totalOrders).toFixed(2) : 0;

    // חישוב הכנסות לפי חודש
    const monthlySales = {};
    const months = [];

    orders.forEach(order => {
      const month = order.createdAt.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlySales[month]) monthlySales[month] = 0;
      monthlySales[month] += order.finalPrice;
    });

    // סדר החודשים לפי התאריך
    const sortedMonths = Object.keys(monthlySales).sort((a,b) => new Date(a) - new Date(b));
    const monthlyRevenue = sortedMonths.map(m => monthlySales[m]);

    // חישוב לפי קטגוריות
    const categoryData = {};
    orders.forEach(order => {
      order.products.forEach(p => {
        const cat = p.category || 'Unknown';
        if (!categoryData[cat]) categoryData[cat] = 0;
        categoryData[cat] += 1;
      });
    });

    const categories = Object.keys(categoryData);
    const categoryCounts = categories.map(cat => categoryData[cat]);

    res.json({
      totalOrders,
      totalRevenue,
      averageOrder,
      months: sortedMonths,
      monthlySales: monthlyRevenue,
      categories,
      categoryData: categoryCounts
    });
  } catch (err) {
    console.error('Error fetching summary:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
