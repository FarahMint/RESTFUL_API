const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const Product = require("../../api/models/product");
const mongoose = require("mongoose");

// handle incoming request to /orders(see app.js)
router.get("/", (req, res, next) => {
  Order.find()
    .select("product quantity _id")
    .populate("product", "name price")
    .then(docs => {
      res.status(200).json({
        counts: docs.length,
        orders: docs.map(doc => {
          return {
            quantity: doc.quantity,
            product: doc.product,
            _id: doc._id,
            request: {
              type: "GET",
              url: `http://localhost:3000/orders${doc._id}`
            }
          };
        })
      });
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
});

// POST
router.post("/", (req, res, next) => {
  // to make sure we don't create order for product that does not exist
  // So 1 we check we have product
  Product.findById(req.body.productId)
    .then(product => {
      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }
      // create order ex
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId
      });
      // 2 save it
      return order.save();
    })
    // 3 then execute others step
    .then(result => {
      res.status(201).json({
        message: "Order stored",
        createdOrder: {
          id: result._id,
          quantity: result.quantity,
          product: result.product
        },
        request: {
          type: "GET",
          URL: `http://localhost:3000/orders${result._id}`
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

// GET A SINGLE ORDER - TARGET WITH ID
//  in express var are identified with :name you want
router.get("/:orderId", (req, res, next) => {
  // extract product id
  const id = req.params.orderId;
  Order.findById(id)
    .select("product quantity _id")
    .populate("product", "name price")
    .then(order => {
      if (!order) {
        return res.status(200).json({
          message: `Order not found`
        });
      }
      res.status(200).json({
        order: order,
        request: {
          type: "GET",
          url: `http://localhost:3000/orders}`
        }
      });
    });
});

// PATCH A SINGLE ORDER - TARGET WITH ID
router.patch("/:orderId", (req, res, next) => {
  const id = req.params.orderId;
  const updateOps = {};
  for (let ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Order.update({ _id: id }, { $set: updateOps })
    .select("product quantity _id")
    .then(result => {
      res.status(200).json({
        message: `order updated`,
        request: {
          type: "GET",
          url: `http://localhost:3000/orders/${id}`
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});
// GET A SINGLE ORDER - TARGET WITH ID
//  in express var are identified with :name you want
router.delete("/:orderId", (req, res, next) => {
  const id = req.params.orderId;
  Order.deleteOne({ _id: id })
    .select("product quantity _id")
    .then(result => {
      res.status(200).json({
        message: `Order deleted`,
        request: {
          type: "POST",
          url: `http://localhost:3000/orders`,
          body: { productId: "Id", quantity: "Number" }
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
