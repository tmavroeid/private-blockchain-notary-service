
const {addValidationRequestMempool, getStarAddressData, deleteStarRegistryData, addValidationRequest, getValidationRequest, deleteValidation} = require('./levelSandbox');

const TimeoutRequestsWindowTime = 5*60*1000;
var mempool = new Array();
var timeoutRequests = new Array();
const bitcoinMessage = require('bitcoinjs-message');
//let isValid = bitcoinMessage.verify(message, address, signature);

async function addRequestValidation(walletAddress){
      console.log(timeoutRequests[walletAddress]);


      return getStarAddressData(walletAddress).then(async (data)=>{
        console.log("The address already exists. Not a new request will be made!!")

        let timeElapsed = Date.now() - data.requestTimeStamp;
        let newValidationWindow = (TimeoutRequestsWindowTime - timeElapsed)/1000;
        let str_a = newValidationWindow.toString();
        let resultNewValidationWindow = Number(str_a.slice(0, 3));
        let starStructure = {
          address: walletAddress,
          message: data.message,
          requestTimeStamp: data.requestTimeStamp,
          validationWindow: resultNewValidationWindow
        }
        await deleteStarRegistryData(walletAddress);
        await addValidationRequestMempool(walletAddress, JSON.stringify(starStructure));

        return starStructure;
      }).catch(async (err)=>{
        console.log(err);
        let timestamp = getTimeStamp()
        let message = walletAddress+':'+timestamp+':starRegistry';
        //In the timeoutRequests array, stores a timeout for each request and upon expiration after 5 minutes, it remove the request from the mempool database
        timeoutRequests[walletAddress]=setTimeout(function(){ removeValidationRequest(walletAddress) }, TimeoutRequestsWindowTime );

        let starStructure = {
          address: walletAddress,
          message: message,
          requestTimeStamp: timestamp,
          validationWindow: (TimeoutRequestsWindowTime/1000)
        }

        await addValidationRequestMempool(walletAddress, JSON.stringify(starStructure));
        check = false;
        return starStructure;
      });


}

async function removeValidationRequest(walletAddress){
  return await deleteStarRegistryData(walletAddress);
}


function getTimeStamp() {
    return new Date().getTime();
}


async function validateRequestByWallet(walletAddress, signature){

      return getStarAddressData(walletAddress).then(async (data)=>{
        console.log(data.message);
        let isValid = bitcoinMessage.verify(data.message, walletAddress, signature);
        data["messageSignature:"] = true
        if(isValid){
          let validRequest = {
            registerStar: true,
            status: data
          }
          await removeValidationRequest(walletAddress);
          timeoutRequests.splice(walletAddress,1);
          await addValidationRequest(walletAddress, validRequest)
          console.log(validRequest)
          return validRequest;
        }else{
          return "The signature isn't valid! You can't validate the request!"
        }
      }).catch(async (err)=>{
        console.log(err);
        return "Validation Window Expired!! You cannot proceed with validation of request!!"+err;
      });
}

async function addStarDatatoBlock(structure){
    let walletAddress = structure.address
    return await getValidationRequest(walletAddress).then(async (data)=>{
      console.log(data)
      await deleteValidation(walletAddress); //deletes the validation from the datadabe, so the user has to submit a request again to notarize a new star
      return true;
    }).catch(async (err)=>{
      return false;
    });
}

  module.exports = {
    addRequestValidation: addRequestValidation,
    validateRequestByWallet: validateRequestByWallet,
    addStarDatatoBlock: addStarDatatoBlock

  }
