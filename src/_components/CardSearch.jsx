import React from 'react';
import { Form } from 'react-bootstrap';
import Select from 'react-select';

class CardSearch extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      currentGuess: '',
      selectedIndex: 0,
    };
    
    this.changeGuess = this.changeGuess.bind(this);
    this.makeGuess = this.makeGuess.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  changeGuess(event) {
    this.setState({currentGuess: event.target.value});
    if (String(event.target.value).length <= 2) {
      // if they use backspace or other means to shorten the guess below 3 chars, reset the index counter
      this.setState({selectedIndex: 0});
    }
  }

  makeGuess(dropDownOption) {
    this.saveGuess(dropDownOption.label);
  }

  saveGuess(cardName) {
    this.props.onMakeGuess(cardName);
    console.log(`Guessed: ${cardName}`);
    this.setState({selectedIndex: 0, currentGuess: ''});  // clear current guess so they can make another one
  }

  onKeyUp(cardName, event) {
    // only check keys if the dropdown is visible (e.g. the user has typed at least 3 chars)
    if (String(this.state.currentGuess).length > 2) {
      let curSelectedIndex = this.state.selectedIndex;
      let filteredCardList = this.props.cardData.filter((element) => element.name.toLowerCase().includes(this.state.currentGuess.toLowerCase()));
      // check for up arrow key
      if (event.keyCode === 38) {
        if (curSelectedIndex > 0) {
          curSelectedIndex--;
          this.setState({selectedIndex: curSelectedIndex});
        }
      // check for down arrow key
      } else if (event.keyCode === 40) {
        if (this.props.cardData && curSelectedIndex < filteredCardList.length - 1) {
          curSelectedIndex++;
          this.setState({selectedIndex: curSelectedIndex});
        }
      // check for enter key
      } else if (event.keyCode === 13) {
        this.saveGuess(cardName);
      }
    }
  }

  render() {
    const { cardData } = this.props;
    const { loading } = this.props;
    let filteredCardList = [];
    let curSelectedCard = '';
    let dropdownIndex = 0;
    let dropdownOptions = [];
    let curSelectedOption = null;

    if (cardData) {
      filteredCardList = cardData.filter((element) => element.name.toLowerCase().includes(this.state.currentGuess.toLowerCase()));
      if (filteredCardList && filteredCardList.length > this.state.selectedIndex) {
        curSelectedCard = filteredCardList[this.state.selectedIndex].name;
        filteredCardList.map((item) => dropdownOptions.push({value: dropdownIndex++, label: item.name}));
      }
      let filteredOptions = dropdownOptions.filter((element) => this.state.selectedIndex === element.value);
      if (filteredOptions && filteredOptions.length > 0) {
        curSelectedOption = dropdownOptions.filter((element) => this.state.selectedIndex === element.value)[0];
      }
      if (this.state.currentGuess.length < 2) {
        curSelectedOption = null;
        curSelectedCard = '';
      }
    }
    
    return (
      <div className="cardGuessContainer">
      {loading && <em>Loading...</em>}
      {cardData && cardData.length > 0 && 
        <div className="cardGuessContainer">
          <div className="imageBackground">
            <img src={require("../_images/manasymbols.png")} width="625" height="150" alt="magic mana symbol art"/>
          </div>
          <div className="instructions">
            <b>Instructions</b>
            <li>Use the filter to start typing parts of Magic cards</li>
            <li>After typing at least 3 characters, a list will come up with cards in Historic (available on Magic Arena) that match the filter</li>
            <li>Select a card to guess with the arrow keys and Enter, or with the mouse</li>
            <li>Each guess will tell you whether you have a partial (yellow) or full (green) match in several categories</li>
            <li>Guess in under 6 tries to win!</li>
            <li>In typical Wordle fashion, there's one card per day, good luck!</li>
          </div>
          <div className="imageBackground">
            <img src={require("../_images/manasymbols.png")} width="625" height="150" alt="magic mana symbol art" />
          </div>
          <div className="cardGuess">
            <b>Filter:&nbsp;&nbsp;</b>
              <Form.Control
                className="cardGuess"
                onChange={this.changeGuess.bind(this)}
                value={this.state.currentGuess}
                onKeyDown={this.onKeyUp.bind(this, curSelectedCard)}
                placeholder={"Enter at least 3 characters to bring up a list of matching cards"}
              />
          </div>
          <div className="cardSearchDropdown">
            {String(this.state.currentGuess).length > 2 
            ?
            <div>
              <Select
                  options={dropdownOptions}
                  menuIsOpen={true}
                  isSearchable={false}
                  // defaultValue={curSelectedOption}
                  // selectedIndex={curSelectedOption && curSelectedOption.value}
                  value={curSelectedOption}
                  onChange={this.makeGuess.bind(this)}
              />
            </div>
            : 
            <div>
            </div>
            }
          </div>
        </div>
      }
      </div>
    );
  }
}

export default CardSearch;