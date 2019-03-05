import React from "react";

export default class DealerArea extends React.Component {
  render() {
    const { cards } = this.props;

    return (
      cards.length && (
        <div>
          {cards.map(card => (
            <img src={card.image} />
          ))}
        </div>
      )
    );
  }
}