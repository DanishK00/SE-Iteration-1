// Handle Forgot Password Form Submission
document.getElementById("forgotPasswordForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const messageDiv = document.getElementById("message");

  try {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      messageDiv.className = "message success";
      messageDiv.textContent = "Password reset link sent! Check your email.";
      document.getElementById("forgotPasswordForm").reset();
    } else {
      messageDiv.className = "message error";
      messageDiv.textContent = data.message;
    }
  } catch (error) {
    messageDiv.className = "message error";
    messageDiv.textContent = "An error occurred. Please try again.";
    console.error("Error:", error);
  }
});