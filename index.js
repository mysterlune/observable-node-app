var restify = require('restify'),
  bunyan = require('bunyan'),
  util = require('util'),
  exec = require('child_process').exec,
  fs = require('fs'),
  jsonApiFormatter = require('restify-formatter-jsonapi'),
  _ = require('lodash'),
  sprintf = require('sprintf-js').sprintf,
  redis = require('redis');

console.log('REDIS URL'+process.env.REDIS_URL);

var redisClient = redis.createClient(process.env.REDIS_URL);

redisClient.on('connect', function() {
  console.log('connected to redis');
});

var GRAPH_SERVICE_HOST = process.env.GRAPH_SERVICE_HOST || '192.168.99.100',
  EDGE_SERVICE_PORT = process.env.EDGE_SERVICE_PORT || 8080;

// Ensure that the public dir exists...
var publicDir = sprintf('%1s/public', __dirname);
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Ensure that the graphs dir exists...
var graphsDir = sprintf('%1s/graphs', __dirname);
if (!fs.existsSync(graphsDir)) {
  fs.mkdirSync(graphsDir);
}

var server = restify.createServer({
  name: 'helloworld',
  // If more formatters are needed, just add to the merge...
  'formatters': _.merge(jsonApiFormatter)
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.authorizationParser());
server.use(restify.dateParser());
server.use(restify.queryParser());
server.use(restify.urlEncodedBodyParser());

server.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Resource', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    next();
});

server.use(function slowHandler(req, res, next) {

  function pushToArr(arr, item) {
    arr.push(item);
  }

  setTimeout(function superDuper() {
    // Really slow at # over `100000`
    var arr = [];
    for(var i = 1000000; i >= 0; i--){
      pushToArr(arr, i);
    }
    arr.sort(function sortySort(a,b){
      return a - b;
    });

    next();
  }, Math.floor(Math.random()*234));

  return;

});

server.get({path: '/record', name: 'Record'}, function recordRespond(req, res, next) {

  fs.appendFileSync(sprintf('/tmp/perf-%1s.map', process.pid));

  exec(sprintf('%1s/record.sh', __dirname), function recordExecute(error, stderr, stdout) {
    console.log(error);
  });

  res.setHeader('content-type', 'application/json');
  res.send({});
});

server.get({path: '/recordings', name: 'Recordings'}, function getRecordingsResponder(req, res, next) {

  fs.readdir(publicDir, function(err, files) {

    var data = _.map(files, function(a, b, c) {
      return {
        "type": "recording",
        "id": a,
        "attributes": {
          "graph-name": a,
          "graph-source": sprintf('http://%1s/public/%2s', GRAPH_SERVICE_HOST, a)
        }
      };
    });

    res.send(data);
  });
});

server.get({path: '/graphs/:name', name: 'GraphLookup'}, function getGraphResponder(req, res, next) {

  fs.readdir(publicDir, function(err, files) {

    var data = _.filter(files, req.params.name, function(a, b, c) {
      return {
        "type": "recording",
        "id": a,
        "attributes": {
          "graph-name": a,
          "graph-source": sprintf('http://%1s/public/%2s', GRAPH_SERVICE_HOST, a)
        }
      };
    });

    res.send(data);

  });

});

// Serves the static assets produced by ./record.sh
server.get(/\/public\/?.*/, restify.serveStatic({
  directory: __dirname
}));

// server.get({path: '/stack', name: 'Stack'}, restify.serveStatic({
//   directory: __dirname,
//   file: 'out.nodestacks01'
// }));

// server.get({path: '/map', name: 'Map'}, restify.serveStatic({
//   directory: '/tmp',
//   file: 'perf-'+process.pid+'.map'
// }));

// server.get({path: '/process', name: 'ProcessDump'}, function processDumpRespond(req, res, next) {
//   console.log(process);
//   res.send('logged the process!');
//   return next();
// });

server.get({path: '/hammer', name: 'Hammer'}, function getHammerRespond(req, res, next) {

  redisClient.incr('hits', function(err, reply) {
    console.log(reply);
    res.send({
      hammer: 'bammer'
    });
  });

});

server.listen(EDGE_SERVICE_PORT, function() {
  console.log('listening: %s', server.url);
});
