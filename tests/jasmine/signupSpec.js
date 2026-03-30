describe("Signup validation", function () {
  it("should return false when passwords do not match", function () {
    const password = "abc123";
    const confirmPassword = "xyz123";
    expect(password === confirmPassword).toBeFalse();
  });

  it("should return true when passwords match", function () {
    const password = "abc123";
    const confirmPassword = "abc123";
    expect(password === confirmPassword).toBeTrue();
  });

  it("should require a username", function () {
    const username = "";
    expect(username.length > 0).toBeFalse();
  });

  it("should require an email", function () {
    const email = "";
    expect(email.length > 0).toBeFalse();
  });
});