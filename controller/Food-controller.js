const express = require('express')
const foods = express.Router()
const cors = require('cors')
const jwt = require('jsonwebtoken')
const Food = require('../models/Foods');

foods.use(cors())

foods.post('/addType', (req, res) => {
    jwt.verify(req.headers['authorization'], process.env.SECRET_KEY, function(error,decoded){
        if(error){
          res.json({ status: 'error', error : "token expired" });
        }
        const foodData = {
            name: req.body.name,
            kind: req.body.kind
        };
        
        Food.create(foodData)
            .then(newlyAddedFoodData => {
                res.json({ status: 'success' , data : newlyAddedFoodData});
            })
            .catch(er => {
                res.json({status : 'error', error : er});
            });
    });  
});

foods.get('/allFoodTypes', (req, res)=>{
    jwt.verify(req.headers['authorization'], process.env.SECRET_KEY, function(error,decoded){
        if(error){
          res.json({ status: 'error', error : "token expired" });
        }else{
            Food.findAll().then(function(foodTypesData){
                res.send({status:'success',data:foodTypesData});
            }).catch(function(err){
                console.log('Oops! something went wrong, : ', err);
                res.json({ status: 'error', error : err });
            });
        }
        
    });
   
});

foods.patch('/update', (req,res)=>{
    jwt.verify(req.headers['authorization'], process.env.SECRET_KEY, function(error,decoded){
        if(error){
          res.json({ status: 'error', error : "token expired" });
        }else{
            Food.update(
                {  kind: req.body.kind,
                   name: req.body.name} , 
                { where: { typeId : req.body.typeId }} 
            ).then(function(affectedRows) {
                console.log(affectedRows);
                res.json({ status: 'success', data: affectedRows });
            }).catch(function(err){
                console.log('Oops! something went wrong, : ', err);
                res.json({ status: 'error', error : err });
            });
        }
        
    });    
})

foods.delete('/delete/:id', (req,res)=>{
    jwt.verify(req.headers['authorization'], process.env.SECRET_KEY, function(error,decoded){
        if(error){
          res.json({ status: 'error', error : "token expired" });
        }else{
            Food.destroy({
                where : {
                    typeId: req.params.id
                }
            }).then(function(affectedRows){
                res.send({status:'success',data:affectedRows});
            }).catch(err=>{
                res.json({ status: 'error', error : err });
            })
        }
        
    });    
})

module.exports = foods
