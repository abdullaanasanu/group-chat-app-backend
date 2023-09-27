const jwt = require("jsonwebtoken");
var mongoose = require("mongoose");
var User = mongoose.model("User");

function getTokenFromHeader(req) {
  if (
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Token") ||
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }

  return null;
}

exports.userAuth = (req, res, next) => {
  try {
    let token = getTokenFromHeader(req);
    if (!token) return next({ status: 401, message: " No Token Found " });
    jwt.verify(token, process.env.JWT_SECRET, async function (err, decode) {
        
        if (err) return next({ status: 401, message: " Invalid Token " });
        let user = await User.findById(decode.data.id);
        // let user = await User.findOne({ _id: decode.data.id, isActive: true })
        if (!user) return next({ status: 401, message: " Unauthorised Access " });
        req.payload = token;
        req.user = user;
        next();
    });
  } catch (err) {
    console.log(err);
    next({ status: 401, message: err });
  }
};

// module.exports = auth;
