const graphTimeRange = document.querySelector("#graph_timerange");
const graphYear = document.querySelector("#graph_year");
const graphMonth = document.querySelector("#graph_month");
const graphCanvas = document.querySelector("#graph_canvas");

const baseUrl = "http://localhost:8000";
const saleEndpoint = `${baseUrl}/api/sales`;

// reference to chart to destroy it before creating a new chart
let chart;

// Only those years are fetched which have some data
getAvailableYears();

changeAnalyticsButtonsVisibility();

fetchSales();

graphTimeRange.addEventListener("click", fetchSales);
graphYear.addEventListener("click", fetchSales);
graphMonth.addEventListener("click", fetchSales);

graphTimeRange.addEventListener("click", changeAnalyticsButtonsVisibility);


// The visibility of analytics year, month,... buttons is dependent on time range
function changeAnalyticsButtonsVisibility() {
    console.log(graphTimeRange.value);
    switch (graphTimeRange.value) {
        case "lifetime":
            graphYear.style.display = "none";
            graphMonth.style.display = "none";
            break;
        case "yearly":
            graphYear.style.display = "block";
            graphMonth.style.display = "none";
            break;
        default:
            graphYear.style.display = "block";
            graphMonth.style.display = "block";
    }
}

// Number of days can vary depending on Month
function setAnalyticsDays() {
    let days = 31;
    switch (graphMonth.value) {
        case "2":
            const year = graphYear.value;
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
            graphYear.appendChild(option);
        }
    }).catch((error) => {
        console.error(error);
    });
}

function fetchSales() {
    let endpoint = saleEndpoint;
    switch (graphTimeRange.value) {
        case "yearly":
            endpoint += `?year=${graphYear.value}`;
            break;
        case "monthly":
            endpoint += `?year=${graphYear.value}&month=${graphMonth.value}`;
            break;
    }
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
            sales: [{time: , price: , profit: }], 
            summary: {totalPrice: , totalProfit: }
        }
        here time name will be different for different time range
        */
        drawGraph(json);
    }).catch((error) => {
        console.error(error);
    });
}

// drawing a line graph
function drawGraph(json) {
    // during first chart creation, it's null
    if (chart) {
        chart.destroy();
    }
    let type = "line", xText, yText = "Amount in rupees", title;
    const labelFont = {
        family: "Arial",
        size: 16,
        weight: "bold",
    };
    const titleFont = {
        family: "Arial",
        size: 18,
        weight: "bold",
    };
    const xValues = [];
    const sales = [];
    const profits = [];
    if (graphTimeRange.value == "lifetime") {
        for (const sale of json.sales) {
            xValues.push(sale.year);
            sales.push(sale.price);
            profits.push(sale.profit);
        }
        type = "bar";
        xText = "Years";
        title = "Lifetime Sales";
    } else if (graphTimeRange.value == "yearly") {
        for (const sale of json.sales) {
            xValues.push(sale.month);
            sales.push(sale.price);
            profits.push(sale.profit);
        }
        xText = "Months";
        title = `${graphYear.value} Sales`
    } else {
        for (const sale of json.sales) {
            xValues.push(sale.day);
            sales.push(sale.price);
            profits.push(sale.profit);
        }
        xText = "Days";
        title = `${getMonthName(parseInt(graphMonth.value))} ${graphYear.value} Sales`
    }

    chart = new Chart(
        "graph_canvas", {
        type: type,
        data: {
            labels: xValues,
            datasets: [
                {
                    label: "Sales",
                    pointRadius: 4,
                    backgroundColor: "#2e4057",
                    borderColor: "#2e4057",
                    data: sales
                },
                {
                    label: "Profit",
                    pointRadius: 4,
                    backgroundColor: "#27ae60",
                    borderColor: "#27ae60",
                    data: profits
                }
            ]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: xText,
                        font: labelFont
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: yText,
                        font: labelFont,

                    },
                    // providing default range for y axis
                    suggestedMin: 0,
                    suggestedMax: 20000,
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: titleFont,
                }
            }
        }
    });
}

function getMonthName(month) {
    const months = [
        "",
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];
    return months[month];
}