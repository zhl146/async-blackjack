import { MAP_CARD_TO_NUMERICAL_VALUE, WINNERS } from "./constants";

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

  return calculateNextPossibleScores(
    nextScores.filter(score => score < 22),
    restCards
  );
};

export const hasBusted = possibleScores =>
  possibleScores.every(score => score > 21);

export const playerCanHit = possibleScores =>
  possibleScores.some(score => score < 21);

export const mustHit = possibleScores =>
  possibleScores.every(score => score !== 21) &&
  possibleScores.some(score => score < 18);

const findHighestScoreUnder21 = scores =>
  scores
    .sort()
    .reverse()
    .find(score => score <= 21);

export const getWinner = (dealerScores, playerScores) => {
  const dealerHigh = findHighestScoreUnder21(dealerScores);
  const playerHigh = findHighestScoreUnder21(playerScores);

  return playerHigh > dealerHigh
    ? WINNERS.player
    : dealerHigh > playerHigh
    ? WINNERS.dealer
    : WINNERS.tie;
};

export const getNewDeckId = (n = 6) =>
  fetch(`https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${n}`)
    .then(res => res.json())
    .then(({ deck_id }) => deck_id);

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
