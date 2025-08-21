// Variables
"use strict";
const center_letter = window.FLASK_DATA.center_letter;
const ring_letters = window.FLASK_DATA.ring_letters;
const max_score = window.FLASK_DATA.max_score;
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

// Letter placement
document.querySelector("#hex-center .hex-letter").textContent = center_letter;
[0, 1, 2, 3, 4, 5].forEach((i) => {
  document.querySelector(`#hex-${i} .hex-letter`).textContent = ring_letters[i];
});

/* Function called when word is submitted */
function submitWord() {
  let word = document.getElementById("word-input").value.toUpperCase();

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
        updateScore(data["value"]);
        updateWordList(word);
        updateRank()
      } // if word_bank
    }; //if success
  });//then data
} //function

// Function updates score 
function updateScore(value){
  score += value;
  console.log("score:", score);
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
  document.getElementById("word-input").value = "";
}

// Event listener for hex click
document.querySelectorAll(".hex").forEach(hex =>{
  hex.addEventListener("click", () => {
    const letter = hex.textContent;
    document.getElementById("word-input").value += letter;
    
    hex.classList.add('clicked');
    setTimeout(() => { hex.classList.remove("clicked");}, 200);
  }); // addEventListener
}) // forEach

// Event listener for any call of type="submit"; runs submitWord()
document.getElementById("word-form").addEventListener("submit", function(event) {
  event.preventDefault(); // Prevent default form submission
  submitWord(); // Call your custom function
})

// Event listener to Enter button; submits call type="submit"
document.getElementById("word-input").addEventListener("keydown", function(event) {
  if(event.key==="Enter") {
    event.preventDefault(); // Optional: prevents form submission
    document.getElementById("enter-button").click(); // submits request of type="submit"
  } //if
})

// Event listener for Content loads. Auto-focus cursor on page load
window.addEventListener("DOMContentLoaded", function() {
  document.getElementById("word-input").focus();
})