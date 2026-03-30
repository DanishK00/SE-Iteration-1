describe("Backend signup checks", function () {
  function validateSignup(username, email, password, confirmPassword) {
    if (!username || !email || !password || !confirmPassword) {
      return "All fields are required.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    return "Account created successfully.";
  }

  it("should reject missing fields", function () {
    expect(validateSignup("", "a@test.com", "123", "123"))
      .toBe("All fields are required.");
  });

  it("should reject mismatched passwords", function () {
    expect(validateSignup("arul", "a@test.com", "123", "456"))
      .toBe("Passwords do not match.");
  });

  it("should accept valid signup input", function () {
    expect(validateSignup("arul", "a@test.com", "123", "123"))
      .toBe("Account created successfully.");
  });
});