Feature: Login and logout

  Scenario: Successful login
    Given I am on the login page
    When I enter a username or email
    And I enter a password
    And I click the Log In button
    Then I should be redirected to the work in progress page

  Scenario: Logout returns to landing page
    Given I am on the work in progress page
    When I click the Log Out link
    Then I should be redirected to the landing page

