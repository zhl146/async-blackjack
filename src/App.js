import React, { Component, Fragment } from "react";
import "./App.css";

import Playerarea from "./PlayerArea";
import DealerArea from "./DealerArea";
import {
  drawNCards,
  getNewDeckId,
  calculateNextPossibleScores,
  hasBusted,
  mustHit,
  playerCanHit,
  doesPlayerWin
} from "./util";

const defaultState = {
  deckId: null,
  dealerPlaying: false,
  playerCards: [],
  dealerCards: [],
  currentPossibleScores: [0],
  currentPossibleDealerScores: [0],
  playerWin: null,
  totalPlayerWins: 0,
  totalDealerWins: 0
};

class App extends Component {
  state = defaultState;

  startNewGame = async () => {
    const deckId = await getNewDeckId();

    this.setState({
      ...defaultState,
      deckId
    });
  };

  dealStartingHands = async () => {
    const startingCards = await drawNCards(this.state.deckId, 4);

    const playerCards = [startingCards[0], startingCards[1]];
    const dealerCards = [startingCards[2], startingCards[3]];

    const currentPossibleScores = calculateNextPossibleScores([0], playerCards);
    const currentPossibleDealerScores = calculateNextPossibleScores(
      [0],
      dealerCards
    );

    this.setState({
      playerCards,
      dealerCards,
      currentPossibleScores,
      currentPossibleDealerScores,
      playerWin: null,
      dealerPlaying: false
    });
  };

  playerHit = async () => {
    const newCards = await drawNCards(this.state.deckId, 1);

    this.setState(prevState => ({
      playerCards: [...prevState.playerCards, ...newCards],
      currentPossibleScores: calculateNextPossibleScores(
        prevState.currentPossibleScores,
        newCards
      )
    }));
  };

  dealerHit = async () => {
    const newCards = await drawNCards(this.state.deckId, 1);

    this.setState(prevState => ({
      dealerCards: [...prevState.dealerCards, ...newCards],
      currentPossibleDealerScores: calculateNextPossibleScores(
        prevState.currentPossibleDealerScores,
        newCards
      )
    }));
  };

  stay = async () => {
    this.setState({
      dealerPlaying: true
    });
  };

  checkWinConditions = async () => {
    const {
      currentPossibleDealerScores,
      currentPossibleScores,
      dealerPlaying,
      playerWin
    } = this.state;

    const playerBust = hasBusted(currentPossibleScores);

    if (playerBust && playerWin !== false) this.dealerWin();

    if (dealerPlaying === true && playerWin === null) {
      const dealerBust = hasBusted(currentPossibleDealerScores);
      const dealerMustHit = mustHit(currentPossibleDealerScores);
      if (dealerBust) this.playerWin();
      else if (dealerMustHit) this.dealerHit();
      else {
        doesPlayerWin(currentPossibleDealerScores, currentPossibleScores)
          ? this.playerWin()
          : this.dealerWin();
      }
    }
  };

  playerWin = () => {
    this.setState(prevState => ({
      playerWin: true,
      totalPlayerWins: prevState.totalPlayerWins + 1,
      dealerPlaying: false
    }));
  };

  dealerWin = () => {
    this.setState(prevState => ({
      playerWin: false,
      totalDealerWins: prevState.totalDealerWins + 1,
      dealerPlaying: false
    }));
  };

  async componentDidMount() {
    await this.startNewGame();
    await this.dealStartingHands();
  }

  async componentDidUpdate() {
    this.checkWinConditions();
  }

  render() {
    const {
      deckId,
      playerCards,
      dealerCards,
      currentPossibleScores,
      playerWin,
      totalDealerWins,
      totalPlayerWins,
      dealerPlaying
    } = this.state;

    const canHit = playerCanHit(currentPossibleScores);

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ margin: 10 }}>{`Player: ${totalPlayerWins}`}</div>
          <div style={{ margin: 10 }}>{`Dealer: ${totalDealerWins}`}</div>
        </div>
        {deckId && (
          <div className="App">
            <DealerArea
              cards={dealerCards}
              hideFirstCard={playerWin === null || dealerPlaying}
            />
            <div style={{ height: 18, width: "100%" }} />
            <Playerarea cards={playerCards} />
            <div style={{ height: 18, width: "100%" }} />
            <div>
              {currentPossibleScores.map((score, index) => (
                <span key={index}>{` ${score} `}</span>
              ))}
            </div>
            <div>
              {playerWin === true ? (
                <div>YOU WIN</div>
              ) : playerWin === false ? (
                <div>YOU LOSE</div>
              ) : null}
              {!(playerWin === true || playerWin === false) ? (
                <Fragment>
                  <button disabled={!canHit} onClick={this.playerHit}>
                    HIT
                  </button>
                  <button onClick={this.stay}>STAY</button>
                </Fragment>
              ) : (
                <button onClick={this.dealStartingHands}>PLAY AGAIN</button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default App;
