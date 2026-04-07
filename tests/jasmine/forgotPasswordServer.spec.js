describe('Forgot Password Functionality', () => {
    it('should send a password reset email when the user exists', async () => {
        // Simulate user input
        const email = 'user@example.com';

        // Mock the function that sends the email
        const sendResetEmail = jest.fn();

        // Call the forgotPassword function
        await forgotPassword(email, sendResetEmail);

        // Check if the email sending function was called with the correct email
        expect(sendResetEmail).toHaveBeenCalledWith(email);
    });

    it('should not send a password reset email when the user does not exist', async () => {
        // Simulate user input
        const email = 'nonexistent@example.com';

        // Mock the function that checks for user existence
        const userExists = jest.fn().mockReturnValue(false);

        // Call the forgotPassword function
        await forgotPassword(email, userExists);

        // Check that the email sending function was not called
        expect(userExists).toHaveBeenCalledWith(email);
        expect(sendResetEmail).not.toHaveBeenCalled();
    });

    it('should throw an error for invalid email format', async () => {
        // Simulate invalid user input
        const invalidEmail = 'invalid-email';

        // Call the forgotPassword function and expect it to throw
        await expect(forgotPassword(invalidEmail)).rejects.toThrow('Invalid email format');
    });
});