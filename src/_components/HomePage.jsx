import React from 'react';
import { Button, Navbar, Row, Col } from 'react-bootstrap';

import CardSearch from '../_containers/CardSearch';
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

  render() {

    return (
      <div className="mainContent">
        <Row>
          <Col xs={12} sm={12} md={12} lg={12} xl={12}>
            <Navbar bg="dark" variant="dark" expand="lg">
              <Navbar.Brand href="#home" onClick={() => this.setState({ currentTab: 'drafts' })}>Historic Magic 'Enchant Worldle'</Navbar.Brand>
            </Navbar>
            <div>
              <CardSearch onMakeGuess={this.makeGuess.bind(this)} />
              <GuessTable latestGuess={this.state.currentGuess} />
              <Button onClick={this.clearGuesses.bind(this)}>Clear Guesses</Button>  {/* temp button for testing */}
            </div>
          </Col>
        </Row>
      </div >
    );
  }
}

export default HomePage;