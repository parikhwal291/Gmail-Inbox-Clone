import MailSchema from "./model.js";

export const createMail = async (req, res) => {

  try {
    const mail = new MailSchema(req.body);
    const savedMail = await mail.save();
    res.status(201).json(savedMail);
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
    const deletedMail = await MailSchema.findByIdAndDelete(id);

    if (!deletedMail) {
      return res.status(404).json({ message: "Mail not found" });
    }

    res.status(200).json({ message: "Mail deleted successfully", deletedMail });
  } catch (error) {
    res.status(500).json({ message: "Error deleting mail", error });
  }
};

export const starMail = async (req, res) => {
  const { id } = req.params;
  try {
    // Find the mail by ID and mark it as starred
    const email = await MailSchema.findById(id);
    if (!email) {
      return res.status(404).json({ message: "Email not found" });
    }

    email.starred = !email.starred;
    await email.save();

    res.status(200).json({ message: "Email star status updated", email });
  } catch (error) {
    res.status(500).json({ message: "Error starring mail", error });
  }
};

export const markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    // Find the mail by ID and mark it as read
    const updatedMail = await MailSchema.findByIdAndUpdate(
      id,
      { status: "seen" },
      { new: true }
    );

    if (!updatedMail) {
      return res.status(404).json({ message: "Mail not found" });
    }

    res.status(200).json({ message: "Mail marked as seen", mail: updatedMail });
  } catch (error) {
    res.status(500).json({ message: "Error marking mail as read", error });
  }
};
