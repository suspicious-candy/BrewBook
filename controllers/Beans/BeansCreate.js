import bean from "../../models/Beans.js";
export async function createBeans (req, res) {
  res.status(201).send("you just created a bean");
};
