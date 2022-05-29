import {
    combineReducers
} from 'redux';

import cardsdownload from './downloadcards.reducer';

const rootReducer = combineReducers({
    cardsdownload,
});

export default rootReducer;