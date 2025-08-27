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
let debounceTimer;
let input_locked = false; // to prevent multiple rapid submissions
const max_per_column = 14; // max words per column in found section
const max_score = 100; // for debug
let rank_index = 0; // for rank_pointer setting
let ring_letters = window.FLASK_DATA.ring_letters;
const panagram = window.FLASK_DATA.panagram;
const percentages = [
  [0.00, "Beginner"],
  [0.01, "Good Start"],
  [0.10, "Moving Up"],
  [0.15, "Good"],
  [0.20, "Solid"],
  [0.25, "Nice"],
  [0.30, "Great"],
  [0.35, "Amazing"],
  [0.40, "Genius"]
]
let score = 0;
const word_display = document.getElementById("word-display");
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

    // Successful answer
    if(data["status"]=="success") {
      if(!word_bank.has(word)){
        showPopUp(data["value"], data["panagram"]);
        updateScore(data["value"]);
        updateWordList(word);
        updateRank();
        clearWord();
      } else {
        showErrorPopUp("already_found");
        clearWord();
      } // if-else word_bank
    }; //if success

    // Wrong answer
    if (data["status"]=="fail") {
      if(data["word"].length < 4) {
        showErrorPopUp("too_short");
        clearWord();
      } else if(!data["issubset"]) {
        showErrorPopUp("bad_letters");
        clearWord();
      } else if(data["issubset"]) {
        showErrorPopUp("not_in_word_list");
        clearWord();
      } else {
        console.log("function submitWord-> Unaccounted for submission: ", data)
      } // if subset
    } // if data 
  });//if data

} //function

// Function shows popup
function showPopUp(value, ispanagram){
  const popup_comp = document.getElementById('popup-compliment');
  const popup_val = document.getElementById('popup-value');

  // Hides prev error popup
  const popup_error = document.getElementById('popup-error');
  popup_error.style.display = 'none';
  popup_comp.style.display = 'inline-block';
  popup_val.style.display = 'inline-block';

  // Determines compliment and value
  let compliment = "";
  if(ispanagram) {
    value = value + 7; // Panagram bonus
    compliment = "Panagram!";
    popup_comp.classList.add("panagram");
  } else {
    compliment = compliments[value]
    popup_comp.classList.remove("panagram");
  }  // if-else

  // Sets popup text
  popup_comp.textContent = compliment;
  popup_val.textContent = `+${value}`;

  // Adds popup animatinon
  const popup_container = document.getElementById('popup-container');
  popup_container.classList.add('show');

  // Removes popup animation
  [popup_comp, popup_val].forEach(el => {
    el.style.animation = 'none';
    void el.offsetWidth; // force reflow to restart animation
    el.style.animation = '';
  }); //forEach
} // function

// On redundant or error submission
function showErrorPopUp(quality) {
  const popup_container = document.getElementById('popup-container');
  const popup_error = document.getElementById('popup-error');
  const popup_comp = document.getElementById('popup-compliment');
  const popup_val = document.getElementById('popup-value');

  // Hide compliment/value
  popup_comp.style.display = 'none';
  popup_val.style.display = 'none';
  
  // Set text
  switch(quality){
    case "already_found":
      popup_error.textContent = "Already found";
      break;
    case "bad_letters":
      popup_error.textContent = "Bad Letters";
      break;
    case "too_short":
      popup_error.textContent = "Too short";
      break;
    case "too_long":
      popup_error.textContent = "Too long";
      break;
    case "not_in_word_list":
      popup_error.textContent = "Not in word list";
    default:
      console.log("function showErrorPopUp-> Unaccounted for quality: ", quality)
      break;
  } // switch

  // Trigger animation
  popup_error.style.display = 'block';
  popup_container.classList.add('show');
  popup_error.classList.add("show");

  // Reset animation
  popup_error.style.animation = 'none';
  void popup_error.offsetWidth;
  popup_error.style.animation = '';

  // Adds shake to word-display
  const word_display = document.getElementById('word-display');
  word_display.classList.add('shake'); // Trigger
  // Timeout
  word_display.addEventListener('animationend', function handleShakeEnd() {
    word_display.classList.remove('shake');
    word_display.removeEventListener('animationend', handleShakeEnd);
  }); // add event listener
} // function

// Function updates score 
function updateScore(value){
  score += value;
  document.querySelector("#rank-score").textContent = score;
} // function

