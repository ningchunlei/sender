var buffer = require("buffer")

var path = require("path")
var thrift_path = require.resolve("thrift")
var thrift = require("thrift")
var ttransport = require(path.resolve(path.dirname(thrift_path),"transport"));
TBinaryProtocol = require(path.resolve(path.dirname(thrift_path),"protocol")).TBinaryProtocol;

var ShareStruct_ttypes = require("./thrift/ShareStruct_Types")
var ErrorNo_ttypes = require("./thrift/ErrorNo_Types")
var Exception_ttypes = require("./thrift/Exception_Types")

var bufArray = [];
buflen = 0;
var output = new TBinaryProtocol(new ttransport.TBufferedTransport(undefined, function(buf) {
    bufArray.push(buf);
    buflen += buf.length
}));
var t = new ShareStruct_ttypes.Msg({"uid":"aaa","mid":"msgid","msgtext":"msgtext"})
t.write(output)
output.flush()

var mbuf = new Buffer(buflen)
var len = 0;

console.log(bufArray.length)

bufArray.forEach(function(buf){
    buf.copy(mbuf,0,0,buf.len)
    len += buf.len
})

console.log(mbuf.length)

var msg
rec = ttransport.TBufferedTransport.receiver(function(data){
    var input = new TBinaryProtocol(data);
    msg = new ShareStruct_ttypes.Msg();
    msg.read(input)
    input.readMessageEnd();
    console.log(msg)
})
rec(mbuf);



