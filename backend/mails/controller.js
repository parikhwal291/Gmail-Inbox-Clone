import MailSchema from "./model.js";

export const createMail = async (req, res) => {
  const { sender, reciever, type, body } = req.body;
  try {
    const mail = new MailSchema({
      sender,
      reciever,
      type,
      body,
    });
    mail.save();
    res.status(201).json(mail);
  } catch (error) {
    res.status(500).json({ message: "Error creating mail", error });
  }
};

export const getMails = async (req, res) => {
  try {
    const mails = await MailSchema.find();
    res.status(200).json(mails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMail = async (req, res) => {
  const { id } = req.params;
  try {
    // Find the mail by ID and delete it
  } catch (error) {
    res.status(500).json({ message: "Error deleting mail", error });
  }
};

export const starMail = async (req, res) => {
  const { id } = req.params;
  try {
    // Find the mail by ID and mark it as starred
  } catch (error) {
    res.status(500).json({ message: "Error starring mail", error });
  }
};

const markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    // Find the mail by ID and mark it as read
  } catch (error) {
    res.status(500).json({ message: "Error marking mail as read", error });
  }
};
