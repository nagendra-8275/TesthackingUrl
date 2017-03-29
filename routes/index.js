var express = require('express');
var router = express.Router();
var fs = require('fs')
var util = require('util')
var stream = require('stream')
var es = require('event-stream');
var iplocation = require('iplocation')


//var objArray = ["HTTP_METHOD", "URL", "HTTP_VERSION", "ORIGIN_HEADER",  "SSL_CIPHER", "SSL_PROTOCOL", "DATETIME", "LB_NAME", "CLIENT_IP:port", "BACKEND_IP:port", "request_processing_time", "backend_processing_time", "response_processing_time", "elb_status_code", "backend_status_code", "received_bytes", "sent_bytes"]    

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/readlog', function(req, res) {
 var pathToReadFile = req.query.path;
 var getORIGIN_HEADER = req.query.ORIGIN_HEADER;
 var getipLocation = req.query.ipLocation;
 var responseArray = [];	
 var s = fs.createReadStream(pathToReadFile)
  .pipe(es.split())
  .pipe(es.mapSync(function(line){
    // pause the readstream
    s.pause();
    if(line){	
        var patt = new RegExp(getORIGIN_HEADER);           
	    var pattFound = patt.test(line);
	    //console.log(line.split(" "));
	    var ipAdd = line.split('"')[3].split(" ")[5].split(":")[0];
	    checkIndianIp(ipAdd, getipLocation,function(err, result){
		 if (pattFound || result== false){
	      console.log(pattFound,result);
	      responseArray.push("Yes" ,line);
	     }s.resume();
	    });
    }else{
       s.resume();
    }      
  })
    .on('error', function(){
        console.log('Error while reading file.');
    })
    .on('end', function(){
    	res.send(responseArray);
        console.log('Read entire file.')
    })
);
});

function checkIndianIp(ip,getipLocation,cb){
iplocation(ip, function (error, res) {
	if(res.country_name == getipLocation){
		cb(null, true)
	}else{
	   cb(null, false)
	}
})}


module.exports = router;
