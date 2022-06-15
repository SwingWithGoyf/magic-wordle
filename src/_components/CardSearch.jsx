import React from 'react';
import { Dropdown, Form } from 'react-bootstrap';
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

  makeGuess(event) {
    this.saveGuess(event.target.text);
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
      // check for up arrow key
      if (event.keyCode === 38) {
        if (curSelectedIndex > 0) {
          curSelectedIndex--;
          this.setState({selectedIndex: curSelectedIndex});
        }
      // check for down arrow key
      } else if (event.keyCode === 40) {
        if (this.props.cardData && curSelectedIndex < (this.props.cardData.length - 1)) {
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
    let itemIndex = 0;
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
    }
    
    return (
      <div className="cardGuessContainer">
      {loading && <em>Loading...</em>}
      {cardData && 
        <div className="cardGuessContainer">
          <div className="cardGuess">
            <b>Guess:</b>
              <Form.Control
                onChange={this.changeGuess.bind(this)}
                value={this.state.currentGuess}
                onKeyDown={this.onKeyUp.bind(this, curSelectedCard)}
              />
          </div>
          <div className="cardSearchDropdown">
            {String(this.state.currentGuess).length > 2 
            ?
            <div>
              {/* <Dropdown.Menu show align="start">
                {filteredCardList.map((item) => 
                  <Dropdown.Item 
                    active={itemIndex === this.state.selectedIndex ? true : false} 
                    key={itemIndex++} 
                    onClick={this.makeGuess.bind(this)}>{item.name}
                  </Dropdown.Item>
                )}
              </Dropdown.Menu> */}
              <Select
                  options={dropdownOptions}
                  menuIsOpen={true}
                  isSearchable={false}
                  defaultValue={curSelectedOption}
                  selectedIndex={curSelectedOption && curSelectedOption.value}
                  hideSelectedOptions
              />
              </div>
            : 
                  <div>
              <Select
                  options={dropdownOptions}
              />
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