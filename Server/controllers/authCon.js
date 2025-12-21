const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const User = require("../models/userModel");
const PasswordResetToken = require("../models/verifyModel")

const forgotPassword = async (req, res) => {
  console.log("🔥 forgotPassword CALLED");

  try {
    const { email } = req.body;
    if (!email) {
      console.log("❌ no email");
      return res.status(400).json({ message: "Email required" });
    }

    console.log("📩 email:", email);

    await PasswordResetToken.deleteMany({ email });
    console.log("🧹 old tokens deleted");

    const code = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await PasswordResetToken.create({ email, code, expires });
    console.log("🔐 reset code saved:", code);

    // MAIL
    console.log("📨 Trying to send email...");

    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    const info = await transporter.sendMail({
      from: "no-reply@moso-interior.com",
      to: email,
      subject: "Password Reset Code",
      text: `Your code is: ${code}`
    });

    console.log("✅ Email sent");
    console.log("📬 Preview URL:", nodemailer.getTestMessageUrl(info));

    return res.json({ message: "Reset code created (check logs for email preview)" });

  } catch (err) {
    console.error("❌ forgotPassword ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// reset the password to a new one
const resetPassword = async (req, res) => {

 const { email, code, newPassword } = req.body;
  if (!newPassword) return res.status(400).json({ message: "New password required" });


  const tokenEntry = await PasswordResetToken.findOne({ email, code });
  if (!tokenEntry) return res.status(400).json({ message: "Invalid code" });
  if (tokenEntry.expires < new Date()) return res.status(400).json({ message: "Code expired" });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.updateOne({ email }, { password: hashedPassword });

 
  await PasswordResetToken.deleteMany({ email });

  res.json({ message: "Password reset successfully" });
};

// check if the code is right and valid - the code is kept in DB 
const VerifyCode = async (req, res) => {

  const { email, code } = req.body;
  console.log(req.body);

  if (!email || !code)
    return res.status(400).json({ message: "Email and code are required" });

  const tokenEntry = await PasswordResetToken.findOne({ email, code });
  if (!tokenEntry)
    return res.status(400).json({ message: "Invalid code" });

  if (tokenEntry.expires < new Date())
    return res.status(400).json({ message: "Code expired" });

  res.json({ message: "Code verified successfully" });

};

module.exports = {forgotPassword,resetPassword,VerifyCode}









