const playerCardsContainer = document.querySelector('#player-cards-container'); // Setting DOM variables
const dealerCardsContainer = document.querySelector('#dealer-cards-container');
const newDeckButton = document.querySelector('#new-deck-button');
const cryptoValuesButton = document.querySelector('#crypto-values-button');
const drawTwoCardsButton = document.querySelector('#draw-two-cards-button');
const drawACardButton = document.querySelector('#draw-a-card-button');
const renderCardsButton = document.querySelector('#render-cards-button');
const blackJackForm = document.querySelector('#black-jack-form');
let currentDeck = "";
let cardsDrawn = [];
let currentPlayerHand = [];
let currentPlayerHandValue = Number;
let currentDealerHandValue = Number;
let currentDealerHand = [];
let btcValue = [];
const cardValues = {
    Ace: 11,
    Ace2: 1,
    King: 10,
    Queen: 10,
    Jack: 10
};

function getDecksFromStorage() { // Checks for an existing deck in localStorage and sets them to the working arrays if found
    const storedDeck = localStorage.getItem('currentDeck');
    if (storedDeck !== null) {
        currentDeck = storedDeck;
    }
    const storedPlayerHand = JSON.parse(localStorage.getItem('playerHand'));
    if (storedPlayerHand !== null) {
        currentPlayerHand = storedPlayerHand;
    }
    const storedDealerHand = JSON.parse(localStorage.getItem('dealerHand'));
    if (storedDealerHand !== null) {
        currentDealerHand = storedDealerHand;
    }
    return;
};

function prepNewGame() { // Wipes out any deck information from localStorage to prepare for a new game
    localStorage.setItem('currentDeck', "");
    localStorage.setItem('playerHand', "");
    localStorage.setItem('dealerHand', "");
};

function getNewDeck() { // Draws a new shuffled deck and stores the id
    fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1", { cache: "reload" })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            currentDeck = data.deck_id;
            localStorage.setItem('currentDeck', currentDeck); // Sets the current deck to local storage
        console.log(currentDeck);
        });
    return;
}

function drawCards(numOfCards, targetHand) { // Draws a specified number of cards into the targets (player or dealer) hand
    fetch(`https://deckofcardsapi.com/api/deck/${currentDeck}/draw/?count=${numOfCards}`, { cache: "reload" })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            cardsDrawn = data.cards;
            for (let i = 0; i < cardsDrawn.length; i++) {
                if (targetHand === "dealer") {
                    currentDealerHand.push(cardsDrawn[i]);
                } else {
                    currentPlayerHand.push(cardsDrawn[i]);
                };


                console.log(cardsDrawn[i].value);
                console.log(cardsDrawn[i].suit);
            };
            if (targetHand === "dealer") {
                localStorage.setItem('dealerHand', JSON.stringify(currentDealerHand)); // Stringifies the array of objects to local storage
                console.log("Dealer hand array");
                console.log(currentDealerHand);
            } else {
                localStorage.setItem('playerHand', JSON.stringify(currentPlayerHand)); // Stringifies the array of objects to local storage
                console.log("Player hand array");
                console.log(currentPlayerHand);
            };
        });
    return;
};

function getCryptoValues() { // Queries the api for the current value of BTC in $s, parses the resulting object into a number
    fetch("https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD&api_key=6c594b19a9cd08287fb516a08202718b0b8bbd2af5347e04f4f9744f1d94864a", { cache: "reload" })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data.USD);
            btcValue = data.USD;
            localStorage.setItem('currentBTCvalue', btcValue);
        });
    return;
};

function renderCards() {
    calculateHandsValue ();
    playerCardsContainer.textContent = ''; // Emptying the container pre-rendering
    dealerCardsContainer.textContent = '';
    dealerCardsContainer.innerHTML += `<h2>Dealer Cards: ${currentDealerHandValue}</h2>`;
    playerCardsContainer.innerHTML += `<h2>Player Cards: ${currentPlayerHandValue}</h2>`;
    for (let i = 0; i < currentDealerHand.length; i++) {
        dealerCardsContainer.innerHTML += `<img src=${currentDealerHand[i].image}>`;
    };
    for (let i = 0; i < currentPlayerHand.length; i++) {
        playerCardsContainer.innerHTML += `<img src=${currentPlayerHand[i].image}>`;
    };
};

function calculateHandsValue (){
    let dealerSum = 0;
    let dealerAces = 0;
    let playerSum = 0;
    let playerAces = 0;
    for (let i = 0; i < currentDealerHand.length; i++) {
        if (currentDealerHand[i].value == "ACE") {
            dealerSum += 11;
            dealerAces++;
        } else if (currentDealerHand[i].value == "KING" || currentPlayerHand[i].value == "QUEEN" || currentPlayerHand[i].value == "JACK") {
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
            for (let i = dealerAces; 21 > dealerSum; i--){
                dealerSum - 10;
            };
        }

            if (playerSum > 21 && playerAces > 0){
                for (let i = playerAces; 21 > playerSum; i--){
                    playerSum - 10;
                };
            }
            
    currentDealerHandValue = dealerSum;
    currentPlayerHandValue = playerSum;
};

function checkWinCondition(){
    
}

cryptoValuesButton.addEventListener('click', function(event) { // Listens for a click event on a button
    event.preventDefault(); // Stops the page from refreshing on submit
    getCryptoValues(); // Calls the function to get crypto values
});

drawTwoCardsButton.addEventListener('click', function(event) { // Listens for a click event on a button
    event.preventDefault(); // Stops the page from refreshing on submit
    drawCards(2, "player"); // Calls the function to get crypto values
    drawCards(2, "dealer"); // Calls the function to get crypto values
});

drawACardButton.addEventListener('click', function(event) { // Listens for a click event on a button
    event.preventDefault(); // Stops the page from refreshing on submit
    drawCards(1, "player"); // Calls the function to draw a new deck
});

newDeckButton.addEventListener('click', function(event) { // Listens for a click event on a button
    event.preventDefault(); // Stops the page from refreshing on submit
    getNewDeck(); // Calls the function to draw a new deck
});

renderCardsButton.addEventListener('click', function(event) { // Listens for a click event on a button
    event.preventDefault(); // Stops the page from refreshing on submit
    renderCards(); // Calls the function to draw a new deck
});

getDecksFromStorage(); // Init call to get the hands in storage if any exist


//current crypto prices for popular coins listed on landing page

/*

function takeBet() {

};

function trackCards(){

};

function trackBets(){

};

*/