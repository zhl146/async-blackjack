import React from "react";

export default class DealerArea extends React.Component {
  render() {
    const { cards, hideFirstCard } = this.props;

    return (
      cards.length > 0 && (
        <div>
          {cards.map(({ image }, index) =>
            index === 0 && hideFirstCard ? (
              <div className="HiddenDealerCard" />
            ) : (
              <img className="DealerCard" key={index} src={image} />
            )
          )}
        </div>
      )
    );
  }
}
