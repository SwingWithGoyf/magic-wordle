/* eslint-disable no-console */
import { connect } from 'react-redux';
import { downloadCardList } from '../_actions/fetchcards_action';

import HomePageComponent from '../_components/HomePage';

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

const HomePage = connect(mapStateToProps, mapDispatchToProps)(HomePageComponent);

export default HomePage;
