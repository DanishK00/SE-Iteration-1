const signupForm = document.getElementById("signupForm");
const signupMessage = document.getElementById("signupMessage");

signupForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const username = document.getElementById("signupUsername").value.trim();
  const password = document.getElementById("signupPassword").value.trim();

  if (username.length < 3) {
    signupMessage.textContent = "Username must be at least 3 characters.";
    signupMessage.className = "message error";
    return;
  }

  if (password.length < 4) {
    signupMessage.textContent = "Password must be at least 4 characters.";
    signupMessage.className = "message error";
    return;
  }

  const users = JSON.parse(localStorage.getItem("tlebUsers")) || [];

  const usernameTaken = users.some(function (user) {
    return user.username.toLowerCase() === username.toLowerCase();
  });

  if (usernameTaken) {
    signupMessage.textContent = "That username is already taken.";
    signupMessage.className = "message error";
    return;
  }

  users.push({
    username: username,
    password: password
  });

  localStorage.setItem("tlebUsers", JSON.stringify(users));

  signupMessage.textContent = "Account created. Redirecting to login...";
  signupMessage.className = "message success";

  setTimeout(function () {
    window.location.href = "login.html";
  }, 1000);
});