// Function updates wordlist
function updateWordList(word){
  word_bank.add(word);
  let sorted_words = Array.from(word_bank).sort();

  // Resets word columns
  for (let i = 0; i <= 2; i++) {
    document.getElementById(`column-${i}`).innerHTML = '';
  } // for

  // Posts all words from word_bank
  sorted_words.forEach( (word, index) => {
    const colindex = Math.floor(index / max_per_column);
    const word_element = document.createElement("div");
    word_element.className = "underlined-word";
    word_element.textContent = setTitleCase(word);
    document.getElementById(`column-${colindex}`).appendChild(word_element);
  });

  // Update header message (ie. "You have found x words")
  let word_message = document.getElementById("word-message");
  if(sorted_words.length == 1){
    word_message.innerText = `You have found ${sorted_words.length} word`;
  } else {
    word_message.innerText = `You have found ${sorted_words.length} words`;
  } // if-else
}// function

// Function updates rank
function updateRank(){
  let rank_status = document.getElementById("rank-status");
  let rank_pointer = document.querySelector(".rank-pointer");
  // const nodes = document.querySelectorAll(".rank-node");
  
  // Iterates over thresholds and sets rank
  for(let i=0; i<percentages.length; i++){
    if(score/max_score > percentages[i][0]){
      rank_status.textContent = percentages[i][1]
      rank_index = i;
    } // if
  }// for

  rank_pointer.classList.add("animate"); // enables glide
  setRankPointer(rank_index);
}// function

// Positions rank_pointer
function setRankPointer(rank_index) {
  const rank_pointer = document.querySelector(".rank-pointer");
  const nodes = document.querySelectorAll(".rank-node");
  const track = document.getElementById("rank-track");

  // Determines target node for positioning
  const node_rect = nodes[rank_index].getBoundingClientRect();
  const track_rect = track.getBoundingClientRect();
  // const left_offset = target_node.offsetLeft + target_node.offsetWidth/2 - rank_pointer.offsetWidth/2;
  const left_offset = node_rect.left - track_rect.left + (node_rect.width / 2) - (rank_pointer.offsetWidth / 2);
  rank_pointer.style.left = `${left_offset}px`;
} // function

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

// Convert string to title case for posting to word_list
function setTitleCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
} // function

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

// Event listener for resize window
window.addEventListener("resize", () => {
  const rank_pointer = document.querySelector(".rank-pointer");
  rank_pointer.classList.remove("animate"); //disable glide
  setRankPointer(rank_index); // or positionRankPointerAtIndex(rank_index)
});

// Event listener to disable word-display when character limit reached
word_display.addEventListener("beforeinput", (e) => {
  const current_text = word_display.textContent;
  const incoming_text = e.data || ""; // what the user is trying to add
  const new_length = current_text.length + incoming_text.length;

  if (new_length > 20) {
    e.preventDefault(); // blocks the input

    if(!input_locked) { // prevents multiple rapid submissions
      input_locked = true;
      showErrorPopUp("too_long");
      word_display.classList.add("shake");

      // Optional: reset font size and clear after shake
      word_display.addEventListener("animationend", function handleShakeEnd() {
        word_display.classList.remove("shake");
        clearWord();
        word_display.style.fontSize = "18px";
        input_locked = false; // unlocks input
        word_display.removeEventListener("animationend", handleShakeEnd);
      }); // add event listener
    }; //if inputLocked
  } // if 20
}); // event listener

// Event listener for string too long in word display
word_display.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const text_length = word_display.textContent.length;

    // Shrinks
    if (text_length <= 10) {
      word_display.style.fontSize = "18px";
    } else if (text_length <= 15) {
      word_display.style.fontSize = "15px";
    } else if (text_length <= 17) {
      word_display.style.fontSize = "13px";
    } else if (text_length <= 20) {
      word_display.style.fontSize = "11px";
    } else { // eliminates
      showErrorPopUp("too_long");
      clearWord();
      word_display.style.fontSize = "18px"; // only reset after clear
    } // if-else
  }, 50); // debounce time
}); // event listener

// Event listener for Content loads. Auto-focus cursor on page load
document.addEventListener("DOMContentLoaded", () => {
  word_display.textContent = ""; // clears
  const enter_button = document.getElementById("enter-button");
  const delete_button = document.getElementById("delete-button");
  const shuffle_button = document.getElementById("shuffle-button");

  // Initializes game
  resetFocus(); // Initialize cursor focud
  setInputStyle(); // Sets entry field style
  shuffleLetters(); // Sets ring_letter configuration
  updateRank();

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