# Private Blockchain Notary Service

Blockchain has the potential to change the way that the world approaches data. Inside this project exists a simplified private blockchain where a consensus isn't existent and the blocks have a pretty basic structure.

In this project a RESTful web API with the Node.js Framework, _Express.js_, is deployed in order to interact with the simplified private blockchain and store information about stars such as their _right ascension_, _declination_ and _story_. The process of storing and retrieving information, to and by the blockchain about the stars is succeedded by requesting the capability to post a star and validating the message of the response.

### Getting Started:

- adding blocks,
- validating blocks,
- validating the blockchain,
- but also persisting the blockchain in a levelDB database.

The allowed operations to be performed on top of the blockchain through the API are enabled with the above, _GET_ and _POST_, endpoints.

#### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].
Having NPM installed, several dependencies should be installed as described in the next section.

#### Installing

- Use NPM to initialize your project and install system specific software dependencies enclosed to package.json. Dependencies of this project are, crypto-js, level, fs-extra, express, body-parser, etc.
```
npm install
```
- Except from the npm dependencies, you should also download a wallet in order to sign messages as this is mandatory in order to save a Star in a block.


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



## Running the tests

Having deployed the web API, it's time to test the function of the endpoints. For the purpose of testing them it can be used either __POSTman__ or __Curl__.

#### - POSTman

1. Firstly, open the Electrum wallet and go to the tab ___receive___, in order to get the wallet address. Optionally, you can go to tab ___View___ __->__ ___Show Addresses___.

2. Secondly, you should post a request by invoking the following _URL_ with the body of the request should be chosen to be *application/x-www-form-urlencoded*. The key/value pair would be ___address___ and the value of the user's wallet address, respectively:
```
http://localhost:8000/requestValidation
```
3. Then, the user should copy and paste from the JSON response the message and sign it in his/her wallet with his/her wallet address.
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
4. Next, having validated the message, we can create a block in the chain with the information of the star that we want, by invoking the following _endpoint_ and passing to the body of the request the star's coordinates.
```
http://localhost:8000/block
```
In order to pass the coordinates, we should choose a request with type of the body being *application/x-www-form-urlencoded*. The key/value pairs, should be four. The ___address___, ___dec___, __ra__ and ___story___.

5. Finally, we can get the block in the chain with the star information by invoking the foolowing _endpoint_ and searching it by its hash.
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
6. We can also search all the blocks posted by the same user. IN this case we will search the blockchain for a certain walletAddress, by invoking the following _endpoint_:
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
7. The block can be retrieve by its block height in the following _endpoint_:
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
8. At any time you can validate the chain by invoking the following _endpoint_:
```
http://localhost:8000/blockchain/validate

```
