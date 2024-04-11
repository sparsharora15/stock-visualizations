const UserModel = require('../models/userModel');
const StockModel = require('../models/stockModel');
const { md5Hash, isValidEmail, isValidPassword, getData, convertToStockDataArray, filterAllData } = require('../services/utils');
const jwt = require('jsonwebtoken')
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (name.trim() === "") {
            return res.status(400).json({ message: "Name is required" });
        }
        if (!isValidPassword(password)) {
            return res.status(400).json({ message: "Password should contain at least one capital letter, one number, and be at least 6 characters long" });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        // Check if email is already registered
        const existingAdmin = await UserModel.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Hash password using MD5
        const hashedPassword = md5Hash(password);

        // Create new admin
        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword,
        });

        // Save user to database
        await newUser.save();

        res.status(201).json({ message: "Signup successfully" });
    } catch (error) {
        console.error("Error creating admin:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || email.trim() === "") {
            return res.status(400).json({ error: "Invalid email address" });
        }
        if (!password || password.trim() === "") {
            return res.status(400).json({ error: "Invalid password" });
        }

        const user = await UserModel.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ error: "Email not found" });
        }
        if (user.password !== md5Hash(password)) {
            return res.status(401).json({ error: "Incorrect password" });
        }
        const token = jwt.sign(
            { email: email, _id: user._id },
            process.env.JWTSECRETKET
        );
        return res
            .status(200)
            .json({ status: 200, msg: "Logged in", token: token });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "An unexpected error occurred" });
    }
};
const getStocksDataBySymbol = async (req, res) => {
    try {
        const { symbolName, userId } = req.body;
        if (!symbolName || symbolName.trim() === "" || !userId) {
            return res.status(400).json({ error: "Invalid stock symbol or user ID" });
        }

        const getStockData = await getData(symbolName);
        if (getStockData.data['Error Message']) {
            return res.status(404).json({ error: "Stock data not found" });

        }
        const newData = await convertToStockDataArray(getStockData.data);

        let stock = await StockModel.findOne({ symbol: symbolName });
        if (!stock) {
            // Ensure that the `symbol` field is set when creating a new StockModel instance
            stock = new StockModel({ symbol: symbolName, data: [...newData] });
            await stock.save();
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (user.stocks.includes(stock._id)) {
            return res.status(400).json({ error: "Stock already exists in user's portfolio" });
        }

        await UserModel.updateOne({ _id: userId }, { $addToSet: { stocks: stock._id } });

        res.status(200).json({ message: "Stock added successfully" });

    } catch (e) {
        // console.error(e);
        console.error({ error: "An unexpected error occurred" });
        return res.status(500).json({ error: "An unexpected error occurred" });
    }
};



const calculateHighLowForStocks = async (req, res) => {
    try {
        const { userId, searchQuery } = req.query;
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        let filter = { _id: { $in: user.stocks }, isDeleted: false };
        if (searchQuery) {
            filter.symbol = { $regex: searchQuery, $options: 'i' };
        }

        const result = await StockModel.aggregate([
            {
                $match: filter
            },
        ]);

        // if (!result || result.length === 0) {
        //     return res.status(404).json({ error: "No matching stocks found" });
        // }

        const filteredDataArray = result.map(element => {
            const data = filterAllData(element.data);
            return { ...data, symbol: element.symbol, _id: element._id };
        });

        res.status(200).json({ filteredDataArray, userName: user.name });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "An unexpected error occurred" });
    }
};


const getStockDataById = async (req, res) => {
    try {
        const { userId, stockId } = req.body;

        // Check if user exists
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if stock exists in user's stocks
        if (!user.stocks.includes(stockId)) {
            return res.status(404).json({ error: 'Stock not found in user\'s stocks' });
        }

        // Find the stock with the provided ID
        const stock = await StockModel.findById(stockId);
        if (!stock) {
            return res.status(404).json({ error: 'Stock not found' });
        }

        // Send the stock data
        res.status(200).json({ symbol: stock.symbol, data: stock.data, });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}
const deleteUserStock = async (req, res) => {
    const { stockId } = req.query;
    try {
        // Step 1: Update the stock document
        const stockUpdateResult = await StockModel.updateOne(
            { _id: stockId },
            { $set: { isDeleted: true } }
        );

        if (stockUpdateResult.nModified === 0) {
            return res.status(404).json({ message: "Stock not found." });
        }

        // Step 2: Remove the stock ID from the stocks array in the user document
        const userUpdateResult = await UserModel.updateOne(
            { stocks: stockId },
            { $pull: { stocks: stockId } }
        );

        if (userUpdateResult.nModified === 0) {
            return res.status(404).json({ message: "User not found or stock ID not present in user's stocks array." });
        }

        res.json({ message: "Stock deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
}


module.exports = { signup, login, getStocksDataBySymbol, calculateHighLowForStocks, getStockDataById, deleteUserStock }