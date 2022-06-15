/* eslint-disable consistent-return */
/* eslint-disable no-console */

// TODO: fetch this once per day (Azure function?) and cache it in storage so we're kinder consumers of Scryfall API

import { magiccard_constants } from '../_constants/magiccard_constants'
import { CacheCardsToStorage, NeedToRefreshCardCache, GetCardsFromCache } from '../_storage/CardStorage';

export function downloadCardList(setListStr) {
    function request() { return { type: magiccard_constants.DOWNLOADCARDS_REQUEST }; }
    function success(json) { return { type: magiccard_constants.DOWNLOADCARDS_SUCCESS, json }; }
    function failure(error) { return { type: magiccard_constants.DOWNLOADCARDS_FAILURE, error }; }

    return (dispatch) => {
        dispatch(request());

        let cacheStale = false;

        // check whether we need to refresh our table cache of cards (conditions: either table is missing or last fetch was >7 days ago)
        NeedToRefreshCardCache((cacheCheckError, cacheCheckFlag) => {
            if (!cacheCheckError) {
                cacheStale = cacheCheckFlag;
            }

            if (cacheStale) {
                console.log('fetching card list from scryfall and caching to table cache');

                // table storage cache is missing or too old, so fetch cards from Scryfall
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
                                            if (curObj.object !== "card") {
                                                continue;   // don't process non cards
                                            }
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
                                                    cmc: curObj.cmc,
                                                    rarity: curObj.rarity,
                                                    released: curObj.released_at,
                                                    color: curObj.colors,
                                                    type: curObj.type_line,
                                                    scryfall_uri: curObj.uri,
                                                    set: curObj.set
                                                }
                                            );
                                        }
                                        pagesAdded++;
                                        if (pagesAdded === numPages) {
                                            allCardData.sort((a, b) => a.name > b.name ? 1 : -1);
                                            console.log('scryfall fetch complete');
                                            dispatch(success(allCardData));
                                            console.log('beginning cache to table cache');
                                            CacheCardsToStorage(allCardData, (cacheError) => {
                                                if (cacheError) {
                                                    console.log(`Error caching cards to azure storage: ${cacheError}`);
                                                }
                                                console.log('table caching operation complete');
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
            } else {    // table storage cache is not stale, fetch from there 
                console.log('fetching card list from table cache');
                GetCardsFromCache((getCachedCardsError, getCachedCardsResults) => {
                    if (getCachedCardsError || getCachedCardsResults === null || getCachedCardsResults.length === 0) {
                        dispatch(failure(getCachedCardsError));
                    } else {
                        let allCardsData = [];
                        for (let j = 0; j < getCachedCardsResults.length; j++) {
                            let curObj = getCachedCardsResults[j];
                            let cardName = curObj.rowKey;   // parsing of 'A-' occurred when it was cached, so don't need it here
                                            
                            //todo: don't have image url in storage, we should add it
                            //todo: do we need to reconstruct the other elements here? or alternatively flatten the scryfall version of the data 
                            //      so that it matches the way we store in the table?
                            allCardsData.push(
                                {
                                    name: cardName, 
                                    image_uri: curCard.ImageUrl,
                                    cmc: curObj.Cmc,
                                    rarity: curObj.Rarity,
                                    released: curObj.ReleaseDate,
                                    color: curObj.Color,
                                    type: curObj.Type,
                                    scryfall_uri: curObj.ScryfallUri,
                                    set: curObj.partitionKey
                                }
                            );
                        }
                        allCardsData.sort((a, b) => a.name > b.name ? 1 : -1);
                        console.log('table cache fetch complete');
                        dispatch(success(allCardsData));
                    }
                });
            }
        });
    }    
}

