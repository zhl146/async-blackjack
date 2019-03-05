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

class App extends Component {
  state = {
    deckId: null,
    dealerPlaying: false,
    playerCards: [],
    dealerCards: [],
    currentPossibleScores: [0],
    currentPossibleDealerScores: [0],
    playerWin: null
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

  async componentDidMount() {
    await this.startNewGame();
    await this.dealStartingHands();
  }

  async componentDidUpdate() {
    const {
      currentPossibleDealerScores,
      currentPossibleScores,
      dealerPlaying,
      playerWin
    } = this.state;

    console.log(currentPossibleDealerScores, dealerPlaying);

    const playerBust = hasBusted(currentPossibleScores);

    if (playerBust && playerWin !== false) this.setState({ playerWin: false });

    if (dealerPlaying === true && playerWin === null) {
      const dealerBust = hasBusted(currentPossibleDealerScores);
      const dealerMustHit = mustHit(currentPossibleDealerScores);
      if (dealerBust) this.setState({ playerWin: true, dealerPlaying: false });
      else if (dealerMustHit) this.dealerHit();
      else {
        this.setState({
          playerWin: doesPlayerWin(
            currentPossibleDealerScores,
            currentPossibleScores
          ),
          dealerPlaying: false
        });
      }
    }
  }

  render() {
    const {
      deckId,
      playerCards,
      dealerCards,
      currentPossibleScores,
      playerWin
    } = this.state;

    const canHit = playerCanHit(currentPossibleScores);

    console.log(playerWin);

    return (
      <div>
        {playerWin === true ? (
          <div>YOU WIN</div>
        ) : playerWin === false ? (
          <div>YOU LOSE</div>
        ) : null}
        {deckId && (
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
            <div>
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
