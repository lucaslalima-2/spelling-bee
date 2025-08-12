""" Session class stores all necessary info for the current game instance"""

class Session:
  def __init__(self):
    self.answers = None
    self.center_letter = None
    self.master_dictionary = None
    self.master_set = None
    self.master_word = None
    self.max_score = None
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

  def updateScore(self, val):
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

  def __str__(self):
    s = ""
    for a, b in self.__dict__.items():
      if a!="master_dictionary":
        s += f"{a}: {b}\n"
    return s

session = Session()
