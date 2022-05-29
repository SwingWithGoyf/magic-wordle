/* eslint-disable no-console */
import { connect } from 'react-redux';
import { downloadCardList } from '../_actions/fetchcards_action';

import CardSearchComponent from '../_components/CardSearch';

const mapStateToProps = (state) => {
  return {
    cardsdownload: state.cardsdownload,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  //console.log(`rarelist mapdispatchtoprops (ownProps: ${ownProps})`);
  return {
    getCards: () => {
      dispatch(downloadCardList());
    },
  };
};

const CardSearch = connect(mapStateToProps, mapDispatchToProps)(CardSearchComponent);

export default CardSearch;
