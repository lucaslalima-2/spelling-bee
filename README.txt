GENERAL DEVELOPMENT:
====================
This is the install statement I'm using
#!/opt/xsite/cte/tools/python/latest/bin/python3

Master list of library words from here:
https://gist.githubusercontent.com/deostroll/7693b6f3d48b44a89ee5f57bf750bd32/raw/426f564cf73b4c87d2b2c46ccded8a5b98658ce1/dictionary.txt

This command helps generate list of words greater than 3 letters:
  awk -F, 'length($0) >=4 { print }' ./master_library.txt >| output.txt

The following directory structure is used:
spellingbee/
├── app.py
├── templates/
│   └── index.html
├── static/
│   ├── style.css
│   └── script.js
├── game.py  ← your existing Python logic

RULES:
=====
- Words must be at least 4 letters long. 
- Words must include the center letter of the puzzle. 
- Hyphenated words, proper nouns, and offensive words are not allowed, according to Word Raiders. 
- Any letter can be used multiple times, according to Word Raiders.

SCORING:
========
- Four-letter words are worth 1 point,according to the NYT. 
- Longer words are worth their length in points (e.g., a 6-letter word is worth 6 points). 
- Pangrams add 7 points to the total.

FUTURE UPDATES:
===============
- Create binary search tree to increase speed of max_score evaluation
- Update dictionary list to remove all words with 8+ unique letters, as they will never be used.
