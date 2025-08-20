// Variables
"use strict";
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
    // Clear word
    clearWord()
    
    // Successful answer
    const success = data["status"]
    if(success=="success") {
      const value = data["value"];  
      if(!word_bank.has(word)){
        word_bank.add(word); // stores word
        score += value; // updates score
      } // if word_bank
      updateScore() // update score
      updateWordList()
    }; //if success
  });//then data
} //function

// Function updates score 
function updateScore(){
  document.getElementById("score").textContent = score;
} // updateScore

// Function updates wordlist
function updateWordList(){
  let sorted_words =Array.from(word_bank).sort();
  let word_list = document.getElementById("word-list");
  word_list.innerHTML = ''; // Clear current list
  let post_string = '';
  for( let word of sorted_words){
    post_string += word + '\n';
  }//for
  word_list.innerHTML = post_string;
}

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
