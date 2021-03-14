const express = require('express')
const reports = express.Router()
const cors = require('cors')
const sequelize = require('sequelize')
const jwt = require('jsonwebtoken')
const Feeds = require('../models/Feeds')
const User = require('../models/User')
const Food = require('../models/Foods');

reports.use(cors());

Feeds.hasMany(User, {foreignKey : "id"});
Feeds.hasMany(Food, {foreignKey : "typeId"});

reports.get('/userStats', (req,res)=>{
  jwt.verify(req.headers['authorization'], process.env.SECRET_KEY, function(error,decoded){
    if(error){
      res.json({ status: 'error', error : "token expired" });
    }else{
      let data = {};
    Feeds.findAll({
        where:{
            userId : decoded.id
        },
        attributes: [[sequelize.fn('sum', sequelize.col('quantity')), 'totalQuantity'],
                    [sequelize.fn('sum', sequelize.col('totalNoOfDucks')), 'totalDucks'],
                    [sequelize.fn('count', sequelize.col('userId')), 'totalContribution']]
        }).then(function(resp){
          if(resp[0].dataValues.totalQuantity != null){
            data.totalQuantity = resp[0].dataValues.totalQuantity;
            data.totalDucks = resp[0].dataValues.totalDucks;
            data.totalContribution = resp[0].dataValues.totalContribution;
            Feeds.findOne({
                where:{
                    userId : decoded.id
                },
                attributes: ['time', 'location'],
                order: [ [  'time', 'DESC' ]]
            }).then(function(response){
                data.lastUpdate = response.dataValues.time;
                data.lastLocation = response.dataValues.location;
                res.send({status:'success',data:data});
            }).catch(function(err){
              console.log('Oops! something went wrong, : ', err);
              res.json({ status: 'error', error : err });
            });
        }else{
            res.send({status:'error',error :"No Data Found"});
        }
        
      }).catch(function(err){
        console.log('Oops! something went wrong, : ', err);
        res.json({ status: 'error', error : err });
      });
    }
    
  });
    
})

reports.get('/allLocations', (req,res)=>{
  jwt.verify(req.headers['authorization'], process.env.SECRET_KEY, function(error,decoded){
    if(error){
      res.json({ status: 'error', error : "token expired" });
    }else{
      Feeds.findAll({
        attributes: ['location', 
        [sequelize.fn('count', sequelize.col('location')), 'count']], 
        group: ["feeds.location"]
      }).then(function(resp){
        res.send({status:'success',data:resp});
      }).catch(function(err){
        console.log('Oops! something went wrong, : ', err);
        res.json({ status: 'error', error : err });
      });
    }    
  })    
})

reports.get('/allFoodTypes', (req,res)=>{
  jwt.verify(req.headers['authorization'], process.env.SECRET_KEY, function(error,decoded){
    if(error){
      res.json({ status: 'error', error : "token expired" });
    }else{
      Feeds.findAll({
        attributes: ['foodTypeId', 
        [sequelize.fn('count', sequelize.col('foodTypeId')), 'count']], 
        group: ["feeds.foodTypeId"],
        include: [{
            model: Food,
            required: true,
            on: {
                col1: sequelize.where(sequelize.col("feeds.foodTypeId"), "=", sequelize.col("foods.typeId"))
            },
            attributes: ['name']
           }]
        }).then(function(resp){
        res.send({status:'success',data:resp});
      }).catch(function(err){
        console.log('Oops! something went wrong, : ', err);
        res.json({ status: 'error', error : err });
      });
    }
    
  });
    
})

reports.get('/dayStats', (req,res)=>{
  jwt.verify(req.headers['authorization'], process.env.SECRET_KEY, function(error,decoded){
    if(error){
      res.json({ status: 'error', error : "token expired" });
    }else{
      Feeds.findAll({
        attributes: [
            [sequelize.fn('DATE_FORMAT',  sequelize.col('time'), '%D'), 'createdOn'],
            
            [sequelize.literal(`COUNT(*)`), 'count'],
            'time'
        ],
        group: ['createdOn'],
        }).then(function(resp){
          res.send({status:'success',data:resp});
        }).catch(function(err){
          console.log('Oops! something went wrong, : ', err);
          res.json({ status: 'error', error : err });
        });
    }
    
  });
    
})

reports.get('/quantityStats', (req,res)=>{
  jwt.verify(req.headers['authorization'], process.env.SECRET_KEY, function(error,decoded){
    if(error){
      res.json({ status: 'error', error : "token expired" });
    }else{
      Feeds.findAll({
        attributes: [
        [sequelize.fn('sum', sequelize.col('quantity')), 'totalQuantity']]
      }).then(function(resp){
        res.send({status:'success',data:resp});
      }).catch(function(err){
        console.log('Oops! something went wrong, : ', err);
        res.json({ status: 'error', error : err });
      });
    }    
  })    
});

module.exports =reports ;