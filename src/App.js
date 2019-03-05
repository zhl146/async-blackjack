import React, { Component } from "react";
import "./App.css";
import Playerarea from "./PlayerArea";
import DealerArea from "./DealerArea";

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

class App extends Component {
  state = {
    deckId: null,
    noInteract: false,
    playerCards: [],
    dealerCards: []
  };

  startNewGame = async () => {
    const deckId = await fetch(
      "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6"
    )
      .then(res => res.json())
      .then(({ deck_id }) => deck_id);

    this.setState({
      deckId
    });
  };

  dealStartingHands = async () => {
    const startingCards = await fetch(
      `https://deckofcardsapi.com/api/deck/${this.state.deckId}/draw/?count=4`
    )
      .then(res => res.json())
      .then(res => res.cards)
      .then(cards =>
        cards.map(card => ({
          ...card,
          numericalVal: MAP_CARD_TO_NUMERICAL_VALUE[card.value]
        }))
      );

    this.setState({
      playerCards: [startingCards[0], startingCards[1]],
      dealerCards: [startingCards[2], startingCards[3]]
    });
  };

  calculateCurrentScore = () => {};

  async componentDidMount() {
    await this.startNewGame();
    await this.dealStartingHands();
  }

  render() {
    const { deckId, playerCards, dealerCards } = this.state;

    return (
      deckId && (
        <div className="App">
          <DealerArea cards={dealerCards} />
          <div style={{ height: 18, width: "100%" }} />
          <Playerarea cards={playerCards} />
        </div>
      )
    );
  }
}

export default App;
