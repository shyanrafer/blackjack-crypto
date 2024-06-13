const playerCardsContainer = document.querySelector('#player-cards-container'); // Setting DOM variables
const dealerCardsContainer = document.querySelector('#dealer-cards-container');
const balanceContainer = document.querySelector('#balance-container');
const playerWinsContainer = document.querySelector('#wins-container');
const blackJackForm = document.querySelector('#black-jack-form');
const hitButton = document.querySelector('#hit-button');
const standButton = document.querySelector('#stand-button');
const doubleDownButton = document.querySelector('#double-down-button');
let currentDeck = "";
let cardsDrawn = [];
let currentPlayerHand = [];
let currentDealerHand = [];
let currentPlayerHandValue = 0;
let currentDealerHandValue = 0;
let entireDeck = [];
let btcValue = "";
let playerBalance = "";
let playerWins = 0;

function getWinsAndBalanceFromStorage() { // Checks for an existing deck in localStorage and sets them to the working arrays if found
    const storedWins = localStorage.getItem('playerWins');
    if (storedWins !== null) {
        playerWins = storedWins;
    }
    const storedBalance = localStorage.getItem('playerBalance');
    if (storedBalance !== null) {
        playerBalance = storedBalance;
    } else { playerBalance = 100;
        localStorage.setItem('playerBalance', playerBalance);
    }
    return;
};

function renderBalanceAndWins(){
    let btcToUsd = 0;
    btcToUsd = (playerBalance * btcValue);
    balanceContainer.textContent = ''; // Emptying the container pre-rendering
    balanceContainer.innerHTML += `<p>Balance in BTC: ${playerBalance}</p>`;
    balanceContainer.innerHTML += `<p>Balance in USD: ${btcToUsd}</p>`;
    playerWinsContainer.textContent = ''; // Emptying the container pre-rendering
    playerWinsContainer.innerHTML += `<h2>You have won ${playerWins} times!</h2>`;
};

function getDecksFromStorage() { // Checks for an existing deck in localStorage and sets them to the working arrays if found
    const storedDeck = localStorage.getItem('currentDeck');
    if (storedDeck !== null) {
        currentDeck = storedDeck;
    }
    /* const storedPlayerHand = JSON.parse(localStorage.getItem('playerHand'));
    if (storedPlayerHand !== null) {
        currentPlayerHand = storedPlayerHand;
    }
    const storedDealerHand = JSON.parse(localStorage.getItem('dealerHand'));
    if (storedDealerHand !== null) {
        currentDealerHand = storedDealerHand;
    } */
    return;
};

function getNewDeck() { // Gets the id of a new shuffled deck from the api
    fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1", { cache: "reload" })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            currentDeck = data.deck_id;
        });
    return;
}

function getEntireDeck() { // Draws all 52 cards from the api using the currentDeck id
    fetch(`https://deckofcardsapi.com/api/deck/${currentDeck}/draw/?count=52`, { cache: "reload" })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            entireDeck = data.cards;
        });
    return;
};

function getCryptoValues() { // Queries the api for the current value of BTC in USD, parses the resulting object into a number
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
    localStorage.setItem('playerHand', "");
    localStorage.setItem('dealerHand', "");
};

function drawCards(numOfCards, targetHand) { // Draws a specified number of cards from the into the targets (player or dealer) hand
            for (let i = 0; i < numOfCards; i++) {
                if (targetHand == "both") {
                    currentDealerHand.push(entireDeck.shift);
                    currentPlayerHand.push(entireDeck.shift);
                } 
                if (targetHand == "dealer") {
                    currentDealerHand.push(entireDeck.shift);
                } else {
                    currentPlayerHand.push(entireDeck.shift);
                };
            };
    return;
};

/* function drawCards(numOfCards, targetHand) { // Draws a specified number of cards into the targets (player or dealer) hand
    fetch(`https://deckofcardsapi.com/api/deck/${currentDeck}/draw/?count=${numOfCards}`, { cache: "reload" })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            cardsDrawn = data.cards;
            for (let i = 0; i < cardsDrawn.length; i++) {
                if (targetHand === "dealer") {
                    currentDealerHand.push(cardsDrawn[i]);
                    localStorage.setItem('dealerHand', JSON.stringify(currentDealerHand)); // Stringifies the array of objects to local storage
                } else {
                    currentPlayerHand.push(cardsDrawn[i]);
                    localStorage.setItem('playerHand', JSON.stringify(currentPlayerHand)); // Stringifies the array of objects to local storage
                };
            };
        });
    return;
}; */

function calculateHandsValue(){
    let dealerSum = 0;
    let dealerAces = 0;
    let playerSum = 0;
    let playerAces = 0;
    for (let i = 0; i < currentDealerHand.length; i++) {
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
        
        if (dealerSum > 21 && dealerAces > 0){
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

function renderCards() {
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

function checkWinCondition(){
    console.log(currentDealerHandValue);
    console.log(currentPlayerHandValue);
    if (currentPlayerHandValue > 21){
    return alert("RUGGED!");}
    else if (currentDealerHandValue === currentPlayerHandValue){
     return alert("It's a tie!");}
     else if (currentDealerHandValue > currentPlayerHandValue && currentDealerHandValue <= 21){
         return alert("You lose!");}
     else if (currentPlayerHandValue > currentDealerHandValue){
         playerWins+1;
         localStorage.setItem('playerWins', playerWins);
        return alert("You win!");}
};

function initialCardDraw(){
    prepNewGame();
    drawCards(2, "dealer");
    drawCards(2, "player");
};

function playNewGame(){
    renderCards();
    checkWinCondition();
}

function takeBet(){

};

hitButton.addEventListener('click', function(event) { // Listens for a click event on a button
    event.preventDefault(); // Stops the page from refreshing on submit
    drawCards(1, "player"); // Calls the function to draw a new deck
});

getNewDeck();
//getCryptoValues();
getBalanceFromStorage();
// getDecksFromStorage(); // Init call to get the hands in storage if any exist


//current crypto prices for popular coins listed on landing page