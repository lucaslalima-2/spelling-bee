#!/opt/xsite/cte/tools/python/latest/bin/python3 

# GUI Libraries
from flask import Flask, render_template, request, jsonify
import threading
import webbrowser

# Python Libraries
import argparse

# Functions
from util._checkAnswer import _checkAnswer
from util.check_panagram import checkPanagram
from util.load_dictionary import loadDictionary

# Variables
from session.session import session

"""
Helps automatically open browser
"""
def open_browser():
  webbrowser.open_new("http://127.0.0.1:5000/")
  return

"""
Initialization
"""
# Handles input
parser = argparse.ArgumentParser(description="Luke's Spelling Bee")
parser.add_argument("-w", "--word", required=True, help="Daily panagram!")
parser.add_argument("-l", "--letter", required=True, help="Center letter")
args = parser.parse_args()
panagram = vars(args)["word"]
center_letter = vars(args)["letter"]

# Checks panagram
proceed = checkPanagram(panagram)
if not proceed: print("Spelling Bee -> app.py: Invalid panagram."); exit()
else: print(f"Spelling Bee: Panagram approved={panagram}. Happy spelling!")

# Stores session
session.dictionary = loadDictionary()
session.set_panagram(panagram, center_letter)

"""
Application backend
"""
app = Flask(__name__)

@app.route("/")
def index():
  return render_template("index.html", target=session.panagram)

@app.route("/check", methods=["POST"])
def check_word(): # function name is trivial
  word = request.json.get("word", "").lower()
  res = _checkAnswer(word)
  return jsonify({"valid": res})

if __name__ == "__main__":
  threading.Timer(1.0, open_browser).start()
  app.run(debug=True)
