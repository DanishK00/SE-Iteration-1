const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  const users = JSON.parse(localStorage.getItem("tlebUsers")) || [];

  const foundUser = users.find(function (user) {
    return user.username === username && user.password === password;
  });

  if (foundUser) {
    localStorage.setItem("tlebLoggedInUser", username);

    loginMessage.textContent = "Login successful. Sending you to TLEB...";
    loginMessage.className = "message success";

    setTimeout(function () {
      window.location.href = "tleb.html";
    }, 900);
  } else {
    loginMessage.textContent = "Wrong username or password. Make sure you signed up first.";
    loginMessage.className = "message error";
  }
});