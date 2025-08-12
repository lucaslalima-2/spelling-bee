/*
 * Function connected to enter function
*/

function submitWord() {
  const word = document.getElementById("wordInput").value;
  fetch("/check", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({word: word})
  })//fetch
  .then(response => response.json())
  .then(data =>{
    const result = document.getElementById("result");
    result.textcontext = data.valid ? "Valid" : "Invalid"
  });//then
} //function

/*
 * Function clears answer input field on Enter click
*/
function clearWord() {
  document.getElementById("wordInput").value = "";
}//function

/*
 * Event listener to Enter button
*/
document.getElementById("wordInput").addEventListener("keydown", function(event) {
  if(event.key==="Enter") {
    event.preventDefault(); // Optional: prevents form submission
    document.getElementById("enterButton").click();
  }//if
})// addEventListener

/*
 * Auto-focus cursor on page load
*/
window.addEventListener("DOMContentLoaded", function() {
  document.getElementById("wordInput").focus();
}); // addEventListener
