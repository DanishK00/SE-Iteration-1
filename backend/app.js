const express = require("express");
const app = express();

app.use(express.json());

// Placeholder signup route
app.post("/signup", (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  return res.status(200).json({ message: "Account created successfully." });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});