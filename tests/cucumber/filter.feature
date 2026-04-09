Feature: Filter conversations

  Scenario: Successfully filtered conversations
    Given the user has entered a keyword
    When the user submits their input
    Then the user should only see conversations that include the relevant keyword
