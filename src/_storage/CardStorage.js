import { CreateTableIfNotExists, DeleteTable, AddDataInBatch, ListTables, QueryEntities } from "./StorageCommon";
import moment from 'moment';
const { odata } = require("@azure/data-tables");
const CardTableName = "WordleCardList";

// export function AddCard(cardName, jsonCard, callback) {
//   let modifiedCardName = cardName;
//   if (modifiedCardName.includes('//')) {
//     modifiedCardName = modifiedCardName.substr(0, modifiedCardName.indexOf('//') - 1);
//   }
  
//   const task = {
//     partitionKey: jsonCard.set,
//     rowKey: modifiedCardName,    
//     CardName: cardName,
//     Cmc: jsonCard.cmc,
//     //todo: colors (handle array)
//     Rarity: jsonCard.rarity,
//     Type: jsonCard.type_line,
//     ReleaseDate: jsonCard.released_at,
//     ScryfallUrl: jsonCard.uri
//   }

//   InsertOrMergeEntity(task, CardTableName, (error, result) => {
//     if (error) {
//       console.log(`Error inserting card: ${error}`);
//     }
//     callback(error, result);
//   });
  
// }

export function CacheCardsToStorage(allCards, callback) {
  if (!allCards) {
    callback("CacheCardsToStorage was passed a null list of cards!");
  }
  DeleteTable(CardTableName, (error) => {
    if (error) {
      callback(error);
    }

    CreateTableIfNotExists(CardTableName, (createError) => {
      if (createError) {
        callback(createError);
      }

      let taskList = [];
      for (let j = 0; j < allCards.length; j++) {
        let curCard = allCards[j];
        let modifiedCardName = curCard.name;
        if (modifiedCardName.includes('//')) {
          modifiedCardName = modifiedCardName.substr(0, modifiedCardName.indexOf('//') - 1);
        }
        taskList.push({"set": curCard.set, "data": ["create", 
          {
            partitionKey: curCard.set,
            rowKey: modifiedCardName,    
            CardName: curCard.name,
            Cmc: curCard.cmc,
            //todo: colors (handle array), probably do this on the receiving action or further downstream?  seems ok to store as array...
            Rarity: curCard.rarity,
            ReleaseDate: curCard.released,
            ScryfallUrl: curCard.scryfall_uri,
            Type: String(curCard.type),
            Color: String(curCard.color),
            ImageUrl: curCard.image_uri
          }
        ]});
      }

      // below code finds the unique sets in the list
      let uniqueSets = [...new Set(taskList.map(item=>item.set))];

      let promises = [];

      for(let i = 0; i < uniqueSets.length; i++) {
        let cardsForCurSet = taskList.filter((item) => item.set === uniqueSets[i]);
        let curBatch = [];
        for (let j = 0; j < cardsForCurSet.length; j++) {
          curBatch.push(cardsForCurSet[j].data);
          if (curBatch.length >= 100) {
            // fire off a batch once we hit 100 (the max batch size)
            AddDataInBatch(curBatch, CardTableName, (addDataError) => {
              if (addDataError) {
                callback(addDataError);
              }          
            });
            curBatch = [];
          }
        }

        promises.push(
          AddDataInBatch(curBatch, CardTableName, (addDataError) => {
            if (addDataError) {
              callback(addDataError);
            }          
          })
        );
      }

      // fire off all the promises to add the data
      let setsAdded = 0;
      Promise.all(promises)
        .then((responses) => responses.forEach(() => {
          setsAdded++;
          if (setsAdded === uniqueSets.length) {
            callback(null);
          }
        }));
    });    
  });
}

export function GetCardsFromCache(callback) {
  QueryEntities(null, CardTableName, (queryError, queryResults) => {
    if (queryError) {
      callback(queryError, false);
    } else {
      callback(null, queryResults);
    }
  });
}

export function NeedToRefreshCardCache(callback) {
  ListTables(odata`TableName eq ${CardTableName}`, (error, results) => {
    if (error) {
      callback(error, false);
    } else {
      if (results && results.length === 0) {
        callback(null, true); // table isn't present so need to refresh cache
      } else {
        QueryEntities(odata`RowKey eq 'Grizzly Bears'`, CardTableName, (queryError, queryResults) => {
          if (queryError) {
            callback(queryError, false);
          } else if (queryResults.length === 0) {
            console.log("Table cache has no rows, kicking off refresh!");
            callback(null, true);
          } else {
            if (queryResults && queryResults.length > 0) {
              console.log(queryResults[0].timestamp);
              var now = moment();
              var before = moment(queryResults[0].timestamp);
              var daysElapsed = now.diff(before, 'days');
              if (daysElapsed >= 5) {
                callback(null, true);
              } else {
                callback(null, false);
              }
            } 
          }
        });
      }
    }
  });
}