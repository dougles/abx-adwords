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
const clientCustomerId = '598-622-8052'; // fo account
const userAgent = 'autoboxing';
let refresh_token = '1/Df8RlNyr2zPRf3wbEE4mOIuF6c_Yy5mbD15LryUbc_Q';
let access_token = 'ya29.GlvvBW40Br52qeVTrZYwpV275fiuQUoiBDbb8IXF-cpUqkFLYYcAoAVPqoRA9tFwZbumR86MaZHLy4Dw9KJ9jYba_reizx_85LLoTAOpCmGD0JENJOETXSZM4NgW';

let user;
let auth = new AdwordsAuth({
  client_id, //this is the api console client_id
  client_secret
}, callback);

router.get('/', function (req, res, next) {
  res.redirect(auth.generateAuthenticationUrl());
});

router.get('/callback',async function (req, res, next) {
  let result = await auth.getAccessTokenFromAuthorizationCode(req.query.code, (error, tokens) => {
    if (error) {
      console.error(error);
    } else {
      refresh_token = tokens.refresh_token;
      console.log(tokens);
    }
    res.send('DONE');
  });
});

router.get('/results', async function (req, res, next) {

  let localUser = new AdwordsUser({
    developerToken,
    userAgent,
    clientCustomerId,
    client_id,
    client_secret,
    refresh_token,
  });

  let campaignService = localUser.getService('CampaignService', 'v201710');

  let params = {
    query: 'SELECT Id, Name, Amount, Status, FrequencyCapMaxImpressions, TargetContentNetwork, StartDate, EndDate ORDER BY Name DESC LIMIT 0,50'
  };

  campaignService.query(params, (error, result) => {
    if(error)
      console.log(error);
    else
      console.log(JSON.stringify(result));
    res.status(200).json(result);
  })
});


router.get('/getcustomers', async function (req, res, next) {

  console.log(refresh_token);

  let localUser = new AdwordsUser({
    developerToken,
    userAgent,
//    clientCustomerId,
    client_id,
    client_secret,
    refresh_token
  });

  let customerService =  localUser.getService('CustomerService','v201806');

  let customerSelector = {};

  await customerService.getCustomers({serviceSelector: customerSelector},(error,result) =>{
    res.send(result);
  });

});

router.get('/getmanager', async (req, res, next) => {

  let localUser = new AdwordsUser({
    developerToken,
    userAgent,
    clientCustomerId,
    client_id,
    client_secret,
    refresh_token
  });

  let customService = localUser.getService('ManagedCustomerService');

  //create selector
  let selector = {
    fields: ['Name', 'CustomerId'],
    ordering: [{field: 'Name', sortOrder: 'ASCENDING'}],
    paging: {startIndex: 0, numberResults: AdwordsConstants.RECOMMENDED_PAGE_SIZE}
  };
  customService.get({serviceSelector: selector}, (error, result) => {
    if (error) {
      console.error(error);
    } else {
      console.log(result);
    }
    res.send(result);
  });
});

router.get('/getcampaigns/:customerId', function (req, res) {

  let customerId = req.params.customerId;

  let localUser = new AdwordsUser({
    developerToken,
    userAgent,
    clientCustomerId:customerId,
    client_id,
    client_secret,
    refresh_token
  });

  let campaignService = localUser.getService('CampaignService', 'v201710');

  let params = {
    query: 'SELECT Id, Name, Amount, Status, FrequencyCapMaxImpressions, TargetContentNetwork, StartDate, EndDate ORDER BY Name DESC LIMIT 0,50'
  };

  campaignService.query(params, (error, result) => {
    if(error)
      console.error(error);
    else
      console.log(result);
    res.status(200).json(result);
  });
});

router.get('/about', function (req, res, next) {
      res.status(200).json('done');
});

module.exports = router;
