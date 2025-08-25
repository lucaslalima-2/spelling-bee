// Variables
"use strict";
const all_letters = window.FLASK_DATA.all_letters;
const center_letter = window.FLASK_DATA.center_letter;
const compliments = {
  1 : "Good!",
  5 : "Nice!",
  6 : "Great!",
  7: "Awesome!",
  8: "Amazing!",
  10: "Incredible!",
  11: "Unbelievable!",
  12: "Genius!",
  13: "Magnificent!",
  14: "Spectacular!",
  15: "Phenomenal!",
  16: "Astounding!",
  17: "Extraordinary!",
  18: "Brilliant!",
  19: "Fabulous!",
  20: "Fantastic!",
}
const max_score = window.FLASK_DATA.max_score;
let ring_letters = window.FLASK_DATA.ring_letters;
const panagram = window.FLASK_DATA.panagram;
const percentages = [
  [0.00, "Good Start"],
  [0.15, "Moving Up"],
  [0.25, "Good"],
  [0.40, "Solid"],
  [0.50, "Nice"],
  [0.75, "Great"],
  [0.90, "Amazing"],
  [1.00, "Genius"]
]
let score = 0;
let word_bank = new Set();

// Function called when word is submitted
function submitWord() {
  let word = document.getElementById("word-display").textContent.toUpperCase();
  word = word.replace(/\u200B/g, ""); // remove placeholder

  // Sends function request to app.py defined function
  fetch("/submit_answer", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({word: word})
  })// fetch
  .then(response => response.json())
  .then(data =>{
    // console.log("Server response: ", data)

    clearWord() // clears word
    // Successful answer
    if(data["status"]=="success") {
      if(!word_bank.has(word)){
        showPopUp(word, data["value"]);
        updateScore(data["value"]);
        updateWordList(word);
        updateRank();
      } // if word_bank
    }; //if success
  });//then data
} //function

// Function shows popup
function showPopUp(word, value){
  const popup_comp = document.getElementById('popup-compliment');
  const popup_val = document.getElementById('popup-value');

  // Determines compliment and value
  let ispanagram = all_letters.every(letter => word.includes(letter));
  let compliment = "";
  if(ispanagram) {
    value = value + 7; // Panagram bonus
    compliment = "Panagram!";
  } else {
    compliment = compliments[value]
  }  // if-else

  // Sets popup text
  popup_comp.textContent = compliment;
  popup_val.textContent = `+${value}`;

  // Adds popup animatinon
  const popup = document.getElementById('popup-container');
  popup.classList.add('show');

  // Removes popup animation
  setTimeout(() => { popup.classList.remove('show') }, 800);
} // function

// Function updates score 
function updateScore(value){
  score += value;
  document.getElementById("score").textContent = score;
} // function

// Function updates wordlist
function updateWordList(word){
  word_bank.add(word);
  let sorted_words = Array.from(word_bank).sort();
  let word_list = document.getElementById("word-list");
  word_list.innerHTML = ''; // Clear current list
  let post_string = '';
  for( let word of sorted_words){
    post_string += word + '\n';
  }//for
  word_list.innerHTML = post_string;
}// function

// Function updates rank
function updateRank(){
  let rank_stars = document.getElementById("rank-stars");
  let rank_status = document.getElementById("rank-status");
  
  // const rank_string = percentages.reduce((acc, p) =>
  // acc + (score / max_score > p[0] ? '●' : '○'), '');
  let rank_string = "";
  let rank = "";
  for(let i=0; i<percentages.length; i++){
    if(score/max_score > percentages[i][0]){
      rank_string += '●';
      rank = percentages[i][1]
    } else {
      rank_string += '○';
    }// if-else
  }// for
  rank_status.textContent = rank;
  rank_stars.textContent = rank_string;
  // rank_stars.style.fontFamily = 'monospace';
}// function 

// Function clears answer input field on Enter click
function clearWord() {
  document.getElementById("word-display").innerHTML = "";
  resetFocus()
}// function

// Function tied to delete button
function deleteInputEnd(){  
  const word_display = document.getElementById("word-display");
  const raw_text = word_display.textContent.toUpperCase().slice(0, -1);
  word_display.textContent = raw_text;
}// function

