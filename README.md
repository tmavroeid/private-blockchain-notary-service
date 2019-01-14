# Private Blockchain Notary Service

Blockchain has the potential to change the way that the world approaches data. Inside this project exists a simplified private blockchain where a consensus isn't existent and the blocks have a pretty basic structure.

In this project a RESTful web API with the Node.js Framework, _Express.js_, is deployed in order to interact with the simplified private blockchain and store information about stars such as their _right ascension_, _declination_ and _story_. The process of storing and retrieving information, to and by the blockchain about the stars is succeedded by requesting the capability to post a star and validating the message of the response.

##### Basic endpoints consisting the web API in NODE.js are separated in the following categories:
___*Blockchain ID validation routine___
- _POST_ endpoint to validate request with JSON response,
- _POST_ endpoint to validate message signature with JSON response.

___*Star registration Endpoint___
- _POST_ endpoint to submit the Star information to be saved in the Blockchain.

___*Star Lookup in the Blockchain___
- _GET_ endpoint to get Star block by hash with JSON response.
- _GET_ endpoint to get Star block by wallet address (blockchain identity) with JSON response.
- _GET_ endpoint to get star block by star block height with JSON response.


##### Basic operations performed in the blockchain:

- adding blocks,
- validating blocks,
- validating the blockchain,
- but also persisting the blockchain in a levelDB database.

The allowed operations to be performed on top of the blockchain through the API are enabled with the above, _GET_ and _POST_, endpoints.


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

In this project, the blocks generated throughout the lifecycle of the blockchain are stored in a database and they are retrieved by the blockchain using javascript __Promises__. The functions, *addLevelDBData*, *getLevelDBData*, *addDataToLevelDB*, *getBlocksCount*, *getDBdataArray*, *removeDB* implemented inside the __levelSandbox.js__ file, are utilised for the purpose of interacting with the database and achieve persistence. These functions are exported with respect to be used by the functions residing in __Blockchain.js__. In __Blockchain.js__, the Blockchain constructor is deployed as well as the necessary functions to create the blockchain. The __Block.js__ file provides the Blocks' constructor; therefore, in this file the blocks' structure is defined. The __app.js__ file holds the structure of the web API and makes it available. The controller __BlockController.js__ contains the endpoints creating and retrieving blocks in the blockchain (by using the wallet address, the hash and the block height), but also posting requests and validations for the star registration process to take place. In the __starRequestValidation.js__ file, the logic about posting requests and validations on account of storing a star, is implemented.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].
Having NPM installed, several dependencies should be installed as described in the next section.

### Configuring your project

- Use NPM to initialize your project and install system specific software dependencies enclosed to package.json. Dependencies of this project are, crypto-js, level, fs-extra, express, body-parser, etc.
```
npm install
```


### Key points in code
The user posts requests and then has to submit a validation in order to notarize stars in the blockchain. As soon as, the user posts a requests, then the request is saved in a mempool database and a timeout is created in the ___timeoutRequests___ array. If the requests' timeout are expired without getting a validation in the period of 5 minutes, then the requests are removed automatically from the mempool. In case that the user submits his/her validation in this window of time, then he can submit a star in the notary service and therefore add it in a block.

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
## Usage

To test code follow the steps:

1: Open a command prompt or shell terminal after installing node.js and the dependencies.

2: As defined in the code of __app.js__, the API will be deployed at port 8000.
```
initExpress() {
	this.app.set("port", 8000);
}
```
3: Enter the following command in order to instantiate the blockchain and deploy the web API.
```
node app.js
```



## Testing

Having deployed the web API, it's time to test the function of the endpoints. For the purpose of testing them it can be used either __POSTman__ or __Curl__.

#### - POSTman

1. Firstly, you should post a request by invoking the following _URL_ with the body of the request should be chosen to be *application/x-www-form-urlencoded*. The key/value pair would be ___address___ and the value of the user's wallet address, respectively:
```
http://localhost:8000/requestValidation
```
2. Then, the user should copy and paste from the JSON response the message and sign it in his/her wallet with his/her wallet address.
By invoking the following _URL_ and passing a Request with type of the body being *application/x-www-form-urlencoded*.  Into the body of the request two key/value pairs. The first one should be ___address___ with the value being the user's wallet address, and the second pair being the ___signature___ with the value being the signature extracted by the wallet address. A snippet indicating the two key/value pairs is the following: and right after it there is the _URL_ to invoke in order to validate the initial request.

```
{
	"address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
	"signature":"H8K4+1MvyJo9tcr2YN2KejwvX1oqneyCH+fsUL1z1WBdWmswB9bijeFfOfMqK68kQ5RO6ZxhomoXQG3fkLaBl+Q="
}

```

```
http://localhost:8000/message-signature/validate
```
3. Next, having validated the message, we can create a block in the chain with the information of the star that we want, by invoking the following _URL_ and passing to the body of the request the star's coordinates.
```
http://localhost:8000/block
```
In order to pass the coordinates, we should choose a request with type of the body being *application/x-www-form-urlencoded*. The key/value pairs, should be four. The ___address___, ___dec___, ___ra___ and ___story___.

4. Finally, we can get the block in the chain with the star information by invoking the foolowing _URL_ and searching it by its hash.
```
http://localhost:8000/stars/hash:[HASH]
```
The response would be in JSON format and look like the following:

```

  "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
  "height": 1,
  "body": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "star": {
      "ra": "16h 29m 1.0s",
      "dec": "-26° 29' 24.9",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
      "storyDecoded": "Found star using https://www.google.com/sky/"
    }
  },
  "time": "1532296234",
  "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
}

```
5. We can also search all the blocks posted by the same user. IN this case we will search the blockchain for a certain walletAddress, by invoking the following _URL_:
```
http://localhost:8000/stars/address:[ADDRESS]
```
The response would be in JSON format and look like the following:

```
[
  {
    "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
    "height": 1,
    "body": {
      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
      "star": {
        "ra": "16h 29m 1.0s",
        "dec": "-26° 29' 24.9",
        "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
        "storyDecoded": "Found star using https://www.google.com/sky/"
      }
    },
    "time": "1532296234",
    "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
  },
  {
    "hash": "6ef99fc533b9725bf194c18bdf79065d64a971fa41b25f098ff4dff29ee531d0",
    "height": 2,
    "body": {
      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
      "star": {
        "ra": "17h 22m 13.1s",
        "dec": "-27° 14' 8.2",
        "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
        "storyDecoded": "Found star using https://www.google.com/sky/"
      }
    },
    "time": "1532330848",
    "previousBlockHash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f"
  }
]
```
6. The block can be retrieve by its block height in the following _URL_:
```
http://localhost:8000/block/[HEIGHT]
```
The response would be in JSON format and look like the following:
```
{
  "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
  "height": 1,
  "body": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "star": {
      "ra": "16h 29m 1.0s",
      "dec": "-26° 29' 24.9",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
      "storyDecoded": "Found star using https://www.google.com/sky/"
    }
  },
  "time": "1532296234",
  "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
}
```
