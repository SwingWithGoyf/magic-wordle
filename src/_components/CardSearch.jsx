import React from 'react';
// import {
//   Button, Container, Row, Col, Table,
// } from 'react-bootstrap';
import Select from 'react-select';

class CardSearch extends React.Component {

  componentDidMount() {
    this.props.getCards();
  }

  render() {
    const { cardsdownload } = this.props;
    let cardSearchOptions = [];
    if (cardsdownload && cardsdownload.card_data) {
      cardsdownload.card_data.map((item) => (
        cardSearchOptions.push( {value: item.name, label: item.name})
      ));
    }

    return (
      <div className='cardGuess'>
      {cardsdownload && cardsdownload.loading && <em>Loading...</em>}
      {cardsdownload && cardsdownload.card_data &&
        <div>
          <b>Guess:</b><Select options={cardSearchOptions} />
        </div>
      }
      </div>
    );
  }
}

export default CardSearch;