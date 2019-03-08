export const PHASES = {
  checkInsurance: -2,
  checkBlackJacks: -1,
  playerWager: 0,
  deal: 1,
  playerHit: 2,
  dealerHit: 3,
  checkWinner: 4,
  bookKeeping: 5,
  dealWithMoney: 6,
  playAgainOrNot: 7
};

export const WINNERS = {
  player: 1,
  dealer: -1,
  tie: 0
};

export const MAP_CARD_TO_NUMERICAL_VALUE = {
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
