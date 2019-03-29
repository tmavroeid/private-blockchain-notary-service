### __Basic endpoints consisting the web API in NODE.js__ are separated in the following categories:
___*Blockchain ID validation routine___
- _POST_ endpoint to validate request with JSON response,
- _POST_ endpoint to validate message signature with JSON response.

___*Star registration Endpoint___
- _POST_ endpoint to submit the Star information to be saved in the Blockchain.

___*Star Lookup in the Blockchain___
- _GET_ endpoint to get Star block by hash with JSON response.
- _GET_ endpoint to get Star block by wallet address (blockchain identity) with JSON response.
- _GET_ endpoint to get star block by star block height with JSON response.

### __Development Functions__

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

In this project, the blocks generated throughout the lifecycle of the blockchain are stored in a database and they are retrieved by the blockchain using javascript __Promises__. The functions, *addLevelDBData*, *getLevelDBData*, *addDataToLevelDB*, *getBlocksCount*, *getDBdataArray*, *removeDB* implemented inside the __levelSandbox.js__ file, are utilised for the purpose of interacting with the database and achieve persistence. These functions are exported with respect to be used by the functions residing in __Blockchain.js__. In __Blockchain.js__, the Blockchain constructor is deployed as well as the necessary functions to create the blockchain. The __Block.js__ file provides the Blocks' constructor; therefore, in this file the blocks' structure is defined. The __app.js__ file holds the structure of the web API and makes it available. The controller __BlockController.js__ contains the endpoints creating and retrieving blocks in the blockchain (by using the wallet address, the hash and the block height), but also posting requests and validations for the star registration process to take place. In the __starRequestValidation.js__ file, the logic about posting requests and validations on account of storing a star, is implemented.

### __Key points in code__
The user posts requests and then has to submit a validation in order to notarize stars in the blockchain. As soon as, the user posts a requests, then the request is saved in a mempool database and a timeout is created in the ___timeoutRequests___ array. If the requests' timeout are expired without getting a validation in the period of 5 minutes, then the requests are removed automatically from the mempool. In case that the user submits his/her validation in this window of time, then he can submit a star in the notary service and therefore add it in a block in the chain.

The __BlockController.js__ holds the following code in order to deploy the _GET_ and _POST_ endpoints:

__*POST* Endpoint to validate request with JSON response:__ In this endpoint, the _addRequestValidation()_ function inside the __starRequestValidation.js__ file is called in order to add a new request in a temporary array which is destined to expire after a 5 minutes period of time in case that the user that submitted the request, doesn't validate it. The response, is a JSON with a specific message which needs to be signed by the user and submmited to the next _POST_ endpoint for the validation to take place.
```
postRequest() {
	this.app.post("/requestValidation", async (req, res) => {
		try{
			let star = await this.addRequestValidation(req.body.address);
			res.status(200).send(star);

		}catch(err){
			console.log(err);
			res.status(400).send(err);
		}
	});
}
```
__*POST* Endpoint endpoint to validate message signature with JSON response:__ In this endpoint, the _validateRequestByWallet()_ function inside the __starRequestValidation.js__ file is called in order to identify whether the signature which is passed by the user is validated against the signature which is created for this specific user with his/her request. In case that the signature is validated, then the validation is added in a leveldb database, enabling to this user the creation of blocks with his/her stars.  
```
validateRequest() {
	this.app.post("/message-signature/validate", async (req, res) => {
		let validation = await this.validateRequestByWallet(req.body.address, req.body.signature);
		res.status(200).send(validation);
	});
}
```
__*POST* Endpoint to submit the Star information to be saved in the Blockchain:__ In this endpoint, the _addStarDatatoBlock()_ function inside the __starRequestValidation.js__ file is called in order to create a block in the chain with the user's star coordinates. The response, is the structure of the block added to the chain with the star.
```
postNewBlockwithStar() {
		this.app.post("/block", async (req, res) => {
			try{
				// Add your code here

				let structure = {
					address: req.body.address,
					star: {
						dec: req.body.dec,
						ra: req.body.ra,
						story: new Buffer(req.body.story).toString('hex')
					}
				}
				console.log(new Buffer(req.body.story).toString('hex'));
				if(structure){
					let response = await addStarDatatoBlock(structure)
					if(response){
						let block = await this.blockchain.addBlock(new Block(structure));
						res.status(200).send(JSON.parse(block));
					}else{
						res.status(400).send("The block couldn't be added in the blockchain due to absense of validation!!");
					}
				}else{
					res.status(400).send("POST Request without data on the body!");
				}
			}catch(err){
				console.log(err);

			}
		});
}
```
__*GET* Endpoint to get Star block by hash with JSON response:__ In this endpoint, the _getBlockByHash()_ function inside the __Blockchain.js__ file is called in order to get a block by using its hash.
```
getBlockbyHash(){
	this.app.post("/stars/hash:hashValue", async (req, res) => {
		let hash = (req.params.hashValue).toString().slice(1);
		await this.blockchain.getBlockByHash(hash).then((block)=>{
			res.status(200).send(block);
		}).catch((err)=>{
			res.status(400).send("Error feching the block!!");
		});

	});
}
```
__*GET* Endpoint to get Star block by wallet address (blockchain identity) with JSON response:__ In this endpoint, the _getBlockByHash()_ function inside the __Blockchain.js__ file is called in order to get a block by using its hash.
```
getBlockbyWalletAddress(){
	this.app.post("/stars/address:walletAddress", async (req, res) => {
		let walletAddress = (req.params.walletAddress).toString().slice(1);
		await this.blockchain.getBlockByAddress(walletAddress).then((blockArray)=>{
			res.status(200).send(blockArray);
		}).catch((err)=>{
			res.status(400).send("There are not any blocks in the chain for this walletAddress!!");
		});

	});
}
```
__*GET* Endpoint get star block by star block height with JSON response:__ In this endpoint, the _index_ parameter is the number of block in the chain. Therefore, the _getBlock()_ function inside the __Blockchain.js__ file is called in order to retrieve the demanded block by the user.
```
getBlockByIndex() {
	 this.app.get("/block/:index", async (req, res) => {
		 try{
			 let blockheight = req.params.index;

			 let block = await this.blockchain.getBlockbyHeight(blockheight);
			 //console.log(block)
			 res.status(200).send(block)
		 }catch(err){
			 console.log(err);
			 res.status(400).send(err);
		 }

	 });
 }
```
