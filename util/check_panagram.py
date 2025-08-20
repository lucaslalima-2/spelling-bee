""" Checks if word is a panagram"""

def check_panagram(word):
  """ If word has 7 unique letters, it's a panagram"""
  unique_chars = set(word)
  return len(unique_chars) == 7
