import Notes from "../../models/notes.js";
import Brewer from "../../models/Brewers.js";
import bean from "../../models/Beans.js";

export async function createNotes(req, res) {
  try {
    const { BrewerID, beanId, ...rest } = req.body;

    let brewerObjectId;
    if (BrewerID !== undefined) {
      const brewer = await Brewer.findOne({ BrewerID });
      if (!brewer) return res.status(404).json({ message: "Brewer not found" });
      brewerObjectId = brewer._id;
    }

    let beanObjectId;
    if (beanId !== undefined) {
      const BeanObj = await bean.findOne({ beanId });
      if (!BeanObj) return res.status(404).json({ message: "bean not found" });
      beanObjectId = BeanObj._id;
    }

    const newNote = new Notes({ ...rest, bean:beanObjectId ,Brewer: brewerObjectId });
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (error) {
    console.error("Error in createNotes", error);
    res.status(500).json({ message: "Internal Server Issue" });
  }
}