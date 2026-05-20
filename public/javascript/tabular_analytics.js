const analyticsTimeRange = document.querySelector("#analytics_timerange");
const analyticsYear = document.querySelector("#analytics_year");
const analyticsMonth = document.querySelector("#analytics_month");
const analyticsDay = document.querySelector("#analytics_day");

// Setting current date for analytics year, month
const now = new Date();
analyticsYear.value = now.getFullYear();
analyticsMonth.value = now.getMonth() + 1;
// Day value is set after creation of days
analyticsDay.value = now.getDate();
setAnalyticsDays();


// The visibility of analytics year, month,... buttons is dependent on time range
function changeAnalyticsButtonsVisibility() {
    switch(analyticsTimeRange.value) {
        case "yearly":
            analyticsYear.style.display = "none";
            analyticsMonth.style.display = "none";
            analyticsDay.style.display = "none";
        break;
        case "monthly":
            analyticsYear.style.display = "block";
            analyticsMonth.style.display = "none";
            analyticsDay.style.display = "none";
        break;
        case "daily":
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
changeAnalyticsButtonsVisibility();
analyticsTimeRange.addEventListener("click", changeAnalyticsButtonsVisibility);

// Number of days can vary depending on Month
function setAnalyticsDays() {
    let days = 31;
    console.log(analyticsMonth.value);
    switch(analyticsMonth.value) {
        case "2":
            days = 29;
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
analyticsMonth.addEventListener("click", setAnalyticsDays);





