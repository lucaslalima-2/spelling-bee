"""
Determines max score form session.answers_list
"""

# Variables
from session.session import session

def getMaxScore():
  score = 0
  for w in session.answers:
    score += session.master_dictionary[w]
  return score
