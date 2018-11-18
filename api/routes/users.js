const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// POST -create a new user
router.post("/signup", (req, res, next) => {
  //ensure we have email once -before hash try to store user
  User.find({ email: req.body.email }).then(user => {
    if (user.length >= 1) {
      return res.status(409).json({
        message: `Mail exists`
      });
    } else {
      //Execute bcrypt
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({
            error: err
          });
          // only if we make it to else clause only then we will create a new user
          // create user ex
          //pwd store withbcrypt
        } else {
          const user = new User({
            _id: new mongoose.Types.ObjectId(),
            email: req.body.email,
            password: hash
          });
          user
            .save()
            .then(result => {
              console.log(result);
              res.status(201).json({
                msg: `user created`
              });
            })
            .catch(err => {
              console.log(err);
              res.status(500).json({ error: err });
            });
        }
      });
    }
  });
});

router.post("/login", (req, res, next) => {
  //  check if have user for any given address
  User.find({ email: req.body.email }).then(user => {
    if (user.length < 1) {
      // we have no user
      return res.status(401).json({
        message: `Auth failed`
      });
    }
    // we found the user - now check pwd
    bcrypt
      .compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: `Auth failed`
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              //  what we want to pass to the client - payload
              email: user[0].email,
              userId: user[0]._id
            },
            process.env.MONGO_PW,
            {
              expiresIn: "1h"
            }
          );
          // last arg is a cb when we get our token though we can omit cb and create const token and it will run async
          return res.status(200).json({
            message: `Auth successful`,
            token: token
          });
        }
        res.status(401).json({
          message: `Auth failed`
        });
      })
      .catch(err => {
        res.status(500).json({
          error: err
        });
      });
    //Execute bcrypt
  });
});

router.delete("/user:UserId", (req, res, next) => {
  const id = req.params.productId;
  User.deleteOne(id)
    .then(result => {
      res.status(200).json({ messsage: `user deleted` });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
