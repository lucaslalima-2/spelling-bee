""" Session class stores all necessary info for the current game instance"""

# Functions
# from util.get_answers_list import getAnswersList

class Session:
  def __init__(self):
    self.answers = []
    self.center_letter = None
    self.dictionary = None
    self.letters = None
    self.max_score = None
    self.panagram = None
    self.ring_letters = None
    self.score = 0
    return

  def set_panagram(self, panagram, letter):
    """ Sets session variables from panagram """
    self.panagram = panagram.upper()
    self.center_letter = letter.upper()
    self.letters = set([x.upper() for x in panagram])
    self.ring_letters = [x for x in list(self.letters) if x!=self.center_letter]
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
