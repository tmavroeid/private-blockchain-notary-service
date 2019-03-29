/* ===== functions on levelSandbox.js ==============================================================================
|  Include functions or a pointer to levelSandbox.js in order to persist data and interact with database in levelDB|
|  ===============================================================================================================*/
const {db, addLevelDBData, getLevelDBData, addDataToLevelDB, getBlocksCount, getDBdataArray, removeDBs, findHashonChain} = require('./levelSandbox');
//const level = require('./levelSandbox.js');
const Block = require('./Block')
// const level = require('level');
// const chainDB = './chaindata';
// const db = level(chainDB);
/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/
//Define the SHA256 in order to use it for the purpose of validating blocks
const SHA256 = require('crypto-js/sha256');

/* ===== Blockchain Class ===================================================
|  Class with a constructor for new simplified blockchain without consensus 		|
|  =========================================================================*/

class Blockchain{
  constructor(){
		//retrieve the data array from the database
		this.chain = [];
		this.generateGenesisBlock();
  }

	async generateGenesisBlock(){
						let array = await getDBdataArray();

            await removeDBs();

						if (array.length==0){

		                let genesisBlock = new Block("First block in the chain - Genesis block");
		                this.addBlock(genesisBlock);
		         }else{
							 return "The blockchain has already initialized!";
						 }

	}

  // Add new block
  async addBlock(newBlock){
			// Retrieve block height of the blockchain already in the database
			newBlock.height = await this.getBlockHeight();
			// UTC timestamp
	    newBlock.time = new Date().getTime().toString().slice(0,-3);
	    // previous block hash
	    if(this.chain.length>0){
        console.log(this.chain[this.chain.length-1].hash);
	      newBlock.previousBlockHash = this.chain[this.chain.length-1].hash;
	    }
	    // Block hash with SHA256 using newBlock and converting to a string
	    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
		  // Adding block object to chain
		 	this.chain.push(newBlock);
			// Persist block object to database
			return await addLevelDBData(newBlock.height, JSON.stringify(newBlock))

  }

  // Get block height
  async getBlockHeight(){
      //return the height of the blockchain already saved in levelDB
			return await getBlocksCount();

  }

  // get block
  async getBlock(blkHeight){
      // return block object from the database
			let block = await getLevelDBData(blkHeight);
			return JSON.parse(block)
	}
// Get block by height for blocks with stars' structure in the body
async getBlockbyHeight(height){
  // return block object from the database
  let block = await this.getBlock(height);
  return block;
}
async getBlockbyIndex(height){
  // return block object from the database
  let block = await this.getBlock(height);
  if(height!=0){
    block.body.star.storyDecoded = Buffer.from(block.body.star.story, 'hex').toString()
    return block;
  }else{
    return block;
  }

}
// Get block by hash
async getBlockByHash(hash) {
        try {
            // Get block height
              return await findHashonChain(hash).then((response)=>{
                if(response.hash){
                  response.body.star.storyDecoded = Buffer.from(response.body.star.story, 'hex').toString()
                  return response;
                }else{
                  return "This hash doesn't exist in any block!";
                }
            }).catch((err)=>{
              return err;
            });

        } catch (err) {
            console.log(err);
            return err;
        }
}

// Get block by hash
async getBlockByAddress(walletAddress) {
        try {

            let starsBlocks = [];

            // Get block height
            let height = await this.getBlockHeight();
            for (var i = 1; i < height; i++) {
                // Get block
                let block = await this.getBlock(i);
                // Check if hash matches
                if (block.body.address == walletAddress) {
                    // Decode the story
                    block.body.star.storyDecoded = Buffer.from(block.body.star.story, 'hex').toString()
                    // Add the block into the array with other blocks belonging to the same walletAddress
                    starsBlocks.push(block);
                    console.log(starsBlocks)

                }else{
                    return "The wallet does not exist in any block!!"
                }
            }
            console.log(starsBlocks);
            return starsBlocks;


        } catch (err) {
            console.log(err);
            return err;
        }
}
    // validate block
    async validateBlock(blockHeight){
      // retrieve block object
      let block = await this.getBlock(blockHeight);
		  //console.log(block);
      // get block hash
      let blockHash = block.hash;
      // remove block hash to test block integrity
			//console.log(blockHash);

      block.hash = '';
      // generate block hash
      let validBlockHash = SHA256(JSON.stringify(block)).toString();
			//console.log(validBlockHash);
      // Compare block hashes in order to validate the legitimacy of the block
			return new Promise((resolve, reject) => {
				if(this.validBlockHash === this.blockHash) {
					console.log('true')
			 		resolve(true);
	 			} else {
					console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
			 		resolve(false);
	 			}
			});

    }

   // Validate blockchain
  async validateChain(){
    return new Promise((resolve, reject) => {
      let errorLog = [];
			//Create the promises array in order to store the calls to validateBlock()
			let promises = [];

			for (var i = 0; i <= this.chain.length-1; i++) {
					promises.push(this.validateBlock(i));
			}
			//When all promises resolve, then compare block hash links and then again check the errorLog.
			Promise.all(promises).then((results) => {
				if(results.length>0){
						for (var j = 0; j < this.chain.length-1; j++) {

							if(results[j]){
								// compare blocks hash links
								let blockHash = this.chain[j].hash;
				        let previousHash = this.chain[j+1].previousBlockHash;
								// if hashes are different log an error with the block's position.
				        if (blockHash!==previousHash) {
				          errorLog.push('Error in position:'+j);
								}
							}
						}
				}else{
					console.log('Something went wrong!')
				}
			}).then((results)=>{
				// when the camparison of links is fulfilled, then chack the errorLog.
				if (errorLog.length>0) {
					console.log('Block errors = ' + errorLog.length);
					console.log('Blocks: '+errorLog);
					resolve(false);
				} else {
					console.log('No errors detected');
					resolve(true);
				}
			}).catch((err)=>{
				console.log(err);
        resolve(false);
			});

    });


    }

}

module.exports = Blockchain
