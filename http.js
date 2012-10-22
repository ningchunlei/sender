var program = require("commander")

program.version('0.0.1')
    .usage('[options]')
    .option('-c, --conf <string>', 'config file')
    .parse(process.argv);

if(program.conf==undefined){
    console.log("must input config")
    process.exit(1)
}

var conf = require("./conf/"+program.conf);
process.conf = conf;

var log4js = require('log4js');
log4js.configure('./conf/log4js.json', {});

var log = log4js.getLogger("http");
process.log = log


var http = require("./service").http

http.listen(80)

log.info("start up")

