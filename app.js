const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const morgan = require('morgan');
const port = process.env.PORT || 4000;
app.use(express.json());
app.use(cors());
const { connect } = require("./db");
connect();
const userRoutes = require("./routes/");
app.use('/api/user',userRoutes)
app.use(morgan('dev'));
app.listen(port, () => {
  console.log(`server is running at ${port}`);
});
