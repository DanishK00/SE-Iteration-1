# features/responseTimer.feature
# Feature 2: Response Timer — each model column shows elapsed response time

Feature: Response Timer
  As a user
  I want to see how long each LLM took to respond
  So that I can compare the speed of different models

  Background:
    Given I am logged in
    And I am on the multi-LLM comparison page

  Scenario: Timer shows waiting state before response arrives
    When I check the checkbox for "llama3"
    And I type "Hello" into the prompt input
    And I click the send button immediately
    Then the timer for "llama3" should show "waiting..."

  Scenario: Timer updates with elapsed time after response arrives
    When I check the checkbox for "llama3"
    And I type "What is recursion?" into the prompt input
    And I click the send button
    And I wait for the response to load
    Then the timer for "llama3" should show a time in seconds

  Scenario: Each model has its own independent timer
    When I check the checkbox for "llama3"
    And I check the checkbox for "mistral"
    And I type "Hello" into the prompt input
    And I click the send button
    And I wait for the response to load
    Then the timer for "llama3" should show a time in seconds
    And the timer for "mistral" should show a time in seconds

  Scenario: Timer format matches the expected pattern
    When I check the checkbox for "llama3"
    And I type "Hello" into the prompt input
    And I click the send button
    And I wait for the response to load
    Then the timer for "llama3" should match the pattern "⏱ X.Xs"
