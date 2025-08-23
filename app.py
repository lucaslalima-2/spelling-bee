#!/opt/xsite/cte/tools/python/latest/bin/python3 

# GUI Libraries
from flask import Flask, render_template, request, redirect, url_for, jsonify
import threading, webbrowser, os

# Python Libraries
import argparse

# Functions
from util.check_panagram import check_panagram
from util.load_dictionary import load_dictionary
from util.get_max_score import get_max_score

# Variables
from session.session import session

# Application intialization and thread start
app = Flask(__name__)

""" Initializes webpage """
@app.route("/")
def index():
  if request.method=="POST": pass #handles form submission or AJAX 
  print("Spelling Bee -> app.py: Rendering index.html")
  x = render_template("index.html",
    panagram=session.panagram,
    all_letters=session.all_letters,
    center_letter=session.center_letter,
    ring_letters=session.ring_letters,
    max_score=session.max_score
  )

  print(x)
  return x 

""" Define behavior on submit-word """
@app.route("/submit_answer", methods=["POST"])
def submit_answer():
  data = request.get_json()
  word = data.get("word", "")

  if word in session.answers:
    value = session.dictionary[word]
    return jsonify({"status": "success", "word": word, "value": value})
  else:
    return jsonify({"status": "fail", "word": word})

""" Helps automatically open browser """
def open_browser():
  system = "mac" if os.name=="posix" else "windows"
  browser = webbrowser.get("firefox") if system=="windows" else webbrowser.get("chrome")
  browser.open_new("http://127.0.0.1:5000/")
  return

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
  proceed = check_panagram(panagram)
  if not proceed: print("Spelling Bee -> app.py: Invalid panagram."); exit()
  else: print(f"Spelling Bee: Panagram approved={panagram}. Happy spelling!")

  # Stores session
  session.dictionary = load_dictionary()
  session.set_panagram(panagram, center_letter)
  session.max_score = get_max_score()

  # App running
  threading.Timer(1.0, open_browser).start()
  app.run(debug=True, use_reloader=False)