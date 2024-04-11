const crypto = require("crypto");
const axios = require('axios')
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
const STOCK_API_URL = process.env.STOCK_API_BASE_URL
const isValidEmail = (email) => {
    return emailRegex.test(email);
}

const isValidPassword = (password) => {
    return passwordRegex.test(password);
};
const md5Hash = (text) => {
    return crypto.createHash("md5").update(text).digest("hex");
};
const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const getData = async (symbolName) => {
    return axios.get(
        `${STOCK_API_URL}symbol=${symbolName}&interval=5min&apikey=62BS1RYKYSYVVRSM`
    );
};
const convertToStockDataArray = (
    apiResponse
) => {
    const timeSeries = apiResponse["Monthly Adjusted Time Series"];
    const stockDataArray = [];

    for (const date in timeSeries) {
        const data = timeSeries[date];
        const stockData = {
            date,
            open: data["1. open"],
            high: data["2. high"],
            low: data["3. low"],
            close: data["4. close"],
            adjustedClose: data["5. adjusted close"],
            volume: data["6. volume"],
            dividendAmount: data["7. dividend amount"],
        };
        stockDataArray.push(stockData);
    }

    return stockDataArray;
};
const getLastNMonthsDate = (n) => {
    const currentDate = new Date();
    const result = new Date(currentDate);
    result.setMonth(result.getMonth() - n);
    return result;
};

const filterDataForNMonths = (n, data) => {
    const endDate = new Date();
    const startDate = getLastNMonthsDate(n);

    const filteredData = data.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
    });

    if (filteredData.length) filteredData.splice(-1, 1);

    return filteredData;
};

// const filterData = (
//     selectedOption,
//     data) => {
//     let filteredData = [];
//     let maxHigh = -Infinity;
//     let maxLow = Infinity;

//     if (selectedOption === "all") {
//         filteredData = data;
//     } else if (selectedOption === "last3Months") {
//         filteredData = filterDataForNMonths(3, data);
//     } else if (selectedOption === "last1Year") {
//         filteredData = filterDataForNMonths(12, data);
//     } else if (selectedOption === "last2Year") {
//         filteredData = filterDataForNMonths(24, data);
//     } else if (selectedOption === "last5Year") {
//         filteredData = filterDataForNMonths(60, data);
//     } else {
//         filteredData = data;
//     }

//     filteredData.forEach((item) => {
//         const high = parseFloat(item.high);
//         const low = parseFloat(item.low);
//         if (!isNaN(high) && high > maxHigh) {
//             maxHigh = high;
//         }
//         if (!isNaN(low) && low < maxLow) {
//             maxLow = low;
//         }
//     });

//     const performance =
//         maxHigh !== -Infinity && maxLow !== Infinity
//             ? ((maxHigh - maxLow) / maxLow) * 100
//             : 0;

//     return { filteredData, maxHigh, maxLow, performance };
// };
const filterAllData = (filteredData) => {
    let maxHigh = -Infinity;
    let maxLow = Infinity;

    filteredData.forEach((item) => {
        const high = parseFloat(item.high);
        const low = parseFloat(item.low);
        if (!isNaN(high) && high > maxHigh) {
            maxHigh = high;
        }
        if (!isNaN(low) && low < maxLow) {
            maxLow = low;
        }
    });

    const performance =
        maxHigh !== -Infinity && maxLow !== Infinity
            ? ((maxHigh - maxLow) / maxLow) * 100
            : 0;

    // return { filteredData, maxHigh, maxLow, performance };
    return {  maxHigh, maxLow, performance };
}
module.exports = {
    md5Hash,
    isValidEmail,
    isValidPassword,
    capitalizeFirstLetter,
    getData,
    convertToStockDataArray,
    filterAllData,
    // filterData,
};
