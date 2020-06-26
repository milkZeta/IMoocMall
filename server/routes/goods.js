var express=require('express');
var router=express.Router();
var mongoose=require('mongoose');
var goods=require('../models/goods');

mongoose.connect('mongodb://127.0.0.1:27017/IMoocMall');


router.get("/",function(req,res,next){
	goods.find({},(err,doc)=>{
      let page=parseInt(req.param("page"));
      let pageSize=parseInt(req.param("pageSize"));
      let sort=req.param("sort");
      let skip=(page-1)*pageSize;
      let params={};
      let priceLevel=req.param("priceLevel");
      var priceGt=0, priceLte=100;
      if(priceLevel!="all")
      {
        switch(priceLevel){
          case "0":priceGt=0;priceLte=100;break;
          case "1":priceGt=100;priceLte=500;break;
          case "2":priceGt=500;priceLte=1000;break;
          case "3":priceGt=1000;priceLte=1500;break;
         }
        params={
        salePrice:{
          $gte:priceGt,
          $lte:priceLte
          }
        }
      }
      let goodsModel=goods.find(params).skip(skip).limit(pageSize);
      goodsModel.sort({"salePrice":sort});
      goodsModel.exec((err,doc)=>{
      if(err){
        res.json({
        	status:'1',
        	msg:''
        });
      }else{
      	  res.json({
            status:'0',
            msg:'',
            result:{
            	count:doc.length,
            	list:doc
            }
        });
      }
	});
});
  });

//加入购物车
router.post("/addCart",function(req,res,next){
      var userId="100000077",productId=req.body.productId;
      var user=require("../models/users");
      user.findOne({userId:userId},(err,userDoc)=>{
          if(err){
            res.json({
              status:1,
              msg:err.message
            })
          }
          else{
            console.log("userDoc:"+userDoc);
            if(userDoc){
               let goodsItem='';
               userDoc.cartList.forEach((item)=>{
                  if(item.productId==productId){
                    goodsItem=item;
                    item.productNum++;
                  }
               })
               if(goodsItem){
                   userDoc.save((err2,doc2)=>{
                         if(err2){
                          res.json({
                            status:1,
                            msg:err2.message
                          })
                         }else
                         {
                          res.json({
                            status:0,
                            msg:'',
                            result:'success'
                          })
                         }
                      })
               }else{
               goods.findOne({productId:productId},(err1,doc1)=>{
                  if(err1){
                    res.json({
                      status:1,
                      msg:err1.message
                    })
                  }else{
                    if(doc1){
                      doc1.productNum=1;
                      doc1.checked=1;
                      userDoc.cartList.push(doc1);
                      userDoc.save((err2,doc2)=>{
                         if(err2){
                          res.json({
                            status:1,
                            msg:err2.message
                          })
                         }else
                         {
                          res.json({
                            status:0,
                            msg:'',
                            result:'success'
                          })
                         }
                      })
                    }
                  }
               })
             }
            }
          }
      })
      });
module.exports = router;