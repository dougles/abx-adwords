var express = require('express');
const AdwordsAuth = require('node-adwords').AdwordsAuth;
const AdwordsConstants = require('node-adwords').AdwordsConstants;
var AdwordsUser = require('node-adwords').AdwordsUser;
var router = express.Router();

/* GET home page. */
const client_id = '758123557094-2iaa3ijv89evlnlj7l4ivduga5ne6lvs.apps.googleusercontent.com';
const client_secret = '05QDgF9ttxAdKfkRwiUVXGGR';
const callback = 'http://localhost:3000/google/callback';

const developerToken = 'kNn4900tmbpHsnUem10Htg';
const clientCustomerId = '598-622-8052';
const userAgent = 'autoboxing';
let refresh_token = '1/24ZIPKkqgn5IaeoCOzqsI05rrZyfJHfg7v9RAtYXmFlrM5Jr0Ggvw4kE3EjlzUlB';
let user;

let auth = new AdwordsAuth({
  client_id, //this is the api console client_id
  client_secret
}, callback);

router.get('/', function (req, res, next) {
  res.send(auth.generateAuthenticationUrl());
});

router.get('/callback',async function (req, res, next) {
  let result = await auth.getAccessTokenFromAuthorizationCode(req.query.code, (error, tokens) => {
    refresh_token = tokens.refresh_token;
    user = new AdwordsUser({
      developerToken,
//     userAgent,
//     clientCustomerId,
      client_id,
      client_secret,
      refresh_token,
    });

    console.log(tokens);

    res.send(req);
  });

  console.log(req);
});

router.get('/results', async function (req, res, next) {

  let localUser = new AdwordsUser({
    developerToken,
//      userAgent,
    clientCustomerId,
    client_id,
    client_secret,
    refresh_token,
  });

  let campaignService = localUser.getService('CampaignService', 'v201710');
//create selector
  let selector = {
    fields: ['Id', 'Name'],
    ordering: [{field: 'Name', sortOrder: 'ASCENDING'}],
    paging: {startIndex: 0, numberResults: AdwordsConstants.RECOMMENDED_PAGE_SIZE}
  };

  let params = {
    query: 'SELECT Id, Name, Amount, Status, FrequencyCapMaxImpressions, TargetContentNetwork, StartDate, EndDate ORDER BY Name DESC LIMIT 0,50'
  };

  let result = await campaignService.query(params, (error, result) => {
    if(error)
      console.log(error);
    else
      console.log(JSON.stringify(result));
    res.status(200).json(result);
  });

});


router.get('/getcustomers', async function (req, res, next) {

  let localUser = new AdwordsUser({
    developerToken,
    userAgent,
//    clientCustomerId,
    client_id,
    client_secret,
    refresh_token,
  });


  let customerService =  localUser.getService('CustomerService','v201806');

  //create selector
  let selector = {
    fields: ['Name', 'CustomerId'],
    ordering: [{field: 'Name', sortOrder: 'ASCENDING'}],
    paging: {startIndex: 0, numberResults: AdwordsConstants.RECOMMENDED_PAGE_SIZE}
  };

  let params = {
    query: 'SELECT *'
  };

  let result = await customerService.getCustomers();
  res.send(result);

});


router.get('/about', function (req, res, next) {
      res.status(200).json('done');
});

module.exports = router;
