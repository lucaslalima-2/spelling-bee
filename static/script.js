// Variables
"use strict";
let active_animations = [];
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
let current_page = 0; // for pagination
let debounce_timer;
const arrow = document.getElementById("arrow");
let arrow_state = "up"; // tracks arrow state
let input_locked = false; // to prevent multiple rapid submissions
let initialized = true; // tracks initial state
const max_per_column = 10; // max words per column in found section
const max_per_page = max_per_column * 3;
const max_score = 100; // for debug
const media_query = window.matchMedia("(max-width: 600px)");
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

// debug word_back
// let word_bank = new Set(Array.from({ length: 31 }, (_, i) => `word-${i + 1}`));
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

  // Renders page dots
  if (word_bank.size > max_per_page) {
    renderDots();
  }; // if

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
  popup_comp.classList.add("show");
  popup_val.classList.add("show");
  active_animations.push(popup_comp);
  active_animations.push(popup_val);

  // Removes popup animation
  [popup_comp, popup_val].forEach(el => {
    el.style.animation = 'none';
    void el.offsetWidth; // force reflow to restart animation
    el.style.animation = '';
  }); //forEach

   // Remove .show after animation ends
  popup_val.addEventListener('animationend', () => {
    popup_container.classList.remove('show');
    active_animations = active_animations.filter(el => el !== popup_comp);
    active_animations = active_animations.filter(el => el !== popup_val);
  }); // ensures the listener runs only once
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
  active_animations.push(popup_error);

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
    popup_container.classList.remove('show');
    active_animations = active_animations.filter(el => el !== popup_error);
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

  // Posts all words from word_bank (webapp config)
  postVisibleWordBank();

  // Posts all words to word-preview (media config)
  updateWordPreview();

  // Update header message (ie. "You have found x words")
  let word_message = document.getElementById("word-message");
  if(sorted_words.length == 1){
    word_message.innerText = `You have found ${sorted_words.length} word`;
  } else {
    word_message.innerText = `You have found ${sorted_words.length} words`;
  } // if-else
}// function

// Updates word preview
function updateWordPreview() {
  let sorted_words = Array.from(word_bank).sort();
  const preview_string = sorted_words.map(w => setTitleCase(w)).join(" ");
  document.getElementById("word-preview").textContent = preview_string;
} // function

// Update visible word bank
function postVisibleWordBank() {
  // Clear columns
  for (let i = 0; i <= 2; i++) {
    document.getElementById(`column-${i}`).innerHTML = '';
  } // for

  // Find words to post
  let sorted_words = Array.from(word_bank).sort();
  const start_index = current_page * max_per_page;
  const end_index = start_index + max_per_page;
  const page_words = sorted_words.slice(start_index, end_index);

  // Posts words
  page_words.forEach((word, index) => {
    const colindex = Math.floor(index / max_per_column);
    const word_element = document.createElement("div");
    word_element.className = "underlined-word";
    word_element.textContent = setTitleCase(word);
    document.getElementById(`column-${colindex}`).appendChild(word_element);
  }); // page words
}; // function post visible word bank

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
  clearTimeout(debounce_timer);
  debounce_timer = setTimeout(() => {
    const text_length = word_display.textContent.length;

    // Shrinks
    if (text_length <= 10) {
      word_display.style.fontSize = "18px";
    } else if (text_length <= 15) {
      word_display.style.fontSize = "16px";
    } else if (text_length <= 17) {
      word_display.style.fontSize = "14px";
    } else if (text_length <= 20) {
      word_display.style.fontSize = "12px";
    } else { // eliminates
      showErrorPopUp("too_long");
      clearWord();
      word_display.style.fontSize = "18px"; // only reset after clear
    } // if-else
  }, 50); // debounce time
}); // event listener

