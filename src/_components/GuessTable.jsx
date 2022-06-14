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
    // let itemIndex = 0;
    // let filteredCardList = [];
    // let curSelectedCard = '';
    let savedGuessesSoFar = JSON.parse(window.localStorage.getItem('guessesSoFar')) || guessesSoFar;

    return (
      <div className='guessTable'>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Card Name</th>
            </tr>
          </thead>
          <tbody>
            {savedGuessesSoFar.map((item) => 
              <tr>
                <td>{item}</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    );
  }
}

export default GuessTable;