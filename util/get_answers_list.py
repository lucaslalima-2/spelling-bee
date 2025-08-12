"""
Generates all possible answers for daily word.
Returns list
"""

def getAnswersList(session):
  l = []
  letters = session.letters
  for k in session.dictionary.keys():
    if session.center_letter in k:
      if set(k).issubset(letter_set):
        l.append(k)
  return l
