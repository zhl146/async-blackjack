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
  getWinner
} from "./util";

import { PHASES, WINNERS } from "./constants";

const defaultState = {
  deckId: null,
  playerCards: [],
  dealerCards: [],
  currentPossibleScores: [0],
  currentPossibleDealerScores: [0],
  winner: null,
  currentPhase: 0,
  totalPlayerWins: 0,
  totalDealerWins: 0,
  currentMoney: 3000,
  wager: 15
};

class App extends Component {
  state = defaultState;

  handleChangeWager = e => {
    const newWager = e.target.value;

    this.setState(({ currentMoney }) => ({
      wager: Math.min(Math.max(newWager, 1), currentMoney)
    }));
  };

  handleSubmitWager = () => this.setState({ currentPhase: PHASES.deal });

  handleTakeInsurance = () =>
    this.setState(({ wager, currentMoney }) => ({
      currentMoney: currentMoney + +wager,
      currentPhase: PHASES.playAgainOrNot
    }));

  handleDeclineInsurance = () => this.setState({});

  handlePlayAgain = () =>
    this.setState({
      currentPhase: PHASES.playerWager,
      playerCards: [],
      dealerCards: [],
      currentPossibleScores: [0],
      currentPossibleDealerScores: [0],
      winner: null
    });

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
      currentPhase: PHASES.playerHit
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

  dealerStay = () => {
    this.setState({
      currentPhase: PHASES.checkWinner
    });
  };

  stay = () => {
    this.setState({
      currentPhase: PHASES.dealerHit
    });
  };

  checkWinConditions = () => {
    const {
      currentPossibleScores,
      currentPossibleDealerScores,
      currentPhase
    } = this.state;

    switch (currentPhase) {
      case PHASES.deal:
        this.dealStartingHands();
        break;
      case PHASES.playerHit:
        const playerBust = hasBusted(currentPossibleScores);
        if (playerBust) this.setWinner(WINNERS.dealer);
        break;
      case PHASES.dealerHit:
        const dealerBust = hasBusted(currentPossibleDealerScores);
        const dealerMustHit = mustHit(currentPossibleDealerScores);
        if (dealerBust) this.setWinner(WINNERS.player);
        else if (dealerMustHit) this.dealerHit();
        else this.dealerStay();
        break;
      case PHASES.checkWinner:
        this.setWinner();
        break;
      case PHASES.bookKeeping:
        this.bookKeeping();
        break;
      case PHASES.playAgainOrNot:
        break;
      default:
        return;
    }
  };

  setWinner = winner =>
    winner
      ? this.setState({
          winner,
          currentPhase: PHASES.bookKeeping
        })
      : this.setState(
          ({ currentPossibleScores, currentPossibleDealerScores }) => ({
            winner: getWinner(
              currentPossibleDealerScores,
              currentPossibleScores
            ),
            currentPhase: PHASES.bookKeeping
          })
        );

  bookKeeping = () =>
    this.setState(
      ({ winner, totalDealerWins, totalPlayerWins, wager, currentMoney }) => ({
        totalDealerWins:
          winner === WINNERS.dealer ? totalDealerWins + 1 : totalDealerWins,
        totalPlayerWins:
          winner === WINNERS.player ? totalPlayerWins + 1 : totalPlayerWins,
        currentMoney:
          winner === WINNERS.player
            ? currentMoney + +wager
            : winner === WINNERS.dealer
            ? currentMoney - +wager
            : currentMoney,
        currentPhase: PHASES.playAgainOrNot
      })
    );

  async componentDidMount() {
    await this.startNewGame();
  }

  componentDidUpdate() {
    this.checkWinConditions();
  }

  render() {
    const {
      deckId,
      playerCards,
      dealerCards,
      currentPossibleScores,
      winner,
      totalDealerWins,
      totalPlayerWins,
      currentPhase,
      wager,
      currentMoney
    } = this.state;

    const canHit = playerCanHit(currentPossibleScores);

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ margin: 10 }}>{`$$$: ${currentMoney}`}</div>
          <div style={{ margin: 10 }}>{`Player: ${totalPlayerWins}`}</div>
          <div style={{ margin: 10 }}>{`Dealer: ${totalDealerWins}`}</div>
        </div>
        {deckId && (
          <div className="App">
            <DealerArea cards={dealerCards} hideFirstCard={currentPhase < 3} />
            <div style={{ height: 18, width: "100%" }} />
            <Playerarea cards={playerCards} />
            <div style={{ height: 18, width: "100%" }} />
            <div>
              {winner === WINNERS.player ? (
                <div>YOU WIN</div>
              ) : winner === WINNERS.dealer ? (
                <div>YOU LOSE</div>
              ) : winner === WINNERS.tie ? (
                <div>PUSH</div>
              ) : null}
            </div>
            {currentPhase === PHASES.playerWager && (
              <div>
                <input
                  type="number"
                  min="15"
                  max="1000"
                  onChange={this.handleChangeWager}
                  value={wager}
                />
                <button onClick={this.handleSubmitWager}>BET</button>
              </div>
            )}
            {currentPhase === PHASES.playerHit && (
              <Fragment>
                <button disabled={!canHit} onClick={this.playerHit}>
                  HIT
                </button>
                <button onClick={this.stay}>STAY</button>
              </Fragment>
            )}
            {currentPhase === PHASES.playAgainOrNot && currentMoney > 0 && (
              <button onClick={this.handlePlayAgain}>PLAY AGAIN</button>
            )}
            {currentMoney < 0 && (
              <div>
                <div>YOU HAVE NO MONEY :(</div>
                <button onClick={this.startNewGame}>START A NEW GAME</button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default App;
