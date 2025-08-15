#!/opt/xsite/cte/tools/python/latest/bin/python3 

# GUI Libraries
from flask import Flask, render_template, request, redirect, url_for, jsonify
import threading, webbrowser, os

# Python Libraries
import argparse

# Functions
from util._checkAnswer import _checkAnswer
from util.check_panagram import checkPanagram
from util.load_dictionary import loadDictionary

# Variables
from session.session import session

# Application intialization and thread start
app = Flask(__name__)

""" Helps automatically open browser """
def open_browser():
  system = "mac" if os.name=="posix" else "windows"
  browser = webbrowser.get("firefox") if system=="windows" else webbrowser.get("chrome")
  browser.open_new("http://127.0.0.1:5000/")
  #webbrowser.open_new_tab("http://127.0.0.1:5000/")
  return

""" Initializes webpage """
@app.route("/")
def index():
  if request.method=="POST": pass #handles form submission or AJAX 
  return render_template("index.html", panagram=session.panagram, score=session.score)

""" Define behavior on submit-word """
@app.route("/submit_answer", methods=["POST"])
def submit_answer():
  data = request.get_json()
  word = data.get("word", "").upper() # allows for json parse
  if word in session.answers:
    session.score = session.dictionary[word]
    return jsonify({"status": "success", "word": word})
  else:
    return jsonify({"status": "fail", "word": word})

""" Anchor """
if __name__ == "__main__":
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

  # App running
  threading.Timer(1.0, open_browser).start()
  app.run(debug=True, use_reloader=False)