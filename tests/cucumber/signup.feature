Feature: Signup

  Scenario: Successful signup
    Given I am on the signup page
    When I enter a username
    And I enter an email
    And I enter matching passwords
    And I click the Sign Up button
    Then I should be redirected to the work in progress page

  Scenario: Password mismatch
    Given I am on the signup page
    When I enter different passwords
    And I click the Sign Up button
    Then I should see "Passwords do not match."

