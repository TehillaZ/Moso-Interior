const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const User = require("../models/userModel");
const PasswordResetToken = require("../models/verifyModel")

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  await PasswordResetToken.deleteMany({ email });

  //create new code
  const code = crypto.randomInt(100000, 999999).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await PasswordResetToken.create({ email, code, expires });

  // send email
  // 2️⃣ ניסיון לשלוח מייל (לא קריטי)
    try {
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
      from: "no-reply@localhost",
      to: email,
      subject: "Password Reset Code",
      text: `Your code is: ${code}`
      });
      res.json({ message: "Reset code sent to email" });
      console.log("✅ Email sent");
      console.log("📬 Preview URL:", nodemailer.getTestMessageUrl(info));

    } catch (mailError) {
      // ⛔ המייל נכשל – אבל ההזמנה נשמרה
      console.error("❌ EMAIL FAILED");
      console.error("Reason:", mailError.message);
    }

  //// send email when the site has domain
  //#region MyRegion
  // const transporter = nodemailer.createTransport({
  //   service: "gmail",
  //   auth: { user: process.env.ADMIN_MAIL, pass: "yourpassword" }
  // });

  // console.log("good");

  // await transporter.sendMail({
  //   from: process.env.ADMIN_MAIL,
  //   to: email,
  //   subject: "Password Reset Code",
  //   text: `Your code is: ${code}`
  // });
  //#endregion


  // try {
  //   await transporter.sendMail({
  //     from: "no-reply@localhost",
  //     to: email,
  //     subject: "Password Reset Code",
  //     text: `Your code is: ${code}`
  //   });
  //   res.json({ message: "Reset code sent to email" });
  // } catch (err) {
  //   console.error(err);
  //   res.status(500).json({ message: "Error sending email" });
  // }


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









