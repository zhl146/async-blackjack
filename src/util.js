export const calculateCurrentScore = cards =>
  cards.reduce((score, card) => score + card.numericalVal, 0);

export const calculateNextPossibleScores = (currentScores, newCards) => {
  if (newCards.length === 0) return currentScores;

  let nextScores = [];
  let [nextCard, ...restCards] = newCards;

  currentScores.forEach(score => {
    if (nextCard.numericalVal === 1) nextScores.push(score + 11);
    nextScores.push(score + nextCard.numericalVal);
  });

  return calculateNextPossibleScores(nextScores, restCards);
};

export const getNewDeckId = (n = 6) =>
  fetch(`https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${n}`)
    .then(res => res.json())
    .then(({ deck_id }) => deck_id);

const MAP_CARD_TO_NUMERICAL_VALUE = {
  ACE: 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  JACK: 10,
  QUEEN: 10,
  KING: 10
};

export const drawNCards = (deckId, n) =>
  fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${n}`)
    .then(res => res.json())
    .then(res => res.cards)
    .then(cards =>
      cards.map(card => ({
        ...card,
        numericalVal: MAP_CARD_TO_NUMERICAL_VALUE[card.value]
      }))
    );
