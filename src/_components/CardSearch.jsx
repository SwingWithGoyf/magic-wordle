import React from 'react';
import { Dropdown, Form } from 'react-bootstrap';

class CardSearch extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      currentGuess: ''
    };
    
    this.changeGuess = this.changeGuess.bind(this);
    this.changeGuessDropdown = this.changeGuessDropdown.bind(this);
  }

  changeGuess(event) {
    this.setState({currentGuess: event.target.value});
  }

  changeGuessDropdown(text) {
    this.setState({currentGuess: text});
  }
  
  componentDidMount() {
    this.props.getCards();
  }

  render() {
    const { cardsdownload } = this.props;
    let cardSearchOptions = [];
    
    // if (cardsdownload && cardsdownload.card_data) {
    //   cardsdownload.card_data.map((item) => (
    //     cardSearchOptions.push( {value: item.name, label: item.name})
    //   ));
    // }

    return (
      <div className='cardGuess'>
      {cardsdownload && cardsdownload.loading && <em>Loading...</em>}
      {cardsdownload && cardsdownload.card_data && 
        <div>
          <b>Guess:</b>
            <Form.Control
              onChange={this.changeGuess.bind(this)}
              value={this.state.currentGuess}
            />
            {String(this.state.currentGuess).length > 2 
            ?
              <Dropdown.Menu show>
                {cardsdownload.card_data.filter((element) => element.name.toLowerCase().includes(this.state.currentGuess.toLowerCase())).map((item) => 
                  <Dropdown.Item key={item.name}>{item.name}</Dropdown.Item>
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