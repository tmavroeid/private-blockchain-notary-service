/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);
const fs = require('fs-extra')
const staregistryDB = './staregistry';
const validationDB = './validationregistry'
const mempool = level(staregistryDB);
const validspool = level(validationDB);



//var count = 0;
// Add data to levelDB with key/value pair
function addLevelDBData(key,value){
  let self = this;
  return new Promise(function(resolve, reject) {
       db.put(key, value, function(err) {
          if (err) {
              console.log('Block ' + key + ' submission failed', err);
              reject(err);
          }
          console.log('teomav'+key)
          console.log('Block ' + key + ' submission succeedded with data' + value);
          resolve(value);
      });
  });
}

// Get data from levelDB with key
function getLevelDBData(key){
  let self = this;
  return new Promise((resolve, reject) => {
        db.get(key, function(err, value) {
            if (err) return console.log('Not found!', err);
            resolve(value);
        });
    })
}

// Add data to levelDB with value
function addDataToLevelDB(height,value) {
    let i = 0;
    let self = this;
    return new Promise(function(resolve, reject){
      db.createReadStream()
            .on('data', function(data) {
              i++;
          }).on('error', function(err) {
              return console.log('Unable to read data stream!', err)
              reject(err);
          }).on('close', function() {
            console.log('Block #' + i);
            addLevelDBData(height, value).then((value)=>{
              resolve(value);
            }).catch((err)=>{
              console.log(err);
            });
            //resolve(i);
          });
    })
}

function getBlocksCount() {
  let self = this;
  return new Promise(function(resolve, reject){
        var count=0;
      	db.createReadStream()
                .on('data', function (data) {
                      // Count each object inserted
              		count++;
                  })
                .on('error', function (err) {
                    // reject with error
            			reject(err);
                 })
                .on('close', function () {
                  //resolve with the count value
            			resolve(count);
                });
        });

}

function getDBdataArray(){
  let self = this;
  return new Promise(function(resolve, reject){
        var dataArray=[];
        db.createReadStream()
            .on('data', function (data) {
                dataArray.push(data);
            })
            .on('error', function (err) {
                reject(err)
            })
            .on('close', function () {
                resolve(dataArray);
            });
        });
}

function removeDBs() {
  fs.remove(chainDB, err => {
    console.error(err)
  })
  fs.remove(staregistryDB, err => {
    console.error(err)
  })
  fs.remove(validationDB, err => {
    console.error(err)
  })
}

function findHashonChain(hash){
  let self = this;
  return new Promise(function(resolve, reject) {
        var block = ""
        db.createValueStream()
          .on('data', function (data) {
             let resp  = JSON.parse(data);
             if(resp.hash === hash){  // check if entry matches the hash
                block = resp;
             }
           })
           .on('error', function (err) {
               reject({ type: err });
          }).on('close', function () {
              if(block.hash){
                resolve(block);
              }else{
                resolve("This hash doesn't exist in the blockchain!")
              }
          });
    });
}
/*==Adding Star Data in Database for persistently storing each request==
=======================================================================*/

function addValidationRequestMempool(key,value){
  let self = this;
  return new Promise(function(resolve, reject) {
       mempool.put(key, value, function(err) {
          if (err) {
              console.log('Validation Request Submission Failed for Wallet Address: ' + key + ' with error:', err);
              reject(err);
          }
          console.log('teomavstar'+key)
          console.log('Validation Request Submission Succeedded for Wallet Address:' + key + '  with data:' + value);
          resolve(value);
      });
  });
}
/*==========Getting Star Data from Database for each request===========
=======================================================================*/
function getStarAddressData(key){
  let self = this;
  return new Promise((resolve, reject) => {
        mempool.get(key, function(err, value) {
            if (err){
              reject('Not Found!');
            }else if (value==undefined){
              reject('Undefined Data!');
            }else{
              resolve(JSON.parse(value));
            }
        });
    })
}
/*==========Deleting Star Data from Database based on Wallet Address===
=======================================================================*/
async function deleteStarRegistryData(key) {
    return new Promise(function(resolve, reject) {
        try {
            mempool.del(key);
            resolve('Successful Deletion!');
        } catch (err) {
            console.log('Error: ' + err);
            reject(err);
        }
    });
}
/*==Adding Star Data in Database for persistently storing each request==
=======================================================================*/
function addStarAddressData(key,value){
  let self = this;
  return new Promise(function(resolve, reject) {
       mempool.put(key, value, function(err) {
          if (err) {
              console.log('Validation Request Submission Failed for Wallet Address: ' + key + ' with error:', err);
              reject(err);
          }
          console.log('teomavstar'+key)
          console.log('Validation Request Submission Succeedded for Wallet Address:' + key + '  with data:' + value);
          resolve(value);
      });
  });
}
/*======Adding Validation to Database for persistently storing them=====
=======================================================================*/
function addValidationRequest(key,value){
  let self = this;
  return new Promise(function(resolve, reject) {
       validspool.put(key, value, function(err) {
          if (err) {
              console.log('Validation Submission Failed for Wallet Address: ' + key + ' with error:', err);
              reject(err);
          }
          console.log('teomavstar'+key)
          console.log('Validation Submission Succeedded for Wallet Address:' + key );
          resolve(value);
      });
  });
}
/*==========Getting Validation from Database for each request===========
=======================================================================*/
function getValidationRequest(key){
  let self = this;
  return new Promise((resolve, reject) => {
        validspool.get(key, function(err, value) {
            if (err){
              reject('Not Found!');
            }else if (value==undefined){
              reject('Undefined Data!');
            }else{
              resolve(value);
            }
        });
    })
}
/*==========Deleting Star Data from Database based on Wallet Address===
=======================================================================*/
async function deleteValidation(key) {
    return new Promise(function(resolve, reject) {
        try {
            validspool.del(key);
            resolve('Successful Deletion!');
            console.log('Successful Deletion of validation!');
        } catch (err) {
            console.log('Error: ' + err);
            reject(err);
        }
    });
}
/* ===== Testing ==============================================================|
|  - Self-invoking function to add blocks to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blocks per hour                            |
|     (13.89 hours for 500,000 blocks)                                         |
|    Bitcoin blockchain adds 8640 blocks per day                               |
|     ( new block every 10 minutes )                                           |
|  ===========================================================================*/

//Create a chain with 10 blocks synchronously given that callbacks are utilized.
// (function theLoop (i) {
//   setTimeout(function () {
//     addDataToLevelDB('Testing data');
//     if (--i) theLoop(i);
//   }, 100);
// })(10);

//Create a chain with 10 blocks asynchronously given that promises are utilized for persistance.
// let blockchain = new Blockchain()
// (function theLoop (i) {
// 	setTimeout(function () {
// 		let blockTest = new Block("Test Block - " + (i + 1));
// 		blockchain.addBlock(blockTest).then((result) => {
// 			console.log(result);
// 			i++;
// 			if (i < 10) theLoop(i);
// 		});
// 	}, 10000);
// })(0);


module.exports = {
	db: db,
	addLevelDBData: addLevelDBData,
	getLevelDBData: getLevelDBData,
	getBlocksCount: getBlocksCount,
	getDBdataArray: getDBdataArray,
	addDataToLevelDB: addDataToLevelDB,
	removeDBs: removeDBs,
  addValidationRequestMempool: addValidationRequestMempool,
  getStarAddressData: getStarAddressData,
  deleteStarRegistryData: deleteStarRegistryData,
  addValidationRequest: addValidationRequest,
  getValidationRequest: getValidationRequest,
  deleteValidation: deleteValidation,
  findHashonChain: findHashonChain
}
