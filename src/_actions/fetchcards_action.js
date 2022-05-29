/* eslint-disable consistent-return */
/* eslint-disable no-console */

// TODO: fetch this once per day (Azure function?) and cache it in storage so we're kinder consumers of Scryfall API

import { magiccard_constants } from '../_constants/magiccard_constants'
import { CacheCardsToStorage } from '../_storage/CardStorage';
import { InitStorage } from '../_storage/StorageCommon';

export function downloadCardList(setListStr) {
    function request() { return { type: magiccard_constants.DOWNLOADCARDS_REQUEST }; }
    function success(json) { return { type: magiccard_constants.DOWNLOADCARDS_SUCCESS, json }; }
    function failure(error) { return { type: magiccard_constants.DOWNLOADCARDS_FAILURE, error }; }

    return (dispatch) => {
        dispatch(request());

        InitStorage((initStorageError) => {
            if (initStorageError) {
                dispatch(failure(initStorageError));
            }

            // todo add call to storage to see when we last fetched from scryfall - if less than a week ago, skip the fetch


            let urlBase = 'https://api.scryfall.com/cards/search?q=Legal%3Ahistoric';

            return fetch(urlBase, { method: 'GET' })
                .then((response) => response.json())
                .then((json) => {
                    if (json.data && json.data.length > 0) {
                        let allCardData = [];
                        // estimate how many pages there are
                        let numPages = Math.floor(json.total_cards / json.data.length);
                        if (json.total_cards % json.data.length > 0) {
                            numPages++;
                        }

                        // fetch each page as an individual promise within an array
                        let promises = [];
                        let pagesAdded = 0;
                        for (let i = 1; i <= numPages; i++) {
                            promises.push(fetch(`${urlBase}&page=${i}`));
                        }
                        Promise.all(promises)
                        .then((responses) => responses.forEach((response) => 
                        {
                            response.json()
                            .then((json) => {
                                if (json && json.data) {
                                    for (let j = 0; j < json.data.length; j++) {
                                        let curObj = json.data[j];
                                        let cardName = curObj.name;
                                        if (cardName.startsWith('A-')) {
                                            cardName = cardName.substring(2);
                                        }
                                        
                                        let curImageUri = curObj.image_uris ? curObj.image_uris.small : '';

                                        // flip card, use the first face to store the image
                                        if (curObj.layout === 'modal_dfc' && curObj.card_faces) {
                                            curImageUri = (curObj.card_faces[0] && curObj.card_faces[0].image_uris)
                                                ? curObj.card_faces[0].image_uris.small
                                                : ''
                                        }

                                        allCardData.push(
                                            {
                                                name: cardName, 
                                                image_uri: curImageUri,
                                                card_obj: curObj
                                            }
                                        );
                                    }
                                    pagesAdded++;
                                    if (pagesAdded === numPages) {
                                        allCardData.sort((a, b) => a.name > b.name ? 1 : -1);
                                        dispatch(success(allCardData));
                                        CacheCardsToStorage(allCardData, (cacheError) => {
                                            if (cacheError) {
                                                console.log(`Error caching cards to azure storage: ${cacheError}`);
                                            }
                                        });
                                    }
                                }
                            })
                        }));
                    } else {
                        return dispatch(failure('Scryfall query returned no results!'));
                    }
                })
                .catch((error) => {
                    console.log(error);
                    dispatch(failure(error));
                });
        });
    }    
}

