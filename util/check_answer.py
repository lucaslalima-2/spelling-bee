"""
Checks user input answer
"""

# Variables
from session.session import session

def checkAnswer(answer):
    # Checks if answer uses correct letters 
    if not set(answer).issubset(session.master_set):
      return False

    # Checks if answer is a valid word in dictionary
    if answer not in session.master_dictionary:
      return False

    # Checks if user already answered this word
    if answer in session.previous_answers:
      return False

    return True
