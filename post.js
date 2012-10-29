var os = require('os')
var util = require("util")
var buffer = require("buffer")

var path = require("path")
var thrift_path = require.resolve("thrift")
var thrift = require("thrift")
var ttransport = require(path.resolve(path.dirname(thrift_path),"transport"));
TBinaryProtocol = require(path.resolve(path.dirname(thrift_path),"protocol")).TBinaryProtocol;

var ShareStruct_ttypes = require("./thrift/ShareStruct_Types")
var ErrorNo_ttypes = require("./thrift/ErrorNo_Types")
var Exception_ttypes = require("./thrift/Exception_Types")

var kestrelPool = poolModule.Pool({
    name: "memcache",
    create : function(callback){
        var client = new memcache.Client(process.conf.kestrel.port, process.conf.kestrel.ip);
        callback(null,client);
    }  ,
    destroy  : function(client) { client.close(); }, //当超时则释放连接
    max      : 10,   //最大连接数
    idleTimeoutMillis : 10,  //超时时间
    log : true
});

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
    var tstr = parseInt(lastTimestamp - epoch).toString(16)
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
    var msgtext = req.param("m")
    var uid = req.param("u")
    var msgid =  getMsgId(uid)

    bufArray = [];
    buflen = 0;
    var output = new TBinaryProtocol(new ttransport.TBufferedTransport(undefined, function(buf) {
        bufArray.push(buf);
        buflen += buf.length
    }));
    var t = new ShareStruct_ttypes.Msg({"uid":uid,"mid":msgid,"msgtext":msgtext})
    t.write(output)
    output.flush()

    var mbuf = new Buffer(buflen)
    var len = 0;
    bufArray.forEach(function(buf){
        buf.mbuf(buf,0,0,buf.len)
        len += buf.len
    })

    kestrelPool.borrow(function(err,client){
        client.set("PostMsg",mbuf.toString(),function(){kestrelPool.release(client)})
    })
}



