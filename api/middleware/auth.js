const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // server very  if tokn is valid

  try {
    // take token form header
    const token = req.headers.authorization;
    console.log(token);
    const decoded = jwt.verify(req.body.token, process.env.JWT_KEY);
    req.userDate = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: `Auth failed`
    });
  }
};
