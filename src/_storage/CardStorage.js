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
        taskList.push({"set": curCard.card_obj.set, "data": ["create", 
          {
            partitionKey: curCard.card_obj.set,
            rowKey: modifiedCardName,    
            CardName: curCard.card_obj.name,
            Cmc: curCard.card_obj.cmc,
            //todo: colors (handle array)
            Rarity: curCard.card_obj.rarity,
            Type: curCard.card_obj.type_line,
            ReleaseDate: curCard.card_obj.released_at,
            ScryfallUrl: curCard.card_obj.uri
          }
        ]});
      }

      // below code finds the unique sets in the list
      let uniqueSets = [...new Set(taskList.map(item=>item.set))];
      let setsAdded = 0;
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

        AddDataInBatch(curBatch, CardTableName, (addDataError) => {
          if (addDataError) {
            callback(addDataError);
          } else {
            setsAdded++;
            if (setsAdded === uniqueSets.length) {
              callback(null);
            }
          }          
        });
      }      
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