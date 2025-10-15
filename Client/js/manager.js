// Fetch summary data from server
async function loadDashboard() {
  try {
    const res = await fetch('http://localhost:3284/api/summary', {
    method: 'GET',
    credentials: 'include' 
    });
const data = await res.json();

    // Update summary cards
    document.getElementById('totalOrders').textContent = data.totalOrders;
    document.getElementById('totalRevenue').textContent = `$${data.totalRevenue}`;
    document.getElementById('averageOrder').textContent = `$${(data.totalRevenue / data.totalOrders).toFixed(2)}`;
    console.log(data.categories, data.categoryData)

    // Bar Chart - Monthly Revenue
    const barCtx = document.getElementById('barChart');
    new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: data.months,
        datasets: [{
          label: 'Monthly Revenue ($)',
          data: data.monthlySales,
          backgroundColor: '#36A2EB'
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    // Pie Chart - Orders by Category
    const pieCtx = document.getElementById('pieChart').getContext('2d');
            pieCtx.canvas.width = 200;
            pieCtx.canvas.height = 200;

    // Generate a color for each category automatically
    const colors = data.categories.map((_, i) => 
  `hsl(${i * (360 / data.categories.length)}, 60%, 80%)`
);

    new Chart(pieCtx, {
      type: 'pie',
      data: {
        labels: data.categories,
        datasets: [{
          data: data.categoryData,
          backgroundColor: colors
        }]
      },
      options: { responsive: true }
    });

  } catch (err) {
    console.error('Error loading dashboard:', err);
  }
}


loadDashboard();

