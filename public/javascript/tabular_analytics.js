import { currency } from "./constants.js";

const analyticsTimeRange = document.querySelector("#analytics_timerange");
const analyticsYear = document.querySelector("#analytics_year");
const analyticsMonth = document.querySelector("#analytics_month");
const analyticsDay = document.querySelector("#analytics_day");
const analyticsTableHeadRow = document.querySelector("#analytics_table_head");
const analyticsTableBody = document.querySelector("#analytics_table_body");
const analyticsTableTotalsRow = document.querySelector("#table_totals_row");

const baseUrl = "http://localhost:8000";
const saleEndpoint = `${baseUrl}/api/sales`;

// fetching sales when screen loads
fetchSales();

// Only those years are fetched which have some data
getAvailableYears();

changeAnalyticsButtonsVisibility();

setAnalyticsDays();

analyticsTimeRange.addEventListener("click", changeAnalyticsButtonsVisibility);
analyticsMonth.addEventListener("click", setAnalyticsDays);
analyticsYear.addEventListener("click", setAnalyticsDays);

analyticsTimeRange.addEventListener("click", fetchSales);
analyticsYear.addEventListener("click", fetchSales);
analyticsMonth.addEventListener("click", fetchSales);
analyticsDay.addEventListener("click", fetchSales);



// The visibility of analytics year, month,... buttons is dependent on time range
function changeAnalyticsButtonsVisibility() {
    console.log(analyticsTimeRange.value);
    switch (analyticsTimeRange.value) {
        case "lifetime":
            analyticsYear.style.display = "none";
            analyticsMonth.style.display = "none";
            analyticsDay.style.display = "none";
            break;
        case "yearly":
            analyticsYear.style.display = "block";
            analyticsMonth.style.display = "none";
            analyticsDay.style.display = "none";
            break;
        case "monthly":
            analyticsYear.style.display = "block";
            analyticsMonth.style.display = "block";
            analyticsDay.style.display = "none";
            break;
        default:
            analyticsYear.style.display = "block";
            analyticsMonth.style.display = "block";
            analyticsDay.style.display = "block";
    }
}

// Number of days can vary depending on Month
function setAnalyticsDays() {
    let days = 31;
    switch (analyticsMonth.value) {
        case "2":
            const year = analyticsYear.value;
            // checking for leap year for February
            if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) {
                days = 29;
            } else {
                days = 28;
            }
            break;
        case "4":
        case "6":
        case "9":
        case "11"
            :
            days = 30;
    }
    analyticsDay.replaceChildren();
    for (let i = 1; i <= days; i++) {
        const option = document.createElement("option");
        option.textContent = i;
        option.value = i;
        analyticsDay.appendChild(option);
    }
}

function getAvailableYears() {
    fetch(`${saleEndpoint}/years`, {
        method: "GET"
    }).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error("Fetching years failed");
        }
    }).then((json) => {
        for (const year of json) {
            const option = document.createElement("option");
            option.value = year.year;
            option.textContent = year.year;
            analyticsYear.appendChild(option);
        }
    }).catch((error) => {
        console.error(error);
    });
}

function fetchSales() {
    let endpoint = saleEndpoint;
    switch (analyticsTimeRange.value) {
        case "yearly":
            endpoint += `?year=${analyticsYear.value}`;
            break;
        case "monthly":
            endpoint += `?year=${analyticsYear.value}&month=${analyticsMonth.value}`;
            break;
        case "daily":
            endpoint += `?year=${analyticsYear.value}&month=${analyticsMonth.value}&day=${analyticsDay.value}`;

    }
    console.log(endpoint);
    fetch(endpoint, {
        method: "GET"
    }).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error("Fetching sales failed");
        }
    }).then((json) => {
        /* Structure of json:
        {
            sales: {time: , price: , profit: }, 
            summary: {totalPrice: , totalProfit: }
        }
        here time name will be different for different time range and in daily, another attribute
        products will be there
        */
        analyticsTableHeadRow.innerHTML = "";
        analyticsTableBody.innerHTML = "";
        analyticsTableTotalsRow.innerHTML = "";
        // Daily & (yearly, monthly, lifetime) tables are structurally different
        if (analyticsTimeRange.value == "daily") {
            displayDailySales(json);
        } else {
            displayAggregateSales(json);
        }
    }).catch((error) => {
        console.error(error);
    });
}

