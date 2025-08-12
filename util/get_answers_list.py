"""
Generates all possible answers for daily word.
Returns list
"""

# Variables
from session.session import session

def getAnswersList():
  l = []
  letter_set = session.master_set
  for k in session.master_dictionary.keys():
    if session.center_letter in k:
      if set(k).issubset(letter_set):
        l.append(k)
  return l
