var express = require('express')
var cors = require('cors')
var bodyParser = require('body-parser')
var CronJob = require('cron').CronJob;

var app = express()
var port = process.env.PORT || 80
process.env.SECRET_KEY = 'freshworks';

app.use(bodyParser.json())
app.use(cors())
app.use(
  bodyParser.urlencoded({
    extended: false
  })
)

const Scheduler = require('./models/Scheduler')
const FeedsModel = require ('./models/Feeds')
var Users = require('./controller/User-controller');
var Foods = require('./controller/Food-controller');
var Feeds = require('./controller/Feeds-controller');
var Reports = require('./controller/Reports-controller');

var job = new CronJob('00 10 * * * ', function() {
  console.log("Job");
  Scheduler.findAll().then((response)=>{
    let today = new Date();
    for(let i=0; i<response.length; i++){
      let feedData = {
        location : response[i].dataValues.location,
        foodTypeId: response[i].dataValues.foodTypeId,
        quantity: response[i].dataValues.quantity,
        time: today,
        totalNoOfDucks: response[i].dataValues.totalNoOfDucks,
        userId: response[i].dataValues.userId
      };
      console.log(feedData);
      FeedsModel.create(feedData)
        .then(newlyAddedData => {          
        console.log("success");
      })
      .catch(er => { 
        console.log(er);
      })
    }
  }).catch(err =>{
    console.log(err);
  })
}, null, true, 'America/Los_Angeles');
job.start();

app.use('/users', Users)
app.use('/foods', Foods)
app.use('/feeds', Feeds)
app.use('/reports', Reports)

app.listen(port, function() {
  console.log('Server is running on port: ' + port)
})
