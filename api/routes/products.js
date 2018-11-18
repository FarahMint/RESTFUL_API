const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const mongoose = require("mongoose");
const multer = require("multer");
const checkAuth = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.get("/", (req, res, next) => {
  Product.find()
    .select("name price _id  productImage")
    .then(docs => {
      const response = {
        count: docs.length,
        products: docs.map(doc => {
          return {
            name: doc.name,
            price: doc.price,
            productImage: doc.productImage,
            _id: doc._id,
            request: {
              type: "GET",
              url: `http://localhost:3000/products/${doc._id}`
            }
          };
        })
      };
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

// POST
router.post("/", upload.single("productImage"), checkAuth, (req, res, next) => {
  console.log(req.file);
  // create new instance of db model
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  });
  product
    .save()
    .then(result => {
      // console.log(result);
      // return obj created
      res.status(201).json({
        msg: `this is a Post request for products`,
        createdProduct: {
          name: result.name,
          price: result.price,
          productImage: result.productImage,
          _id: result._id,
          request: {
            type: "GET",
            url: `http://localhost:3000/products/${result._id}`
          }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

// GET A SINGLE PRODUCT - TARGET WITH ID
//  in express var are identified with :name you want
router.get("/:productId", (req, res, next) => {
  // extract product id
  const id = req.params.productId;
  Product.findById(id)
    .select("name price _id")
    .then(doc => {
      console.log(`From database ${doc}`);
      if (doc) {
        res.status(200).json({
          product: doc,
          request: {
            type: "GET",
            url: `http://localhost:3000/products/${doc._id}`
          }
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});
// PATCH A SINGLE PRODUCT - TARGET WITH ID
router.patch("/:productId", (req, res, next) => {
  const id = req.params.productId;

  const updateOps = {};
  for (let ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Product.update({ _id: id }, { $set: updateOps })
    .select("name price _id")
    .then(result => {
      // console.log(`from db${result}`);
      res.status(200).json({
        message: `Product updated`,
        request: {
          type: "GET",
          url: `http://localhost:3000/products/${id}`
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});
// GET A SINGLE PRODUCT - TARGET WITH ID
//  in express var are identified with :name you want
router.delete("/:productId", (req, res, next) => {
  const id = req.params.productId;

  //remove any obj in db that fullfills that criteria
  Product.deleteOne({ _id: id })
    .select("name price _id")
    .then(result => {
      res.status(200).json({
        message: "product deleted",
        request: {
          type: "POST",
          url: `http://localhost:3000/products`,
          body: { name: "String", price: "Number" }
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
