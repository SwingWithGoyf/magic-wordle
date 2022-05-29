import { connect } from 'react-redux';
import { initStorage } from '../_actions/storage_action';
import AppComponent from '../_components/App'

const mapStateToProps = state => {
  return {};
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    initStorage: () => {
      dispatch(initStorage());
    },
  };
}

const App = connect(mapStateToProps, mapDispatchToProps)(AppComponent);

export default App;