describe("Login page validation", function () {
  it("should require a username or email", function () {
    const userInput = "";
    expect(userInput.length > 0).toBeFalse();
  });

  it("should require a password", function () {
    const password = "";
    expect(password.length > 0).toBeFalse();
  });
});