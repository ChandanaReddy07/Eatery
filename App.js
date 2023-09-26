const mongoose = require("mongoose");
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
// const billRoutes=require("./routes/bill")
const userRoutes=require("./routes/user")
const orderRoutes=require("./routes/order")
const menuRoutes=require("./routes/food")
const paymentRoutes=require("./routes/payment")

// Middle wares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());


// Routes
app.use("/user", userRoutes);
app.use("/order", orderRoutes);
app.use("/menu", menuRoutes);
app.use("/payment", paymentRoutes);


mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
  })
  .then(() => {
    console.log("DB IS CONNECTED");
  });

app.listen(3001, () => {
  console.log(`jebhdhbkd ${3001}`);
});
