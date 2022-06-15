const { TableServiceClient, TableClient } = require("@azure/data-tables");
const TableServiceUrl = "https://magicwordle.table.core.windows.net";

// export async function InsertOrMergeEntity(task, tableName, callback) {
//   const tableClient = new TableClient(`${TableServiceUrl}${process.env.REACT_APP_AZURE_STORAGE_TABLE_SAS_TOKEN}`, tableName);
//   let result = await tableClient.upsertEntity(task, "Replace")
//   .catch((error) => {
//     console.log(error);
//     callback(error, null);
//   })
//   callback(null, result);  
// }

export async function ListTables(filter, callback) {
  const tableServiceClient = new TableServiceClient(`${TableServiceUrl}?${process.env.REACT_APP_AZURE_STORAGE_TABLE_SAS_TOKEN}`);
  let matchingTables = [];
  try {
    let queryTableResults = await tableServiceClient.listTables({queryOptions: {filter: filter}});
    for await (const table of queryTableResults) {
      matchingTables.push(table.name);
    }
  }
  catch(error) {
    callback(error, null);
  }
  callback(null, matchingTables);
}

export async function QueryEntities(filter, tableName, callback) {
  const tableClient = new TableClient(`${TableServiceUrl}?${process.env.REACT_APP_AZURE_STORAGE_TABLE_SAS_TOKEN}`, tableName);
  let queryResults = [];
  try {
    let results = await tableClient.listEntities({queryOptions: {filter: filter}});
    for await (const result of results) {
      queryResults.push(result);
    }
  }
  catch (error) {
    callback(error, null);
  }
  callback(null, queryResults);
}

export async function DeleteTable(tableName, callback) {
  const tableClient = new TableClient(`${TableServiceUrl}?${process.env.REACT_APP_AZURE_STORAGE_TABLE_SAS_TOKEN}`, tableName);
  try {
    await tableClient.deleteTable();
  }
  catch(error) {
    console.log(error)
    callback(error);
  }
  callback(null);
}

export async function AddDataInBatch(taskList, tableName, callback) {
  const tableClient = new TableClient(`${TableServiceUrl}?${process.env.REACT_APP_AZURE_STORAGE_TABLE_SAS_TOKEN}`, tableName);
  if (!taskList) {
    callback("AddDataInBatch called with null tasklist!");
  }
  try {
    await tableClient.submitTransaction(taskList);
  }
  catch (error) {
    console.log(error);
    callback(error);
  }
  callback(null);
}

export async function CreateTableIfNotExists(tableName, callback) {
  const tableClient = new TableClient(`${TableServiceUrl}?${process.env.REACT_APP_AZURE_STORAGE_TABLE_SAS_TOKEN}`, tableName);
  while(true) {
    let curError = null;
    try {
      await tableClient.createTable();
    }
    catch(error) {
      curError = error.message;
      if (!curError.includes('TableBeingDeleted')) {  // don't log "expected error"
        console.log(error);
      }
    }
// If you want to avoid the ugly red logs in application insights you can write your own CreateIfNotExists: if (!table.Exists()) { await table.CreateAsync(); } – 
// Crhistian Ramirez
//  May 29, 2020 at 15:42

// idea would be we should call Table.Exists in a loop instead, so we avoid the ugly red logs...

    if (curError == null) {
      break;
    } else if (curError.includes('TableBeingDeleted')) {
      // 409 happens if the table is still being deleted
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    else {
      callback(curError);
    }
  }
  callback(null);
}