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
let currentDeck = "";
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
        playerBalance = storedBalance;
    } else { playerBalance = 100;
        localStorage.setItem('playerBalance', playerBalance);
    }
    return;
};

function renderBalanceAndWins(){
    let btcToUsd = 0;
    btcToUsd = playerBalance * btcValue;
    balanceContainer.textContent = ''; // Emptying the container pre-rendering
    balanceContainer.innerHTML += `<p class="title">₿ Balance: ${playerBalance}</p>`;
    balanceContainer.innerHTML += `<p class="title">Worth in USD: $${btcToUsd}</p>`;
    balanceContainer.innerHTML += `<p class="title">You have won ${playerWins} times!</p>`;
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
};

function drawCards(numOfCards, targetHand) { // Draws a specified number of cards from the into the targets (player or dealer) hand
        for (let i = 0; i < numOfCards; i++) {
            if (targetHand == "both") {
                currentDealerHand.push(entireDeck.pop());
                currentPlayerHand.push(entireDeck.pop());
            } else if (targetHand == "dealer") {
                console.log(currentDealerHand);
                console.log(entireDeck);
                currentDealerHand.push(entireDeck.pop());
                } else {
                    console.log(currentPlayerHand);
                    console.log(entireDeck);
                    currentPlayerHand.push(entireDeck.pop());
                };
            };
        return;
};

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
    //dealerCardsContainer.innerHTML += `<h2>Dealer Cards: ${currentDealerHandValue}</h2>`;
    //playerCardsContainer.innerHTML += `<h2>Player Cards: ${currentPlayerHandValue}</h2>`;
    //dealerCardsContainer.innerHTML += `<img src=https://deckofcardsapi.com/static/img/back.png>`;
    for (let i = 0; i < currentDealerHand.length; i++) {
        dealerCardsContainer.innerHTML += `<img src=${currentDealerHand[i].image}>`;
    };
    for (let i = 0; i < currentPlayerHand.length; i++) {
        playerCardsContainer.innerHTML += `<img src=${currentPlayerHand[i].image}>`;
    };
};

function renderBet() {
    betContainer.textContent = ''; // Emptying the container pre-rendering
    betContainer.innerHTML += `<p class="title">Current Bet: ${currentBet}</p>`;
};

function checkWinCondition(){
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

function declareWinner(){
};

function initialCardDraw(){
    drawCards(2, "both");
};

function nextRound(){
    renderCards();
        while (currentDealerHandValue < 17)
            {
            drawCards(1, "dealer");
            calculateHandsValue();
            }
    renderCards();    
    checkWinCondition();
    console.log(currentDealerHandValue);
    console.log(currentPlayerHandValue);
};

function playNewGame(){
    renderCards();
}

getNewDeck();
getCryptoValues();
getDataFromStorage();
renderBalanceAndWins();

playerActionForm.addEventListener('click', function(event) { // Listens for a click event on a button
    event.preventDefault(); // Stops the page from refreshing on submit
    if (event.target.firstChild.data == "Hodl"){
        return nextRound();
    } else if (event.target.firstChild.data == "Buy the Dip"){ // Draws one card and adds it to the players hand
        drawCards(1, "player");
    } else if (event.target.firstChild.data == "To the Moon!"){  // Draws one card, adds it to the players hand and doubles the current bet
        drawCards(1, "player");
        currentBet * 2;
    }
    nextRound();
});

betForm.addEventListener('click', function(event) { // Listens for a submit from the betting form
    event.preventDefault(); // Stops the page from refreshing on submit
    currentBet = event.target.firstChild.data; // Sets the initial bet
    console.log("Current bet is " + currentBet);
    playNewGame();
    renderBet(event.target.firstChild.data);
});