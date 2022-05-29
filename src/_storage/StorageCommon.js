const { TableClient } = require("@azure/data-tables");
const CardTableName = "WordleCardList";
const TableServiceUrl = "https://magicwordle.table.core.windows.net";

export function InitStorage(callback) {
  CreateTableIfNotExists(CardTableName, (createError) => {
    if (createError) {
      console.log(createError);
      callback(createError);
    }
    callback(null);
  });
}

export async function InsertOrMergeEntity(task, tableName, callback) {
  const tableClient = new TableClient(`${TableServiceUrl}${process.env.REACT_APP_AZURE_STORAGE_TABLE_SAS_TOKEN}`, tableName);
  let result = await tableClient.upsertEntity(task, "Replace")
  await tableClient.executeBatch()
  .catch((error) => {
    console.log(error);
    callback(error, null);
  })
  callback(null, result);  
}

export async function DeleteTable(tableName, callback) {
  const tableClient = new TableClient(`${TableServiceUrl}${process.env.REACT_APP_AZURE_STORAGE_TABLE_SAS_TOKEN}`, tableName);
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
  const tableClient = new TableClient(`${TableServiceUrl}${process.env.REACT_APP_AZURE_STORAGE_TABLE_SAS_TOKEN}`, tableName);
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
  const tableClient = new TableClient(`${TableServiceUrl}${process.env.REACT_APP_AZURE_STORAGE_TABLE_SAS_TOKEN}`, tableName);
  while(true) {
    let curError = null;
    try {
      await tableClient.createTable();
    }
    catch(error) {
      curError = error.message;
      console.log(error);
    }
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