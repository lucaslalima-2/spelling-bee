""" Addtional checks to user's input for today's word """

# Functions
from util.check_panagram import checkPanagram

# Variables
from session.session import session

def vetStartingWord(word):
  # Check if word is in master dictionary
  dic = session.master_dictionary
  if word not in dic:
    print("(E) Spelling Bee -> vet_input.py: Input word is not in dictionary.")
    return False
  if not checkPanagram(word):
    print("(E) Spelling Bee -> vet_input.py: Input word is not a panagram.")
    return False
  return True
