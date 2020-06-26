var express = require('express');
var router = express.Router();
var user=require('../models/users');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.post('/login',(req,res,next)=>{
	var param={
		userName:req.body.userName,
		userPwd:req.body.userPwd
	}
	user.findOne(param,(err,doc)=>{
		if(err){
			res.json({
				status:"1",
				msg:err.message
			});
		}else{
			if(doc){
				res.cookie("userId",doc.userId,{
					path:"/",
					maxAge:1000*60*60
				});
				res.cookie("userName",doc.userName,{
					path:"/",
					maxAge:1000*60*60
				});
				res.json({
				status:"0",
				msg:'hhhh'+doc.userName,
				result:{
					userName:doc.userName
				}
			    })		
			}
			else{
				res.json({
				status:"1",
				msg:'',
				result:''
			    })		
			}
			
		}

	})

});

router.post('/logout',(req,res,next)=>{
	res.cookie("userId","",{
			path:"/",
			maxAge:-1
		}
	);
	res.json({
		status:"0",
		msg:'',
		result:''
	})
})


router.get('/checkLogin',(req,res,next)=>{
	if(req.cookies.userId){
		res.json({
			status:"0",
			msg:'',
			result:req.cookies.userName
		});
	}else{
		res.json({
			status:"1",
			msg:'未登录',
			result:''
		});
	}
})

//查询当前购物车
router.get('/cartList',(req,res,next)=>{
     var userId=req.cookies.userId;
     user.findOne({userId:userId},(err,doc)=>{
     	 if(err){
     	 	res.json({
     	 		status:'1',
     	 		msg:err.message,
     	 		result:''
     	 	})
     	 }else{
     	 	if(doc){
     	 		res.json({
     	 			status:'0',
     	 			msg:'',
     	 			result:doc.cartList
     	 		})
     	 	}
     	 }
     })
});
//购物车删除
router.post('/cartDel',(req,res,next)=>{
    var userId=req.cookies.userId,productId=req.body.productId;
    user.update(
       {userId:userId},{$pull:{'cartList':{'productId':productId}}},(err,doc)=>{
       	 if(err){
       	 	res.json({
     	 		status:'1',
     	 		msg:err.message,
     	 		result:''
     	 	})
       	 }
       	 else{
       	 	res.json({
     	 			status:'0',
     	 			msg:'',
     	 			result:'suc'
     	 	 })
       	 }
       }
     )
});
//编辑购物车
router.post('/cartEdit',(req,res,next)=>{
	var userId=req.cookies.userId,
	    productId=req.body.productId,
	    productNum=req.body.productNum,
	    checked=req.body.checked;
	user.update(
		{"userId":userId,'cartList.productId':productId},
		{'cartList.$.productNum':productNum,'cartList.$.checked':checked},(err,doc)=>{
		if(err){
       	 	res.json({
     	 		status:'1',
     	 		msg:err.message,
     	 		result:''
     	 	})
       	 }
       	 else{       	 	res.json({
     	 			status:'0',
     	 			msg:userId+" "+productId+" "+productNum+" "+checked,
     	 			result:'suc'
     	 	 })
       	 }
	})
});

 //修改全选中状态
 router.post('/editCheckAll',(req,res,next)=>{
 	var userId=req.cookies.userId,
	    checkAll=req.body.checkAllFlag?'1':'0';
	user.findOne({userId:userId},(err,userDoc)=>{
		if(err){
       	 	res.json({
     	 		status:'1',
     	 		msg:err.message,
     	 		result:''
     	 	})
       	 }
       	 else{     
            if(userDoc){
            	userDoc.cartList.forEach((item)=>{
            		item.checked=checkAll;
            	})
            	userDoc.save((err1,doc1)=>{
            		if(err1){
                      res.json({
			     	 		status:'1',
			     	 		msg:err1.message,
			     	 		result:''
			     	 	})
            		}else{
                      res.json({
     	 		    	  status:'0',
     	 		    	  msg: '',
     	 		    	  result:'suc'
     	 	           })
            		}
            	})
            }
       	 }
	})
});
router.get('/addressList',(req,res,next)=>{
	 let userId=req.cookies.userId;
	 user.findOne({userId:userId},(err,doc)=>{
	 	if(err){
	 		res.json({
	 			status:'1',
	 			msg:err.message,
	 			result:''
	 		})
	 	}else{
	 		res.json({
	 			status:'0',
	 			msg:'suc',
	 			result:doc.addressList
	 		})
	 	}
	 })
});
router.post('/setDefalt',(req,res,next)=>{
	let userId=req.cookies.userId;
	let addressId=req.body.addressId;
	user.findOne({userId:userId},(err,doc)=>{
	 	if(err){
	 		res.json({
	 			status:'1',
	 			msg:err.message,
	 			result:''
	 		})
	 	}else{
	 		var addressList=doc.addressList;
	 		addressList.forEach((item)=>{
	 			if(item.addressId==addressId){
	 				item.isDefault=true;
	 			}else{
	 				item.isDefault=false;
	 			}
	 		});
	 		doc.save((err1,doc1)=>{
	 			if(err){
			 		res.json({
			 			status:'1',
			 			msg:err.message,
			 			result:''
			 		})
			 	}else{
			 		res.json({
			 			status:'0',
			 			msg:'',
			 			result:''
			 		})
			 	}
	 		})
	 	}
	 })
});
router.post('/delAddress',(req,res,next)=>{
	 let userId=req.cookies.userId;
	 let addressId=req.body.addressId;
	 user.update({userId:userId},{$pull:{'addressList':{'addressId':addressId}}},
	 	(err,doc)=>{
	 		if(err){
			 		res.json({
			 			status:'1',
			 			msg:err.message,
			 			result:''
			 		})
			 	}else{
			 		res.json({
			 			status:'0',
			 			msg:'',
			 			result:''
			 		})
			 	}
	 	})
})
module.exports = router;
