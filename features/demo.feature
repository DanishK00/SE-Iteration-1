Feature: Demo setup test

  Scenario: Open a page and check title
    Given I open a browser
    When I go to "https://example.com"
    Then I should see the title contains "Example"