USAGE:
======
- git clone git@github.com:lucaslalima-2/spelling-bee.git <local-repo-name>
- source venv/bin/activate
- python3 app.py -w <daily word> -l <center letter>

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
│   └── dom.js
├── app.py  ← your existing Python logic

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
- A dedicated editor is needed to see all potential words for a given day, and cull unnecessary/antequated words
- Sliding effect between pages of found words. This transition should be smoother
- Word-preview & word-message have an animation when toggling the word-list-container arrow

RESTROSPECTIVE:
===============
I've learned a lot from this first html, css, js project. 
Here's a quickly-thought-of, succinct list, coming on the heels of my last PR:
- The power of html containers (div, span) and how I need to add more forethought into these in future projects
- The forethought when using flex objects
- The need for compartmentalizing my code (specifically js code) in the static folder
- When writing js, there is a large amount of code that can optimized by declaring global variables at the top of the file. Particularly a lot of code by declaring html variables as global ones at the top of the js file. This prevents lines similar to "document.getElementById...".