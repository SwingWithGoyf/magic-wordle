import { magiccard_constants } from '../_constants/magiccard_constants';

const cardsdownload = (state = {}, action) => {
    switch (action.type) {
        case magiccard_constants.DOWNLOADCARDS_REQUEST:
            return {
                loading: true
            };
        case magiccard_constants.DOWNLOADCARDS_SUCCESS:
            console.log('reducer processing DOWNLOADCARDS_SUCCESS, returning payload');
            return {
                card_data: action.json
            };
        case magiccard_constants.DOWNLOADCARDS_FAILURE:
            return {
                error: action.error
            };
        default:
            return state
    }
}

export default cardsdownload;