var os = require('os')
var util = require("util")
var buffer = require("buffer")

var epoch = 1317398400000;
var workerIdBits = 8;
var sequenceBits = 12;

var lastTimestamp = -1
var sequence = 0;
//var workid = process.conf.server.workid
var workid = 0;

var interfaces = os.networkInterfaces();
var ip = null;
for (k in interfaces) {
    for (k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family == 'IPv4' && !address.internal && ip==null) {
            ip = address.address
        }
    }
}

function getMsgId(uid){
    var timestamp = new Date().getTime()
    if (lastTimestamp == timestamp) {
        sequence = (sequence+1) & sequenceMask;
        if (sequence == 0) {
            return -1
        }
    } else {
        sequence = 0;
    }
    lastTimestamp = timestamp
    console.log(lastTimestamp - epoch);
    var tstr = parseInt(lastTimestamp - epoch).toString(16)
    console.log(tstr)
    var padding = 11- tstr.length
    for(i=0;i<padding;i++){
        tstr  = "0"+tstr;
    }
    var wstr = parseInt(workid).toString(16)
    padding = 2 - wstr.length;
    for(i=0;i<padding;i++){
        wstr  = "0"+wstr;
    }
    var sstr = parseInt(sequence).toString(16)
    padding = 3 - sstr.length;
    for(i=0;i<padding;i++){
        sstr  = "0"+sstr;
    }
    return util.format("%s%s%s%s",tstr,wstr,sstr,parseInt(uid).toString(16));
}

exports.service = function(req,res){

     req.

}



