const mongoose = require('mongoose')
const stockMetaData = mongoose.Schema({
    open: {
        required: true,
        type: String,
    },
    high: {
        required: true,
        type: String,
    },
    low: {
        required: true,
        type: String,
    },
    close: {
        required: true,
        type: String,
    },
    adjustedClose: {
        required: true,
        type: String,
    },
    date: {
        required: true,
        type: String,
    },
    volume: {
        required: true,
        type: String,
    },
    dividendAmount: {
        required: true,
        type: String,
    },
}, { _id: false }

)
const stockSchema = mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        unique: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    data: [stockMetaData] // Array of stock metadata
});

const Stock = mongoose.model('Stock', stockSchema);
module.exports = Stock
