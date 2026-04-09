Feature: Pause and resume AI generation

  Scenario: Successfully paused AI generation
    Given the user is currently generating content with AI in a conversation
    When the user switches from the current conversation page
    Then the AI’s generation should automatically pause and be saved to the conversation’s history

  Scenario: Successfully resumed AI generation
    Given the user is returning to a previously saved conversation with the AI while it was paused partway through generating content
    When the user clicks a button to resume the AI's generation of content
    Then the AI should resume its generation of content from where it last left off
