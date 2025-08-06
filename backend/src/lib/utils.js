import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    httpOnly: true,                  // prevent XSS
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // allow cross-site in prod
    secure: process.env.NODE_ENV === "production", // cookie only over HTTPS in prod
  });

  return token;
};
