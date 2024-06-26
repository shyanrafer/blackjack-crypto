const playerCardsContainer = document.querySelector('#player-cards-container'); // Setting DOM variables
const dealerCardsContainer = document.querySelector('#dealer-cards-container');
const balanceContainer = document.querySelector('#balance-wins-container');
const playerWinsContainer = document.querySelector('#wins-container');
const betContainer = document.querySelector('#bet-container');
const betForm = document.querySelector('#bet-form');
const playerActionContainer = document.querySelector('#player-action-container')
const playerActionForm = document.querySelector('#player-action-form')
const blackJackForm = document.querySelector('#black-jack-form');
const hitButton = document.querySelector('#hit-button');
const standButton = document.querySelector('#stand-button');
const doubleDownButton = document.querySelector('#double-down-button');
let currentDeck = ""; // Setting global variables
let cardsDrawn = [];
let entireDeck = [];
let currentPlayerHand = [];
let currentDealerHand = [];
let currentPlayerHandValue = 0;
let currentDealerHandValue = 0;
let btcValue = 0;
let playerBalance = 0;
let playerWins = 0;
let currentBet = 0;

function getDataFromStorage() { // Checks for an existing deck in localStorage and sets them to the working arrays if found
    const storedWins = localStorage.getItem('playerWins');
    if (storedWins !== null) {
        playerWins = storedWins;
    }
    const storedBTC = localStorage.getItem('currentBTCvalue');
    if (storedBTC !== null) {
        btcValue = storedBTC;
    }
    const storedBalance = localStorage.getItem('playerBalance');
    if (storedBalance !== null) {
        playerBalance = Number(storedBalance);
    } else { playerBalance = 100;
        localStorage.setItem('playerBalance', playerBalance);
    }
    return;
};

function renderBalanceAndWins(){ // Renders the player balance in btc, shows the value in USD and the tracked wins from local storage
    let btcToUsd = 0;
    btcToUsd = playerBalance * btcValue;
    btcToUsd = btcToUsd.toLocaleString("en-US", { style: "currency", currency: "USD" });
    balanceContainer.textContent = ''; // Emptying the container pre-rendering
    balanceContainer.innerHTML += `<p class="title">₿ Balance: ${playerBalance}</p>`;
    balanceContainer.innerHTML += `<p class="title">Worth in USD: ${btcToUsd}</p>`;
    balanceContainer.innerHTML += `<p class="title">You have won ${playerWins} times.</p>`;
};

function getEntireDeck(deck) { // Draws all 52 cards from the api using the currentDeck id
    fetch(`https://deckofcardsapi.com/api/deck/${deck}/draw/?count=52`, { cache: "reload" })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            entireDeck = data.cards;
            initialCardDraw(2, "both");
        });
    return;
};

function getNewDeck() { // Gets the id of a new shuffled deck from the api
    fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1", { cache: "reload" })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            currentDeck = data.deck_id;
            getEntireDeck(currentDeck);
        });
    return;
};

function getCryptoValues() { // Queries the api for the current value of BTC in USD, parses the resulting object into a number to put in local storage
    fetch("https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD&api_key=6c594b19a9cd08287fb516a08202718b0b8bbd2af5347e04f4f9744f1d94864a", { cache: "reload" })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            btcValue = data.USD;
            localStorage.setItem('currentBTCvalue', btcValue);
        });
    return;
};

function prepNewGame() { // Wipes out any current hands to prepare for a new game
    currentPlayerHand = [];
    currentDealerHand = [];
};

function drawCards(numOfCards, targetHand) { // Draws a specified number of cards from the into the targets (player or dealer) hand
        for (let i = 0; i < numOfCards; i++) {
            if (targetHand == "both") {
                currentDealerHand.push(entireDeck.pop());
                currentPlayerHand.push(entireDeck.pop());
            } else if (targetHand == "dealer") {
                currentDealerHand.push(entireDeck.pop());
                } else {
                    currentPlayerHand.push(entireDeck.pop());
                };
            };
        return;
};

function calculateHandsValue(){ // Calculates the values of the player and dealer hands
    let dealerSum = 0;
    let dealerAces = 0;
    let playerSum = 0;
    let playerAces = 0;
    for (let i = 0; i < currentDealerHand.length; i++) { // Adding the values of the cards together, tracking aces and counting them as 11 and counting face cards as 10
        if (currentDealerHand[i].value == "ACE") {
            dealerSum += 11;
            dealerAces++;
        } else if (currentDealerHand[i].value == "KING" || currentDealerHand[i].value == "QUEEN" || currentDealerHand[i].value == "JACK") {
            dealerSum += 10;
            } else {
                dealerSum += Number(currentDealerHand[i].value);
            }
        };

        for (let i = 0; i < currentPlayerHand.length; i++) {
            if (currentPlayerHand[i].value == "ACE") {
                playerSum += 11;
                playerAces++;
            } else if (currentPlayerHand[i].value == "KING" || currentPlayerHand[i].value == "QUEEN" || currentPlayerHand[i].value == "JACK") {
                playerSum += 10;
                } else {
                    playerSum += Number(currentPlayerHand[i].value);
                }
            };
        
        if (dealerSum > 21 && dealerAces > 0){ // Checking for aces on the condition if the value is over 21 and changes the value of an ace from 11 to 1
            for (let i = dealerAces; dealerSum > 21; i--){
                dealerSum - 10;
            };
        }

            if (playerSum > 21 && playerAces > 0){
                for (let i = playerAces; playerSum > 21; i--){
                    playerSum - 10;
                };
            }
    currentDealerHandValue = dealerSum;
    currentPlayerHandValue = playerSum;
};

