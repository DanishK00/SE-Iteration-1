# features/copyToClipboard.feature
# Feature 3: Copy Response to Clipboard

Feature: Copy Response to Clipboard
  As a user
  I want to copy any individual LLM response to my clipboard
  So that I can use it outside the app without retyping

  Background:
    Given I am logged in
    And I am on the multi-LLM comparison page

  Scenario: Copy button is hidden before a response arrives
    When I check the checkbox for "llama3"
    And I type "Hello" into the prompt input
    And I click the send button immediately
    Then the copy button for "llama3" should not be visible

  Scenario: Copy button appears after a response is received
    When I check the checkbox for "llama3"
    And I type "What is gravity?" into the prompt input
    And I click the send button
    And I wait for the response to load
    Then the copy button for "llama3" should be visible

  Scenario: Each model column has its own copy button
    When I check the checkbox for "llama3"
    And I check the checkbox for "mistral"
    And I type "Hello" into the prompt input
    And I click the send button
    And I wait for the response to load
    Then the copy button for "llama3" should be visible
    And the copy button for "mistral" should be visible

  Scenario: Clicking copy button changes its label to Copied!
    When I check the checkbox for "llama3"
    And I type "Hello" into the prompt input
    And I click the send button
    And I wait for the response to load
    And I click the copy button for "llama3"
    Then the copy button for "llama3" should display "Copied!"

  Scenario: Copy button resets back to Copy after 2 seconds
    When I check the checkbox for "llama3"
    And I type "Hello" into the prompt input
    And I click the send button
    And I wait for the response to load
    And I click the copy button for "llama3"
    And I wait 2 seconds
    Then the copy button for "llama3" should display "Copy"
