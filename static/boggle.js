// front end display of board game 
class BoggleGame{
    // automatically runs when the user  calls a new game 
    constructor(boardId){
        // use built in set to prevent duplicate words 
        this.words = new Set();
        this.board = $("#" + boardId);

        $(".guess", this.board).on("submit", this.handleSubmit.bind(this));
    }

    showWord(word) {
        $(".words", this.board).append($("<li>", {text: word}));
    }

    // gets the class message from the html 
    showMessage(message, msgType){
        $(".message", this.board)
            .text(message)
            .removeClass()
            .addClass(`message ${msgType}`)
    }

    async handleSubmit(evt){
        evt.preventDefault();
        console.log("hello handleSubmit")
        const $word = $(".word", this.board);

        let word = $word.val();
        if (!word) return;

        if (this.words.has(word)) {
            this.showMessage(`already found ${word}`, "err")
            return;
        }

        const response = await axios.post('/check-word', { word: word }, {headers: {'Content-type': 'application/json'}});

        // "not-word" and "not-on-board" is from function in boggle.py
        if(response.data.result === "not-word"){
            this.showMessage(`${word} in not a word`, "err");
        } else if (response.data.result === "not-on-board") {
          this.showMessage(`${word} is not on the board`, "err");  
        } else {
          this.showWord(word);
          this.words.add(word);
          this.showMessage(`added ${word}`, "ok");  
        }
        // re-sets the input field to be blank
        $word.val("").focus();
    }

    
}



// *********************************************************************************************************************

let words = new Set();

// start the timer as soon as the document is fully loaded
$(document).ready(function() {
    startTimer();
});

function startTimer(){
    // start the timer at 60 seconds
    let timeLeft = 60;
    // update the timer display
    $('.timer').text(timeLeft);

    let timerId = setInterval(() => {
        // decrease the timer by 1
        timeLeft--;
        $('.timer').text(timeLeft);

        if (timeLeft <= 0) {
            // stops the timer
            clearInterval(timerId);
            endGame();
        }
        // interval is set to 1 second
    }, 1000)
}

function endGame() {
    // disable the input field and submit button
    $(".word").prop('disabled', true);
    $(".guess button").prop('disabled', true);
    // message to the user
    $(".message").text("time's up game over");
}

function showWord(word) {
    $(".words").append($("<li>", {text: word}));
}

async function handleSubmit(evt){
    evt.preventDefault();

    // before processing the guess, check if the game is over
    if($(".word").prop('disabled')) {
        return;
    }

    const $word = $(".word");

    let word = $word.val().trim();
    if (!word) return;

    if (words.has(word)) {
        $(".message").text(`already found ${word}`).addClass('error'); 
        $word.val("").focus();
        return;
    }

    const response = await axios.post('/check-word', { word: $word.val().trim() }, {headers: {'Content-Type': 'application/json'}});

    // update score 
    if(response.data.score !== undefined) {
        $('.score').text(response.data.score);
    }
    if (response.data.high_score !== undefined) {
        $('.high-score').text(response.data.high_score);
    }

    if(response.data.result === "not-word"){
        $(".message").text(`${word} is not a word`).addClass('error'); 
    } else if (response.data.result === "not-on-board") {
        $(".message").text(`${word} is not on the board`).addClass('error');
    } else {
        showWord(word);
        words.add(word);
        $(".message").text(`Added ${word}`, "ok").removeClass('error'); 
    }

    // re-sets the input field to be blank
    $word.val("").focus();
}

$(".guess").on("submit", handleSubmit);