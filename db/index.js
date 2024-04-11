const mongoose = require("mongoose");
const connectionUrl = process.env.CONNECTION_URI;
exports.connect = async () => {
  try {
    await mongoose.connect(connectionUrl);
    console.log("connnected to db");
  } catch (e) {
    console.log(e);
  }
};