// Event listener for media query change
function handleMediaChange(e) {
  // console.log("Media Query Change Detected: ", e);
  const in_media_mode =  e.matches; // true if in media-mode
  // Variables
  const word_list_container = document.getElementById("word-list-container");
  const word_columns = document.getElementById("word-columns");
  const word_message = document.getElementById("word-message");
  const word_preview = document.getElementById("word-preview");
  const left_column = document.getElementById("left-column");
  const arrow = document.getElementById("arrow");

  // Determines what to show
  if (in_media_mode) { // media mode
    // Sets arrow
    arrow.style.display = "block";
    arrow_state = "up";
    arrow.classList.add("rotate_up");
    arrow.classList.remove("rotate_down");
    // Sets container
    word_list_container.style.flexGrow = "0";
    // Sets word_message
    word_message.style.display = "none";
    // Sets word_preview
    word_preview.style.display = "block";
    updateWordPreview()
    // Hides word_columns
    word_columns.style.display = "none";
  } else { // webapp mode
    // Resets arrow state
    arrow.style.display = "none";
    arrow_state = "down";
    arrow.classList.add("rotate_down");
    arrow.classList.remove("rotate_up");
    // Sets container
    word_list_container.style.flexGrow = "1";
    // Sets word_message
    word_message.style.display = "block";
    // Hides word_preview
    word_preview.style.display = "none";
    // Reveals word_columns
    word_columns.style.display = "flex";
    // Reveals left column
    left_column.style.display = "flex";
  };

} // function
media_query.addEventListener("change", handleMediaChange); // Listener

// @ media query - down arrow click behavior
arrow.addEventListener("click", () => {
  // Kill any active animations
  active_animations.forEach(el => {
    el.style.animation = 'none';
    el.classList.remove('show'); // optional: remove visibility
    el.style.display = 'none';   // optional: hide element
  });
  document.getElementById("word-display").classList.remove("shake");

  // Variables
  const word_list_container = document.getElementById("word-list-container");
  const word_columns = document.getElementById("word-columns");
  const word_message = document.getElementById("word-message");
  const word_preview = document.getElementById("word-preview");
  const left_column = document.getElementById("left-column");
  const right_column = document.getElementById("right-column");

  // Rotates arrow
  if (arrow_state == "down") {
    // Flip up
    arrow_state = "up";
    arrow.classList.remove("rotate_down"); // resets arrow
    arrow.classList.add("rotate_up"); // spins arrow
    // Reveals/hides elements
    right_column.style.flexGrow = "0";
    word_list_container.style.flexGrow = "0";
    word_preview.style.display = "block";
    updateWordPreview();
    word_columns.style.display = "none";
    word_message.style.display = "none";
    left_column.style.display = "flex";
    resetFocus();
  } else {
    // Flip down
    arrow_state = "down";
    arrow.classList.remove("rotate_up"); // resets arrow
    arrow.classList.add("rotate_down"); // spins arrow
    // Reveals/hides elements
    right_column.style.flexGrow = "1";
    word_list_container.style.flexGrow = "1";
    word_preview.style.display = "block";
    word_preview.textContent = "";
    word_columns.style.display = "flex";
    word_columns.style.flexGrow = "1";
    word_message.style.display = "flex";
    left_column.style.display = "none";
  } // if-else
}); // event listener

// Renders and updates dots
function renderDots() {
  const wrapper = document.getElementById("dot-indicator-wrapper");
  const dots_container = document.getElementById("dot-indicator");
  dots_container.innerHTML = ""; // Clear existing dots

  // Calculates number of pages needed
  const page_count = Math.ceil(word_bank.size / max_per_page);

  // Show dot indivator when needed
  wrapper.style.display = page_count > 1 ? "flex" : "none";

  for (let i = 0; i < page_count; i++) {
    const dot = document.createElement("div");
    dot.className = "dot";
    if (i === current_page) {
      dot.classList.add("active");
    } // if

    // Event listener for dot click
    dot.addEventListener("click", () => {
      current_page = i;
      renderDots();
      postVisibleWordBank();
    });

    dots_container.appendChild(dot);
  } // for
} // renderDots