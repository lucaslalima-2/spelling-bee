"""
Determines max score form session.answers_list
"""

# Variables
from session.session import session

def get_max_score():
  score = 0
  for w in session.answers:
    score += session.dictionary[w]
  return score
