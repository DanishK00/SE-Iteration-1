const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const app = express();

app.use(express.json());


let users = [
  {
    id: 1,
    username: "testuser",
    email: "student@rutgers.edu",
    password: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/U1C", // bcrypt hashed "password123"
    resetPasswordToken: null,
    resetPasswordExpires: null,
  }
];


// Hash password with bcrypt
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};


app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ message: "User with this email does not exist." });
  }

  // Generate secure reset token
  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

  // Return token for testing (in production, send via email)
  return res.status(200).json({ 
    message: "Password reset email sent.",
    token: resetToken 
  });
});

app.post("/api/auth/reset-password", async (req, res) => {
  const { token, newPassword, confirmNewPassword } = req.body;

  if (!token || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ message: "Token and new passwords are required." });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: "New passwords do not match." });
  }

  const user = users.find(
    u => u.resetPasswordToken === token && u.resetPasswordExpires > Date.now()
  );

  if (!user) {
    return res.status(400).json({ message: "Password reset token is invalid or has expired." });
  }

  // Hash the new password before storing
  user.password = await hashPassword(newPassword); 
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  return res.status(200).json({ message: "Password has been successfully reset." });
});

// Export the app for Supertest/Jasmine to use
module.exports = app;

// Start server only if not running inside a test suite
if (require.main === module) {
  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });
}