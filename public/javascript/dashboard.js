import { currency } from "./constants.js";

const totalProductsDiv = document.querySelector("#total_products");
const stockActiveDiv = document.querySelector("#stock_active_count");
const stockOutDiv = document.querySelector("#stock_out_count");
const totalSalesSpan = document.querySelector("#total_sales");
const totalProfitSpan = document.querySelector("#total_profit");
const yearProfitSpan = document.querySelector("#year_profit");
const yearSalesSpan = document.querySelector("#year_sales");
const monthProfitSpan = document.querySelector("#month_profit");
const monthSalesSpan = document.querySelector("#month_sales");
const dayProfitSpan = document.querySelector("#today_profit");
const daySalesSpan = document.querySelector("#today_sales");
const bestProductNameSpan = document.querySelector("#best_product_name");
const bestProductProfitSpan = document.querySelector("#best_product_profit");
const baseUrl = "http://localhost:8000";
const productsDashboardEndpoint = `${baseUrl}/api/dashboard/products`;
const salesDashboardEndpoint = `${baseUrl}/api/dashboard/sales`;

displayDashboardSummary();

function displayDashboardSummary() {
    fetch(productsDashboardEndpoint, {
        method: "GET"
    }).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            console.log("Error fetching dashboard");
        }
    }).then((json) => {
        /* 
          JSON response structure: 
          {totalProductsCount: , stockActiveProductsCount: , stockOutProductsCount:, bestProduct: {name: , profit: } }
        */
        animateCounter(totalProductsDiv, json.totalProductsCount, "");
        animateCounter(stockActiveDiv, json.stockActiveProductsCount, "");
        animateCounter(stockOutDiv, json.stockOutProductsCount, "");
        bestProductNameSpan.textContent =  json.bestProduct.name;
        animateCounter(bestProductProfitSpan, json.bestProduct.profit, `+${currency}`);
    }).catch((error) => {
        console.log(error);
    });

    fetch(salesDashboardEndpoint, {
        method: "GET"
    }).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            console.log("Error fetching dashboard");
        }
    }).then((json) => {
        /* 
          JSON response structure: 
          {totalSales: , totalProfit: , yearSales: , yearProfit: , ...}
        */
        animateCounter(totalSalesSpan, json.totalSales, currency);
        animateCounter(totalProfitSpan, json.totalProfit, currency);
        animateCounter(yearSalesSpan, json.yearSales, currency);
        animateCounter(yearProfitSpan, json.yearProfit, currency);
        animateCounter(monthProfitSpan, json.monthProfit, currency);
        animateCounter(monthSalesSpan, json.monthSales, currency);
        animateCounter(daySalesSpan, json.daySales, currency);
        animateCounter(dayProfitSpan, json.dayProfit, currency);
    }).catch((error) => {
        console.log(error);
    })
}


// Here prefix is used to add currency where necessary
function animateCounter(element, target, prefix) {
    /* This function has two parts:
    Setting of animation: We specify duration. During each call of animate(),
    we calculate current time passed and check if desired duration has passed, otherwise call again
    Setting of value: We at any call give percentage of what time has passed of total duration
    of our target value 
    */
    let startTime = null;
    const duration = 1000;
    function animate(timestamp) {
        if (!startTime) {
            startTime = timestamp;
        }
        const progress = timestamp - startTime;
        const value = Math.min((progress / duration) * target, target);
        element.textContent = prefix + Math.floor(value);
        if (progress < duration) {
            requestAnimationFrame(animate);
        }
    }
    requestAnimationFrame(animate);
}