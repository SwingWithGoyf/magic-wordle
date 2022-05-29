/* eslint-disable consistent-return */
/* eslint-disable no-console */

// TODO: fetch this once per day (Azure function?) and cache it in storage so we're kinder consumers of Scryfall API

import { newOutMsgEvtInterceptor } from 'fix/handlers/outMsgEvtInterceptor';
import { magiccard_constants } from '../_constants/magiccard_constants'

export function downloadCardList(setListStr) {
    function request() { return { type: magiccard_constants.DOWNLOADCARDS_REQUEST }; }
    function success(json) { return { type: magiccard_constants.DOWNLOADCARDS_SUCCESS, json }; }
    function failure(error) { return { type: magiccard_constants.DOWNLOADCARDS_FAILURE, error }; }

    return (dispatch) => {
        dispatch(request());

        let urlBase = 'https://api.scryfall.com/cards/search?q=Legal%3Ahistoric';

        return fetch(urlBase, { method: 'GET' })
            .then((response) => response.json())
            .then((json) => {
                if (json.data && json.data.length > 0) {
                    let allCardData = [];
                    let numPagesAdded = 0;

                    // estimate how many pages there are
                    let numPages = Math.floor(json.total_cards / json.data.length);
                    if (json.total_cards % json.data.length > 0) {
                        numPages++;
                    }

                    for (let i = 1; i <= numPages; i++) {

                        fetch(`${urlBase}&page=${i}`, { method: 'GET' })
                        .then((response) => response.json())
                        .then((json) => {
                            for (let j = 0; j < json.data.length; j++) {
                                // todo: support flip cards
                                allCardData.push(
                                    {
                                        name: json.data[j].name, 
                                        image_uri: json.data[j].image_uris ? json.data[j].image_uris.normal : ""
                                    }
                                );
                            }
                            numPagesAdded++;
                            if (numPagesAdded === numPages) {
                                allCardData.sort((a, b) => a.name > b.name ? 1 : -1);
                                dispatch(success(allCardData));
                            }
                        })               
                    }
                } else {
                    return dispatch(failure('Scryfall query returned no results!'));
                }
            })
            .catch((error) => {
                console.log(error);
                dispatch(failure(error));
            });
    };
}

