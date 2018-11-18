const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

// Routes handle request
const productsRoutes = require("./api/routes/products");
const ordersRoutes = require("./api/routes/orders");
const usersRoutes = require("./api/routes/users");

// connect to DB
// https://github.com/Automattic/mongoose/issues/6890
mongoose.connect(
  `mongodb://admin:${
    process.env.MONGO_PW
  }@ds057548.mlab.com:57548/shopping-card`,
  { useNewUrlParser: true, autoIndex: false }
);
//for img to upload make uploads folder publicly available
app.use("/uploads", express.static("uploads"));

app.use(morgan("dev")); // tool that console.log dev info in terminal
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // extract json data and make it readable

app.use((req, res, next) => {
  res.header("Acces-Control-Allow-Origin", "*"); // 8 give access to any origin
  res.header(
    "Acces-Control-Allow-Headers",
    "Origin , X-Requested-With, Content-Type, Accept, Authorization"
  ); // all those headers can be appended to an incoming request

  if (req.method === "OPTIONS") {
    // browser always sent an options req 1rst when we sent post|| put req
    //browser see if it can make the req/ is allowed to
    //in this case add additional headers to tell browser waht it can send
    res.header("Access-Control-Allow-Methods", "PUT, POST , PATCH, GET,DELETE"); // all req we want to suppot in our API

    return res.status(200).json({});
  }
  next(); // so the other routes can take other
});

app.use("/products", productsRoutes);
app.use("/orders", ordersRoutes);
app.use("/users", usersRoutes);

// ERROR HANDLING IN APP
//Handle all req that reach this line because if reach that routes, it means that none of the routes(from products & orders.js) were able to handle the request
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404; // did not find the fitting route
  //error.status(404); //try execute this line instead of the one above to see err  :)
  next(error); // fwd this err and not the original
});

// add other middleware + argument error
app.use((error, req, res, next) => {
  // handle all kinds of err from above or anywhere from app

  res.status(error.status || 500); // did not find the fitting route
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;
