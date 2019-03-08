import React from "react";

export default class Playerarea extends React.Component {
  render() {
    const { cards } = this.props;

    return (
      cards.length > 0 && (
        <div>
          {cards.map(({ image }, index) => (
            <img key={index} src={image} />
          ))}
        </div>
      )
    );
  }
}
