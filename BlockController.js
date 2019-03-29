const SHA256 = require('crypto-js/sha256');
const Blockchain = require('./Blockchain');
const Block = require('./Block');
const blockchain = new Blockchain();
const {addRequestValidation, validateRequestByWallet, addStarDatatoBlock} = require('./starRequestValidation');
const {findBlockbyHash} = require('./levelSandbox')

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} app
     */
    constructor(app) {
        this.app = app;
        //this.initializeMockData();
        this.blockchain = blockchain;
        this.addRequestValidation = addRequestValidation;
        this.validateRequestByWallet = validateRequestByWallet;
        this.addStarDatatoBlock = addStarDatatoBlock;
        //this.findBlockbyHash = findBlockbyHash;
        this.getBlockByIndex();
        this.postNewBlockwithStar();
        this.postRequest();
        this.validateRequest();
        this.getBlockbyHash();
        this.getBlockbyWalletAddress();
        this.validateChain();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
     */
     getBlockByIndex() {
        this.app.get("/block/:index", async (req, res) => {
          try{
            let blockheight = req.params.index;

            const block = await this.blockchain.getBlockbyIndex(blockheight);
            //console.log(block)
            res.status(200).send(block)
          }catch(err){
            console.log(err);
            res.status(400).send(err);
          }

        });
      }

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

    validateRequest() {
      this.app.post("/message-signature/validate", async (req, res) => {
        try{
          let validation = await this.validateRequestByWallet(req.body.address, req.body.signature);
          res.status(200).send(validation);
        }catch(err){
          res.status(400).send(err);
        }
      });
    }


    /**
     * Implement a POST Endpoint to add a new Block with stars' coordinates, url: "/api/block"
     */
    postNewBlockwithStar() {
        this.app.post("/block", async (req, res) => {
          try{
            let right_ascension = req.body.ra
            let declination = req.body.dec
            let walletAddress = req.body.address
            let starStory = req.body.story
            console.log(right_ascension)
            console.log(declination)
            console.log(walletAddress)
            console.log(starStory)

            if (right_ascension!="" & declination!="" & walletAddress!="" & starStory!=""){
              let structure = {
                address: walletAddress,
                star: {
                  dec: declination,
                  ra: right_ascension,
                  story: new Buffer(starStory).toString('hex')
                }
              }
              if(structure){
                let response = await addStarDatatoBlock(structure)
                if(response){//if true then adds the star to a new block in the chain
                  let block = await this.blockchain.addBlock(new Block(structure));
                  res.status(200).send(JSON.parse(block));
                }else{//
                  res.status(400).send("The block couldn't be added in the blockchain due to absense of validation!!");
                }
            }else{
              res.status(400).send("POST Request without certain parameters! You should put dec, ra and story parameters!");
            }
            }else{
              res.status(400).send("POST Request without data on the body!");
            }
          }catch(err){
            console.log(err);
          }
        });
    }

    getBlockbyHash(){
      this.app.get("/stars/hash:hashValue", async (req, res) => {
        let hash = (req.params.hashValue).toString().slice(1);
        try{
          let block = await this.blockchain.getBlockByHash(hash);
          res.status(200).send(block);
        }catch(err){
          res.status(400).send("Error feching the block!!");
        }

      });
    }

    getBlockbyWalletAddress(){
      this.app.get("/stars/address:walletAddress", async (req, res) => {
        let walletAddress = (req.params.walletAddress).toString().slice(1);
        await this.blockchain.getBlockByAddress(walletAddress).then((blockArray)=>{
          res.status(200).send(blockArray);
        }).catch((err)=>{
          res.status(400).send("There are not any blocks in the chain for this walletAddress!!");
        });

      });
    }

    validateChain(){
      this.app.post("/blockchain/validate", async (req, res) => {
          await this.blockchain.validateChain().then((errors)=>{
              console.log(errors+"hello");
              if(errors){
                res.status(200).send("The blockchain is valid!");
              }else{
                res.status(400).send("The blockchain is invalid!")
              }
          }).catch((err)=>{
              res.status(400).send("Error in the process of validating the chain!:(");
          });
      });

    }
    /**
     * Help method to inizialized Mock dataset, adds 10 test blocks to the blocks array
     */
    // initializeMockData() {
    //     if(this.blocks.length === 0){
    //         for (let index = 0; index < 10; index++) {
    //             let blockAux = new BlockClass.Block(`Test Data #${index}`);
    //             blockAux.height = index;
    //             blockAux.hash = SHA256(JSON.stringify(blockAux)).toString();
    //             this.blocks.push(blockAux);
    //             console.log(index)
    //         }
    //     }
    // }
    // theLoop (i=0) {
    // 	setTimeout(function () {
    // 		let blockTest = new Block("Test Block - " + (i + 1));
    // 		blockchain.addBlock(blockTest).then((result) => {
    // 			console.log(result);
    // 			i++;
    // 			if (i < 10) theLoop(i);
    // 		});
    // 	}, 10000);
    // }

}

/**
 * Exporting the BlockController class
 * @param {*} app
 */
module.exports = (app) => { return new BlockController(app);}
