# features/multiLLM.feature
# Covers: querying multiple LLMs simultaneously and comparing responses

Feature: Multi-LLM Simultaneous Comparison
  As a user
  I want to send one prompt to multiple LLMs at the same time
  So that I can compare their responses side by side

  Background:
    Given I am logged in
    And I am on the multi-LLM comparison page

  Scenario: User selects multiple models and sends a prompt
    When I check the checkbox for "llama3"
    And I check the checkbox for "mistral"
    And I type "Explain gravity" into the prompt input
    And I click the send button
    Then I should see a response column for "llama3"
    And I should see a response column for "mistral"

  Scenario: User sees a loading state while responses are being fetched
    When I check the checkbox for "llama3"
    And I type "Hello" into the prompt input
    And I click the send button
    Then the response column for "llama3" should initially show "Waiting..."

  Scenario: User cannot send with no models selected
    When no checkboxes are checked
    And I type "Hello" into the prompt input
    And I click the send button
    Then I should see the alert "Please select at least one model."

  Scenario: User cannot send with an empty prompt
    When I check the checkbox for "llama3"
    And the prompt input is empty
    And I click the send button
    Then no response row should be added to the grid

  Scenario: User sees their prompt displayed above the responses
    When I check the checkbox for "gemma"
    And I type "What is the capital of France?" into the prompt input
    And I click the send button
    Then the comparison row should display "What is the capital of France?" as the prompt label

  Scenario: Partial failure — one model errors but others still respond
    Given the model "mistral" is unavailable
    When I check the checkbox for "llama3"
    And I check the checkbox for "mistral"
    And I type "Hello" into the prompt input
    And I click the send button
    Then the "llama3" column should show a response
    And the "mistral" column should show an error message
