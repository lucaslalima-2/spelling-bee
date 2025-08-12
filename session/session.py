""" Session class stores all necessary info for the current game instance"""

# Functions
from util.get_answers_list import getAnswersList

class Session:
  def __init__(self):
    self.answers = []
    self.center_letter = None
    self.dictionary = None
    self.letters = None
    self.max_score = None
    self.panagram = None
    self.percentages = [
      [0.00, "Good Start"],
      [0.15, "Moving Up"],
      [0.25, "Good"],
      [0.40, "Solid"],
      [0.50, "Nice"],
      [0.75, "Great"],
      [0.90, "Amazing"],
      [1.00, "Genius"]
    ]
    self.previous_answers = []
    self.rank = self.percentages[0][1]
    self.score = 0
    return

  def update_score(self, val):
    """ Each time we update score, we need to check rank"""
    self.score += val
    cur_percent = self.score / self.max_score

    pcur = 0 # pointer
    pnext = 1
    while pnext < len(self.percentages):
      next_percent = self.percentages[pnext][0]
      if cur_percent >= next_percent:
        pcur = pnext
        pnext += 1
      else:
        break

    self.rank = self.percentages[pcur][1]
    return

  def set_panagram(self, panagram, letter):
    """ Sets session variables from panagram """
    self.panagram = panagram
    self.letters = set(panagram)
    self.center_letter = letter
    self.answers = self.get_answers_list()
    return

  def get_answers_list(self):
    """ Generates possible answers for target panagram """
    l = []
    for word in self.dictionary.keys():
      if self.center_letter in word:
        if set(word).issubset(self.letters):
          l.append(word)
    return l

  def __str__(self):
    """ Prints session attributes except dictionary """
    s = ""
    for a, b in self.__dict__.items():
      if a!="dictionary":
        s += f"{a}: {b}\n"
    return s

session = Session()
