import React from 'react';
import { Dropdown, Form } from 'react-bootstrap';

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
    //this.props.makeGuess(cardName); // not impl yet
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
        if (this.props.cardsdownload && this.props.cardsdownload.card_data && curSelectedIndex < (this.props.cardsdownload.card_data.length - 1)) {
          curSelectedIndex++;
          this.setState({selectedIndex: curSelectedIndex});
        }
      // check for enter key
      } else if (event.keyCode === 13) {
        this.saveGuess(cardName);
      }
    }
  }

  componentDidMount() {
    this.props.getCards();
  }

  render() {
    const { cardsdownload } = this.props;
    let itemIndex = 0;
    let filteredCardList = [];
    let curSelectedCard = '';

    if (cardsdownload && cardsdownload.card_data) {
      filteredCardList = cardsdownload.card_data.filter((element) => element.name.toLowerCase().includes(this.state.currentGuess.toLowerCase()));
      if (filteredCardList && filteredCardList.length > 0) {
        curSelectedCard = filteredCardList[this.state.selectedIndex].name;
      }
    }
    
    return (
      <div className='cardGuess'>
      {cardsdownload && cardsdownload.loading && <em>Loading...</em>}
      {cardsdownload && cardsdownload.card_data && 
        <div>
          <b>Guess:</b>
            <Form.Control
              onChange={this.changeGuess.bind(this)}
              value={this.state.currentGuess}
              onKeyDown={this.onKeyUp.bind(this, curSelectedCard)}
            />
            {String(this.state.currentGuess).length > 2 
            ?
              <Dropdown.Menu show>
                {filteredCardList.map((item) => 
                  <Dropdown.Item 
                    active={itemIndex === this.state.selectedIndex ? true : false} 
                    key={itemIndex++} 
                    onClick={this.makeGuess.bind(this)}>{item.name}
                  </Dropdown.Item>
                )}
              </Dropdown.Menu>
            // <Select 
            //   options={cardSearchOptions}
            //   onInputChange={this.changeGuessDropdown.bind(this)}
            //   // onChange TODO: this will fire when they actually pick a guess, we'll need to commit it to the guest table
            //   defaultInputValue={this.state.currentGuess}
            //   menuIsOpen={true}
            //   isSearchable={false}
            //   controlShouldRenderValue={false}
            // />
            : 
              <div />
            }
        </div>
      }
      </div>
    );
  }
}

export default CardSearch;