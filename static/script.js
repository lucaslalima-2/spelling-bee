// Variables
"use strict";
const max_score = window.FLASK_DATA.max_score;
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


/* Function clears answer input field on Enter click */
function clearWord() {
  document.getElementById("word-input").value = "";
}//function

/* Event listener for any call of type="submit"; runs submitWord() */
document.getElementById("word-form").addEventListener("submit", function(event) {
  event.preventDefault(); // Prevent default form submission
  submitWord();           // Call your custom function
}); // addEventListener

/* Event listener to Enter button; submits call type="submit" */
document.getElementById("word-input").addEventListener("keydown", function(event) {
  if(event.key==="Enter") {
    event.preventDefault(); // Optional: prevents form submission
    document.getElementById("enter-button").click(); // submits request of type="submit"
  }//if
})// addEventListener

/* Event listener for Content loads. Auto-focus cursor on page load */
window.addEventListener("DOMContentLoaded", function() {
  document.getElementById("word-input").focus();
}); // addEventListener
