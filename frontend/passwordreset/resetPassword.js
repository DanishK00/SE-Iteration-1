// Get reset token from URL
function getTokenFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("token");
}

// Handle Reset Password Form Submission
document.getElementById("resetPasswordForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = getTokenFromURL();
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const messageDiv = document.getElementById("message");

  if (!token) {
    messageDiv.className = "message error";
    messageDiv.textContent = "Invalid reset link. Please request a new one.";
    return;
  }

  try {
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        newPassword,
        confirmNewPassword: confirmPassword,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      messageDiv.className = "message success";
      messageDiv.textContent = "Password reset successful! Redirecting to login...";
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
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