// for displaying lifetime, yearly or monthly sales
function displayAggregateSales(json) {
    const rangeType = analyticsTimeRange.value;
    // table header
    const time = document.createElement("th");
    switch (analyticsTimeRange.value) {
        case "lifetime":
            time.textContent = "Year";
            break;
        case "yearly":
            time.textContent = "Month";
            break;
        case "monthly":
            time.textContent = "Day";
    }
    const price = document.createElement("th");
    price.textContent = `Price(${currency})`;
    const profit = document.createElement("th");
    profit.textContent = `Profit(${currency})`;
    analyticsTableHeadRow.appendChild(time);
    analyticsTableHeadRow.appendChild(price);
    analyticsTableHeadRow.appendChild(profit);
    /* Structure of element of table body
        tr which has three td's for time, price and profit
    */
    for (const sale of json.sales) {
        const tr = document.createElement("tr");
        const timeUnit = document.createElement("td");
        // time unit is different based on range type
        switch (rangeType) {
            case "lifetime":
                timeUnit.textContent = sale.year;
                break;
            case "yearly":
                timeUnit.textContent = sale.month;
                break;
            default:
                timeUnit.textContent = sale.day;
        }
        const price = document.createElement("td");
        price.textContent = sale.price;
        const profit = document.createElement("td");
        profit.textContent = sale.profit;
        tr.appendChild(timeUnit);
        tr.appendChild(price);
        tr.appendChild(profit);
        analyticsTableBody.appendChild(tr);
    }
    // footer
    const totalText = document.createElement("td");
    totalText.textContent = "TOTAL";
    const totalPrice = document.createElement("td");
    totalPrice.textContent = json.summary.totalPrice;
    const totalProfit = document.createElement("td");
    totalProfit.textContent = json.summary.totalProfit;
    analyticsTableTotalsRow.appendChild(totalText);
    analyticsTableTotalsRow.appendChild(totalPrice);
    analyticsTableTotalsRow.appendChild(totalProfit);

}

function displayDailySales(json) {
    const rangeType = analyticsTimeRange.value;
    // table header
    const id = document.createElement("th");
    id.textContent = "Id";
    const time = document.createElement("th");
    time.textContent = "Time";
    const products = document.createElement("th");
    products.textContent = "Products";
    const price = document.createElement("th");
    price.textContent = `Price(${currency})`;
    const profit = document.createElement("th");
    profit.textContent = `Profit(${currency})`;
    analyticsTableHeadRow.appendChild(id);
    analyticsTableHeadRow.appendChild(time);
    analyticsTableHeadRow.appendChild(products);
    analyticsTableHeadRow.appendChild(price);
    analyticsTableHeadRow.appendChild(profit);
    /* Structure of element of table body
        tr which has four td's for time, products, price and profit
    */
    for (const sale of json.sales) {
        const tr = document.createElement("tr");
        const id = document.createElement("td");
        id.textContent = sale._id.slice(sale._id.length - 5);
        const timeUnit = document.createElement("td");
        const createdAt = new Date(sale.createdAt).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        timeUnit.textContent = createdAt;
        const products = document.createElement("td");
        let productsText = "";
        for (const product of sale.products) {
            productsText += `${product.name}(${product.quantity}) \t`;
        }
        products.textContent = productsText;
        const price = document.createElement("td");
        price.textContent = sale.price;
        const profit = document.createElement("td");
        profit.textContent = sale.profit;
        tr.appendChild(id);
        tr.appendChild(timeUnit);
        tr.appendChild(products);
        tr.appendChild(price);
        tr.appendChild(profit);
        analyticsTableBody.appendChild(tr);
    }
    // footer
    const totalText = document.createElement("td");
    totalText.colSpan = 3;
    totalText.textContent = "TOTAL";
    const totalPrice = document.createElement("td");
    totalPrice.textContent = json.summary.totalPrice;
    const totalProfit = document.createElement("td");
    totalProfit.textContent = json.summary.totalProfit;
    analyticsTableTotalsRow.appendChild(totalText);
    analyticsTableTotalsRow.appendChild(totalPrice);
    analyticsTableTotalsRow.appendChild(totalProfit);

}





