const express = require('express');
var router = express.Router();
const db = require('../db');
var keys = require('../config/keys');

function checkLogin(req,res){
	if(typeof req.user == 'undefined'){
		res.redirect('../');
	}
	if(req.session.user != keys.adminKey){
		res.redirect('../auth/logout');
	}
}

function checkError(err,res){
	if(err){
		console.log(err);
		res.send({success:false,message:'database error',err:err});
	}
}

function sendQuery(Query,req,res,fileName){
	db.query(Query, function (err, result, fields) {
		checkError(err,res);
		console.log(result);
		res.render(fileName,{result:result,name:req.user.name,role:'admin'});	
	});	
}

router.get('/home',(req,res)=>{
	checkLogin(req,res);
	var adminId = req.session.id;
	var query = "SELECT complaint_id,complaint_subject,date,dept_name \
				FROM complaint_list INNER JOIN department_list \
				ON department_list.dept_id = complaint_list.dept_id and admin_id = "+adminId+" and resolved = 0 order by date desc;"
	sendQuery(query,req,res,'home.ejs');
})

router.get('/history',(req,res)=>{
	checkLogin(req,res);
	var adminId = req.session.id;
	var query = "SELECT complaint_id,complaint_subject,date,dept_name \
				FROM complaint_list INNER JOIN department_list \
				ON department_list.dept_id = complaint_list.dept_id and admin_id = "+adminId+" and resolved = 1 order by date desc;"
	sendQuery(query,req,res,'history.ejs');
})

router.get('/complaint',(req,res)=>{
	checkLogin(req,res);
	var id = req.query.id;
	var query = 'SELECT complaint_list.complaint_id,complaint_list.dept_id,complaint_list.admin_id,complaint_subject,complaint_text,complaint_list.date,\
				dept_name,reply_text,reply_list.date,from_to,resolved \
				FROM ((complaint_list INNER JOIN department_list ON complaint_list.dept_id = department_list.dept_id and complaint_id = '+id+'\
				and admin_id = '+req.session.id+') \
				LEFT JOIN reply_list ON reply_list.complaint_id = '+id+');' ;
	sendQuery(query,req,res,'complaint.ejs');	
})

router.post('/complaint',(req,res)=>{
	var query = 'INSERT INTO reply_list SET ?'
	var post = {
		reply_text : req.body.reply_text,
		from_to : 'A',
		complaint_id : req.query.id,
		date : req.body.date
	}
	console.log(query);
	db.query(query,post,(err,result)=> {
		checkError(err,res);
		console.log(result);
		var link = '/admin/complaint/?id='+req.query.id;
		res.redirect(link);	
	})
})

// router.get('/new_complaint',(req,res)=>{
// 	checkLogin(req,res)
// 	res.render('new_complaint.ejs',{id:req.session.id,role:'admin',name:req.user.name});	
// })

// router.post('/new_complaint',(req,res) => { //post method for submitting a complaint the body of request should contain respective methods
// 	checkLogin(req,res);
// 	console.log(req.body);
// 	var query = 'INSERT INTO complaint_list SET ?'
// 	var post = {
// 		complaint_subject : req.body.complaint_subject,
// 		complaint_text : req.body.complaint_text,
// 		date : req.body.date,
// 		student_id : req.body.null,
// 		admin_id : req.body.admin_id,
// 		secy_id : req.body.secy_id,
// 		dept_id : req.body.dept_id,
// 		complaint_id : null,
// 		resolved : 0
// 	}
// 	console.log(query);
// 	db.query(query,post,(err,result)=> {
// 		checkError(err,res);
// 		console.log(result);
// 		res.redirect('/secy/home');	
// 	})	
// })

// router.get('/delete',(req,res)=>{
// 	checkLogin(req,res);
// 	var id = req.query.id;
// 	var query = 'DELETE FROM complaint_list where complaint_id = '+id+' and secy_id = '+req.session.id;
// 	db.query(query, function (err, result, fields) {
// 		checkError(err,res);
// 		console.log(result);
// 		res.redirect('/secy/home');
// 	});	
// })

// router.get('/forward',(req,res)=>{
// 	checkLogin(req,res);
// 	var id = req.query.id;
// 	var query = 'UPDATE complaint_list SET admin_id='+req.query.did+' WHERE complaint_id='+req.query.id;
// 	db.query(query, function (err, result, fields) {
// 		checkError(err,res);
// 		console.log(result);
// 		res.redirect('/secy/home');
// 	});	
// })

module.exports = router;