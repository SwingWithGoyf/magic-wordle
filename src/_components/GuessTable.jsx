import React from 'react';
import { Table } from 'react-bootstrap';

class GuessTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      guessesSoFar: []
    };
    
    // this.changeGuess = this.changeGuess.bind(this);
    // this.makeGuess = this.makeGuess.bind(this);
    // this.onKeyUp = this.onKeyUp.bind(this);
  }

  componentDidMount() {
    //this.props.getCards();
  }

  render() {
    const { guessesSoFar } = this.state;
    const { cardData } = this.props;
    // let itemIndex = 0;
    // let filteredCardList = [];
    // let curSelectedCard = '';
    let savedGuessesSoFar = JSON.parse(window.localStorage.getItem('guessesSoFar')) || guessesSoFar;

    if (cardData && cardData.length > 0) {
      console.log('card data loaded for guess table')
      //todo: still need to fix up the object loaded by the table cache (missing most attributes that are present in the scryfall call)
      // best bet is to normalize an object with only what you need and have that come back from the getcards action
    }

    return (
      <div className='guessTable'>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Card Name</th>
              <th>Mana Value</th>
            </tr>
          </thead>
          <tbody>
            {savedGuessesSoFar.map((item) => 
              <tr>
                <td>{item}</td>
                <td>{cardData && cardData.filter((element) => element.name === item).Cmc._}</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    );
  }
}

export default GuessTable;