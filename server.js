require("dotenv").config();

const nodemailer = require("nodemailer");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* ======================
   Middleware
====================== */
app.use(cors({
  origin: "*"
}));
app.use(express.json());

/* ======================
   MongoDB Connection
====================== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log("Mongo Error ❌", err));

/* ======================
   Nodemailer Setup
====================== */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* ======================
   Schema
====================== */
const EnquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  city: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const Enquiry = mongoose.model("Enquiry", EnquirySchema);

/* ======================
   API Route
====================== */
app.post("/enquiry", async (req, res) => {
  try {
    console.log("Received:", req.body);

    const { name, phone, city, message } = req.body;

    // Basic validation
    if (!name || !phone) {
      return res.status(400).send("Name and Phone are required");
    }

    // Save to DB
    const enquiry = new Enquiry({ name, phone, city, message });
    await enquiry.save();

    // Send Email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Amtech Enquiry 🚀",
      html: `
        <h3>New Enquiry Received</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>City:</b> ${city || "N/A"}</p>
        <p><b>Message:</b> ${message || "N/A"}</p>
      `
    });

    res.status(200).send("Saved & Email Sent ✅");

  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Server Error ❌");
  }
});

/* ======================
   Server
====================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});