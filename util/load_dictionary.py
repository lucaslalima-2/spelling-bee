"""
Loads master library with values into memory.
"""
# Variables
from data.variables import master_dictionary

# Functions
from util.check_panagram import check_panagram

def load_dictionary():
  d = {}
  with open(master_dictionary, "r") as md:
    for w in md:
      if w[0]=="#": continue
      word = w.strip().upper()
      d[word] = len(word) if len(word) > 4 else 1
      d[word] += 7 if check_panagram(word) else 0 # panagram bonus = 7
  return d
