import React from 'react';
// import {
//   Button, Container, Row, Col, Table,
// } from 'react-bootstrap';

class CardSearch extends React.Component {

  componentDidMount() {
    this.props.getCards();
  }

  render() {
    const { cardsdownload } = this.props;
    return (
      <div>search goes here
      {cardsdownload && cardsdownload.card_data &&
        <div>
          {cardsdownload.card_data.map((item) => (
            // <img src={item.image_uri}></img>
            <div>{item.name}<br /></div>
          ))}
        </div>
      }
      </div>
    );
  }
}

export default CardSearch;