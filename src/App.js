import React, { Component } from "react";
import "./App.css";
import Playerarea from "./PlayerArea";
import DealerArea from "./DealerArea";
import {
  calculateCurrentScore,
  drawNCards,
  getNewDeckId,
  calculateNextPossibleScores
} from "./util";

class App extends Component {
  state = {
    deckId: null,
    noInteract: false,
    playerCards: [],
    dealerCards: [],
    currentPossibleScores: [0]
  };

  startNewGame = async () => {
    const deckId = await getNewDeckId();

    this.setState({
      deckId
    });
  };

  dealStartingHands = async () => {
    const startingCards = await drawNCards(this.state.deckId, 4);

    const playerCards = [startingCards[0], startingCards[1]];
    const dealerCards = [startingCards[2], startingCards[3]];

    const currentPossibleScores = calculateNextPossibleScores([0], playerCards);

    this.setState({
      playerCards,
      dealerCards,
      currentPossibleScores
    });
  };

  hit = async () => {
    const newCards = await drawNCards(this.state.deckId, 1);

    this.setState(prevState => ({
      playerCards: [...prevState.playerCards, ...newCards],
      currentPossibleScores: calculateNextPossibleScores(
        prevState.currentPossibleScores,
        newCards
      )
    }));
  };

  stay = async () => {};

  async componentDidMount() {
    await this.startNewGame();
    await this.dealStartingHands();
  }

  render() {
    const {
      deckId,
      playerCards,
      dealerCards,
      currentPossibleScores
    } = this.state;

    const canHit = currentPossibleScores.some(score => score < 21);
    const autoLose = currentPossibleScores.every(score => score > 21);

    return (
      deckId && (
        <div className="App">
          <DealerArea cards={dealerCards} />
          <div style={{ height: 18, width: "100%" }} />
          <Playerarea cards={playerCards} />
          <div style={{ height: 18, width: "100%" }} />
          <div>
            {currentPossibleScores.map((score, index) => (
              <span key={index}>{` ${score} `}</span>
            ))}
          </div>

          <button disabled={!canHit} onClick={this.hit}>
            HIT
          </button>
          <button onClick={this.stay}>STAY</button>
        </div>
      )
    );
  }
}

export default App;
