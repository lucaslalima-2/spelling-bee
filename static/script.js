/*
 * Function connected to enter function
*/

function submitWord() {
  const word = document.getElementById("word-input").value;

  // Sends function request to app.py defined function
  fetch("/submit_answer", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({word: word})
  })// fetch
  .then(response => response.json())
  .then(data =>{
    //const result = document.getElementById("result");
    //result.textcontext = data.valid ? "Valid" : "Invalid"
    console.log("Server response: ", data)
    clearWord()
  });//then
} //function

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
