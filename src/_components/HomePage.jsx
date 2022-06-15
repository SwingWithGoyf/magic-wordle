import React from 'react';
import { Button, Navbar } from 'react-bootstrap';

import CardSearch from './CardSearch';
import GuessTable from './GuessTable';

////////////////////
// Component that encapsulates the main home page for the app 
////////////////////
class HomePage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      guessesSoFar: [],
      currentGuess: '',
    };
    
    this.makeGuess = this.makeGuess.bind(this);
    this.clearGuesses = this.clearGuesses.bind(this);
  }

  clearGuesses() {
    window.localStorage.setItem("guessesSoFar", JSON.stringify([]));
    this.setState({guessesSoFar: [], currentGuess: '',});
  }

  makeGuess(cardName) {
    let guessesSoFar = JSON.parse(window.localStorage.getItem('guessesSoFar')) || [];
    guessesSoFar.push(cardName);
    window.localStorage.setItem("guessesSoFar", JSON.stringify(guessesSoFar));
    this.setState({ currentGuess: cardName, guessesSoFar: guessesSoFar });
  }

  componentDidMount() {
    this.props.getCards();
  }

  render() {

    const { cardsdownload } = this.props;
    let cardData = [];
    let loading = false;

    if (cardsdownload) {
      if (cardsdownload.card_data) {
        cardData = cardsdownload.card_data;
      }
      if (cardsdownload.loading) {
        loading = cardsdownload.loading;
      }
    }

    return (
      <div className="mainContent">
        <Navbar className="navbarBrand" bg="dark" variant="dark" expand="lg">
          <Navbar.Brand href="#home" onClick={() => this.setState({ currentTab: 'drafts' })}>Historic Magic 'Enchant Worldle'</Navbar.Brand>
        </Navbar>
        <div className="searchContainer">
          <CardSearch 
            onMakeGuess={this.makeGuess.bind(this)} 
            cardData={cardData}
            loading={loading}
          />
        </div>
        <br />
        <br />
        <br />
        <div className="guessTableContainer">
          <GuessTable 
            latestGuess={this.state.currentGuess} 
            cardData={cardData}
            loading={loading}
          />
        </div>
        <div className="clearButton">
          <Button onClick={this.clearGuesses.bind(this)}>Clear Guesses</Button>  {/* temp button for testing */}
        </div>
      </div >
    );
  }
}

export default HomePage;