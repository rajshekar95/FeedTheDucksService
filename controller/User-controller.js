const express = require('express')
const users = express.Router()
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const User = require('../models/User')
users.use(cors())

users.post('/register', (req, res) => {
  const today = new Date()
  const userData = {
    personFullName: req.body.personFullName,
    email: req.body.email,
    password: req.body.password,
    lastUpdatedOn: today,
    role : req.body.role
  }

  User.findOne({
    where: {
      email: req.body.email
    }
    })
    .then(user => {
      if (!user) {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          userData.password = hash
          User.create(userData)
            .then(usr => {
              let token = jwt.sign(usr.dataValues, process.env.SECRET_KEY, {
                expiresIn: 5000
              })
              let userDetails ={};
                userDetails.id = usr.id
               userDetails.personFullName= usr.personFullName
                userDetails.email= usr.email
                userDetails.role= usr.role
                userDetails.lastUpdatedOn= usr.lastUpdatedOn
              
              res.json({ status: 'success', token : token, data :  userDetails});
            })
            .catch(er => {
              res.status(400).json({ error: er })
            })
        })
      } else {
        res.status(400).json({ error: 'user already exists' })
      }
    })
    .catch(err => {
      res.send('error: ' + err)
    })
})
users.post('/login', (req, res) => {
  User.findOne({
    where: {
      email: req.body.email
    }
  })
    .then(user => {
      if (user) {
        if (bcrypt.compareSync(req.body.password, user.password)) {
          let token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
            expiresIn: 5000
          })
          let userDetails ={};
          userDetails.id = user.id
          userDetails.personFullName= user.personFullName
          userDetails.email= user.email
          userDetails.role= user.role
          userDetails.lastUpdatedOn= user.lastUpdatedOn
          res.json({ status: 'success', token : token, data : userDetails });
        }else{
          res.status(400).json({ error: 'Invalid Credientials' })
        }
      } else {
        res.status(400).json({ error: 'User does not exist' })
      }
    })
    .catch(err => {
      res.status(400).json({ error: err })
    })
})

users.get('/profile', (req, res) => {
  var decoded = jwt.verify(req.headers['authorization'], process.env.SECRET_KEY)

  User.findOne({
    where: {
      id: decoded.id
    }
  })
    .then(user => {
      if (user) {
        res.json(user)
      } else {
        res.send('User does not exist')
      }
    })
    .catch(err => {
      res.send('error: ' + err)
    })
})

users.get('/allUsers', (req,res)=>{
   jwt.verify(req.headers['authorization'], process.env.SECRET_KEY, function(error,decoded){
     if(error){
      res.send({status:'error',error:'token expired'});
     }else{
      //let decodedId = decoded.id;
      //console.log(decoded.id);
      User.findAll({
        attributes: ['id','personFullName', 'email', 'role'],
      }).then(userData=>{
        if (userData) {
         let data = new Array();
         
          for(let i=0; i<userData.length; i++){
            if(userData[i].dataValues.email != null){
              let d = {};
            let splitVal = (userData[i].dataValues.email).split("@");
            let partA = userData[i].dataValues.email.substring(0,2);
            let partB = "****@";    
            d.email =  partA+partB+splitVal[1];
            d.personFullName = userData[i].dataValues.personFullName;
            d.role = userData[i].dataValues.role;
            d.id = userData[i].dataValues.id;
            data.push(d);
            }      

          }
          console.log(data);
          res.send({status:'success',data:data});
        } else {
          res.send({status:'error',error:'No data found'});
        }
      }).catch(err=>{
        res.send({status:'error',error:err});
      })
     }
   });  
})

users.patch('/update', (req,res)=>{
  User.update(
    {  role: req.body.role},
    { where: { id : req.body.userId }} 
  ).then(function(affectedRows) {
    console.log(affectedRows);
    res.json({ status: 'success', data: affectedRows });
  }).catch(function(err){
    console.log('Oops! something went wrong, : ', err);
    res.json({ status: 'error', error : err });
  })
})

module.exports = users
