import jwt from "jsonwebtoken";

export const Authorization = async (req, res, next) => {
  try {
    let token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access Denied" });
    if (token.startsWith("Bearer ")) token = token.slice(7).trimStart();
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
