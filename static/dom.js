// Event listener for Content loads. Auto-focus cursor on page load
document.addEventListener("DOMContentLoaded", () => {
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

  // Click clears word display on initial state
  word_display.addEventListener("click", () => {
    if (initialized) {
      word_display.innerText = "";
      initialized = false;
    } //if
  }); // add event listener

  // Enter or spacebar events
  word_display.addEventListener("keydown", function(event) {
    if (initialized) {
      word_display.innerText = "";
      initialized = false;
    }; //if

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