function renderCards() { // Renders the hands to the dealer and player card containers
    calculateHandsValue ();
    playerCardsContainer.textContent = ''; // Emptying the container pre-rendering
    dealerCardsContainer.textContent = '';
    dealerCardsContainer.innerHTML += `<h2>Dealer Cards: ${currentDealerHandValue}</h2>`;
    playerCardsContainer.innerHTML += `<h2>Player Cards: ${currentPlayerHandValue}</h2>`;
    //dealerCardsContainer.innerHTML += `<img src=https://deckofcardsapi.com/static/img/back.png>`;
    for (let i = 0; i < currentDealerHand.length; i++) {
        dealerCardsContainer.innerHTML += `<img src=${currentDealerHand[i].image}>`;
    };
    for (let i = 0; i < currentPlayerHand.length; i++) {
        playerCardsContainer.innerHTML += `<img src=${currentPlayerHand[i].image}>`;
    };
};

function renderBet() { // Renders the current bet to the bet container
    betContainer.textContent = ''; // Emptying the container pre-rendering
    betContainer.innerHTML += `<p class="title">Current Bet: ${currentBet}</p>`;
};

function checkWinCondition(){ // Checks to see if there's a winner
    if (currentPlayerHandValue > 21){
        console.log("Dealer wins");    
        return declareWinner("dealer");}
    else if (currentDealerHandValue === currentPlayerHandValue){
        console.log("Tie"); 
        return declareWinner("tie");}
    else if (currentDealerHandValue > currentPlayerHandValue && currentDealerHandValue <= 21){
        console.log("Dealer wins");     
        return declareWinner("dealer");}
    else if (currentDealerHandValue < currentPlayerHandValue && currentPlayerHandValue <= 21){
        console.log("Player wins"); 
        return declareWinner("player");}
    else if (currentPlayerHandValue > currentDealerHandValue){
        console.log("Player wins");     
        return declareWinner("player");}
    else if (currentDealerHandValue > 21 && currentPlayerHandValue < 21){
        console.log("Player wins"); 
        return declareWinner("player");}
};

function declareWinner(outcome){ // Declares winner and renders text to the player action container
    playerActionContainer.textContent = ''; // Emptying the container pre-rendering
    if (outcome == "dealer"){
        playerActionContainer.innerHTML += `<p class="title">You lose!</p>`;
        playerBalance = Number(playerBalance - currentBet);
        localStorage.setItem('playerBalance', playerBalance);
    } else if (outcome == "tie"){
        playerActionContainer.innerHTML += `<p class="title">It's a tie!</p>`;
    } else if (outcome == "player"){
        playerActionContainer.innerHTML += `<p class="title">You win!</p>`;
        playerBalance = Number(playerBalance + currentBet);
        localStorage.setItem('playerBalance', playerBalance);
        playerWins++;
        localStorage.setItem('playerWins', playerWins);
    } else if (outcome == "playerBust"){
        playerActionContainer.innerHTML += `<p class="title">BUSTED! You got rugged!</p>`;
        playerBalance = Number(playerBalance - currentBet);
        localStorage.setItem('playerBalance', playerBalance);
    } else if (outcome == "dealerBust"){
        playerActionContainer.innerHTML += `<p class="title">Dealer busted! Get those tendies!</p>`;
        playerBalance = Number(playerBalance + currentBet);
        localStorage.setItem('playerBalance', playerBalance);
        playerWins++;
        localStorage.setItem('playerWins', playerWins);
    }
    playerActionContainer.innerHTML += `<p class="title">Play again?</p>`;
    playerActionContainer.innerHTML += `<button class="button is-medium">Play another game</button>`;
    renderBalanceAndWins();
};

function initialCardDraw(){ // Draws 2 cards for both player and dealer
    drawCards(2, "both");
};

function playerActionHandling(cards, betmulti){ // Handles what happens when the player presses the Dip or Moon button
    drawCards(cards, "player");
    console.log("What is going on here?");
    calculateHandsValue ();
    currentBet = (currentBet * betmulti);
    renderCards();
    renderBet();
    if (currentPlayerHandValue > 21){
        return declareWinner("playerBust");
    }
};

function dealerActionHandling(){ // Handles what happens after the player finishes their play and they didn't bust
    let dealerHandEval = currentDealerHandValue;
    renderCards();
    while (dealerHandEval < 17){
        console.log("I think this is bugging out.");
        drawCards(1, "dealer");
        calculateHandsValue();
        dealerHandEval = currentDealerHandValue;}
    renderCards();
    if (dealerHandEval > 21){
        return declareWinner("dealerBust");
    }
    checkWinCondition();
};

/* function playNewGame(){
    renderCards();
} */

getNewDeck();
//getCryptoValues();
getDataFromStorage();
renderBalanceAndWins();

playerActionForm.addEventListener('click', function(event) { // Listens for a click event on a button
    event.preventDefault(); // Stops the page from refreshing on submit
    if (event.target.firstChild.data == "Hodl"){
        return dealerActionHandling();
    } else if (event.target.firstChild.data == "Buy the Dip"){ // Draws one card and adds it to the players hand
        playerActionHandling(1, 1);
    } else if (event.target.firstChild.data == "To the Moon!"){  // Draws one card, adds it to the players hand and doubles the current bet
        playerActionHandling(1, 2);
    } else if (event.target.firstChild.data == "Play another game"){
        location.reload();
    }
});

betForm.addEventListener('click', function(event) { // Listens for a submit from the betting form
    event.preventDefault(); // Stops the page from refreshing on submit
    currentBet = event.target.firstChild.data; // Sets the initial bet
    renderCards();
    renderBet(event.target.firstChild.data);
});