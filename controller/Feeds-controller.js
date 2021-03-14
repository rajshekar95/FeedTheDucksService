const express = require('express')
const feeds = express.Router()
const cors = require('cors')
const sequelize = require('sequelize')
const jwt = require('jsonwebtoken')
const Feeds = require('../models/Feeds')
const User = require('../models/User')
const Food = require('../models/Foods');
const Scheduler = require('../models/Scheduler');

feeds.use(cors());

Feeds.hasMany(User, {foreignKey : "id"});
Feeds.hasMany(Food, {foreignKey : "typeId"});

feeds.get('/userFeeds', (req, res)=>{
  jwt.verify(req.headers['authorization'], process.env.SECRET_KEY, function(error,decoded){
    if(error){
      res.json({ status: 'error', error : "token expired" });
    }else{
      Feeds.findAll({
        where : {
            UserId : decoded.id
        },
        include: [{
            model: Food,
            required: true,
            on: {
                col1: sequelize.where(sequelize.col("feeds.foodTypeId"), "=", sequelize.col("foods.typeId"))
            }
           }]
      }).then(function(userFeed){
        res.send({status:'success',data:userFeed});
      }).catch(function(err){
        console.log('Oops! something went wrong, : ', err);
        res.json({ status: 'error', error : err });
      });
    }
    
  });
    
})

feeds.post('/addNewFeed', (req  ,res) =>{
  jwt.verify(req.headers['authorization'], process.env.SECRET_KEY, function(error,decoded){
    if(error){
      res.json({ status: 'error', error : "token expired" });
    }else{
      const today = new Date()
      console.log(req.body);
      const feedData = {
        location: req.body.location,
        foodTypeId: req.body.foodTypeId,
        time: today,
        totalNoOfDucks: req.body.totalNoOfDucks,
        userId : req.body.userId,
        quantity : req.body.quantity,
        isScheduled : req.body.scheduler
      };
      Feeds.create(feedData)
        .then(newlyAddedData => {  
          if(req.body.scheduler == true){
            Scheduler.create(feedData).then(scheduledData =>{
              res.json({ status: 'success',  data :  newlyAddedData});
            }).catch(err=>{
              console.log(err);
              res.json({ status: 'success',  data :  newlyAddedData});
            })
            
          }else{
            res.json({ status: 'success',  data :  newlyAddedData});
          }  
        
      })
      .catch(er => {
        res.json({status : 'error', error : er});
      })
    }
    
  });
})

feeds.get('/allFeeds', (req,res)=>{
  jwt.verify(req.headers['authorization'], process.env.SECRET_KEY, function(error,decoded){
    if(error){
      res.json({ status: 'error', error : "token expired" });
    }else{
      Feeds.findAll({
        include: [{
            model: Food,
            required: true,
            on: {
                col1: sequelize.where(sequelize.col("feeds.foodTypeId"), "=", sequelize.col("foods.typeId"))
            }
           },{
            model: User,
            required: true,
            on: {
                col1: sequelize.where(sequelize.col("users.id"), "=", sequelize.col("feeds.userId"))
            },
            attributes: ['personFullName', 'email']
        }],
        order: [
            ['time', 'DESC']
        ]
      }).then(function(feedsData){
        res.send({status:'success',data:feedsData});
      }).catch(function(err){
        console.log('Oops! something went wrong, : ', err);
        res.json({ status: 'error', error : err });
      });
    }
    
  });    
})

module.exports =feeds ;