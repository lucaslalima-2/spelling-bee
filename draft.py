#!/opt/xsite/cte/tools/python/latest/bin/python3 

# Libraries
import sys
import ipywidgets as widgets
from IPython.display import display

# Functions
from util.load_dictionary import loadDictionary
from util.vet_starting_word import vetStartingWord
from util.get_answers_list import getAnswersList
from util.get_max_score import getMaxScore
from util.check_answer import checkAnswer
from util.check_panagram import checkPanagram

# Variables
from session.session import session
from data.variables import answers_file

#input_box = widgets.Text(description="Word:")
#output = widgets.Output()

# Main
def main():
  # Need to load library / dictionary of words with scores
  session.master_dictionary = loadDictionary()

  # Prompt user for daily panagram & vets validity
  flag = False
  while not flag:
    todays_word = input("Input today's panagram: ").upper()
    flag = vetStartingWord(todays_word)

  # Prompts user for essential letter / middle letter
  flag = False
  while not flag:
    center_letter = input("Input today's center letter: ")
    flag = True if center_letter.upper() in todays_word and len(center_letter)==1 else False
    if not flag:
      print("(E) Spelling Bee -> main.py: Invalid. Input must len()=1 & must be in panagram.")

  session.panagram = todays_word
  session.master_set = set(todays_word)
  session.center_letter = center_letter.upper()

  # Find all possible words
  session.answers = getAnswersList()

  # Print answers to file
  with open(answers_file, "w") as o:
    for a in sorted(session.answers):
      o.write(a+ "\n")

  # Find max score
  session.max_score = getMaxScore()

  # Begins play
  while True:
    # Takes input
    answer = input(f"\t\t=== Score: {session.score} \ Rank: {session.rank} === \n\tAttempt: ").upper()
    # Checks answer
    valid = checkAnswer(answer)
    if not valid: continue
    # Checks pagram
    panagram = checkPanagram(answer)
    # Updates score
    session.update_score(session.master_dictionary[answer])
    # Updates previous list
    session.previous_answers.append(answer)
    print(f"+{session.master_dictionary[answer]}")

  # Generate display / game

# Anchor
if __name__ == "__main__":
  main()