// Function to get new state of ring letters aka. "shuffle"
function shuffleLetters() {
  const hex_letters= document.querySelectorAll(".hex-letter");

  // Fade out
  hex_letters.forEach(l => {
    if(l.textContent !== center_letter) {
      l.classList.add("fade-out");
    }; // if
  });

  // Wait for fade-out to complete
  setTimeout( () => {

    // Shuffles ring letters
    ring_letters = shuffleArray(ring_letters);
    [0, 1, 2, 3, 4, 5].forEach((i) => {
      document.querySelector(`#hex-${i} .hex-letter`).textContent = ring_letters[i];
    });
    
    // Places middle layer
    document.querySelector("#hex-center .hex-letter").textContent = center_letter;

    // Fade in
    hex_letters.forEach(l => {
      l.classList.remove("fade-out");
      l.classList.add("fade-in");
    }); // foreach

    // Remove fade-in class
    setTimeout(() => {
      hex_letters.forEach(l => {
        if (l.textContent !== center_letter) {
          l.classList.remove("fade-in");
        }; // if
      });
    }, 300); // match transition in .hex-letter
  }, 300); // match transition in .hex-letter
}; // function

// More varied shuffling algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  } // for
  return array;
} // function

// Resets focus to the input field
function resetFocus(){
  const word_display = document.getElementById("word-display");
  word_display.focus();

  // If empty, inject zero-width character to trick contentediable
  if (word_display.childNodes.length === 0) {
    word_display.innerHTML = "\u200B"; // zero-width space
  } // if

  // Move cursor to end
  const range = document.createRange();
  const sel = window.getSelection();

  if (word_display.childNodes.length > 0) {
    const lastNode = word_display.childNodes[word_display.childNodes.length - 1];
    if (lastNode.nodeType === Node.TEXT_NODE) {
      range.setStart(lastNode, lastNode.length);
    } else {
      range.setStartAfter(lastNode);
    }
  } else {
    range.selectNodeContents(word_display);
    range.collapse(false);
  } // if-else

  sel.removeAllRanges();
  sel.addRange(range);
}// function

// Event listener for hex click
document.querySelectorAll(".hex").forEach(hex =>{
  hex.addEventListener("click", () => {
    hex.addEventListener("mousedown", (e) => e.preventDefault());

    const letter = hex.textContent;
    const word_display = document.getElementById("word-display");
    
    word_display.textContent += letter;
    resetFocus();
    
    hex.classList.add('clicked');
    setTimeout(() => { hex.classList.remove("clicked");}, 200);
  }); // addEventListener
}) // forEach

// Sets styling of input
function setInputStyle() {
  const word_display = document.getElementById("word-display");

  word_display.addEventListener("input", () => {
    const raw_text = word_display.textContent.toUpperCase();
    const styled = [...raw_text].map(letter => {
      let color;
      if(letter == center_letter) {
        color = "#E9AB17";
      } else if (all_letters.includes(letter)) {
        color = "black";
      } else {
        color = "grey"; 
      }// if-else colors letters
      return `<span style="color:${color}">${letter}</span>`;
    }).join("");

    word_display.innerHTML = styled;

    resetFocus();

  }); // event listener
}; // function

// Event listener for Content loads. Auto-focus cursor on page load
document.addEventListener("DOMContentLoaded", () => {
  const word_display = document.getElementById("word-display");
  word_display.textContent = ""; // clears

  const enter_button = document.getElementById("enter-button");
  const delete_button = document.getElementById("delete-button");
  const shuffle_button = document.getElementById("shuffle-button");

  // Initialize focus
  resetFocus();

  // Initializes game
  shuffleLetters();

  // Adds color to text input
  setInputStyle();

  // Blur event ("user clicks away from input")
  word_display.addEventListener("blur", function() {
    setTimeout(() => resetFocus(), 0);
  }); // event listener

  // Enter or spacebar events
  word_display.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      enter_button.click();
    }; // if
    
    if (event.key == " ") {
      event.preventDefault();
      shuffle_button.click();
    }; // if
  }); // event listener

  // Enter button click behavior
  enter_button.addEventListener("click", function(event) {
    event.preventDefault();
    submitWord();
    resetFocus();
  }); // event listener

  // Delete button click behavior
  delete_button.addEventListener("click", function(event){
    event.preventDefault();
    deleteInputEnd();
    resetFocus()
  }); // event listener

  // Shuffle button click behavior
  shuffle_button.addEventListener("click", function(event){
    event.preventDefault();
    shuffleLetters();
    resetFocus();
  }); // event listener
});