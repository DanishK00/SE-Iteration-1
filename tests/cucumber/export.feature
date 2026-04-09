Feature: Export conversations as text and PDF files

  Scenario: Successfully exported a conversation
    Given the user has an active conversation
    When the user clicks the export button after selecting between the text and PDF file types
    Then the entirety of the conversation should be exported as a file of the selected type
