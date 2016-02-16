var restify = require('restify'),
  bunyan = require('bunyan'),
  util = require('util'),
  exec = require('child_process').exec,
  fs = require('fs');

var server = restify.createServer({
  name: 'helloworld'
});

var port = process.env.EDGE_SERVICE_PORT || 8080;

server.use(restify.acceptParser(server.acceptable));
server.use(restify.authorizationParser());
server.use(restify.dateParser());
server.use(restify.queryParser());
server.use(restify.urlEncodedBodyParser());

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

server.get({path: '/hello/:name', name: 'GetFoo'}, function respond(req, res, next) {
  res.send({
    hello: req.params.name
  });
  return next();
});

server.get({path: '/process', name: 'ProcessDump'}, function respond(req, res, next) {
  console.log(process);
  res.send('logged the process!');
  return next();
});

server.get({path: '/record', name: 'Record'}, function respond(req, res, next) {

  // should use sprintf...
  fs.appendFileSync('/tmp/perf-'+process.pid+'.map');

  exec('/src/record.sh', function record(error, stderr, stdout) {
    console.log(error);
  });

  res.send({ hey: 'recorded' });
});

server.get({path: '/graph', name: 'Graph'}, restify.serveStatic({
  directory: __dirname,
  file: 'out.nodestacks01.svg'
}));

server.get({path: '/stack', name: 'Stack'}, restify.serveStatic({
  directory: __dirname,
  file: 'out.nodestacks01'
}));

server.get({path: '/map', name: 'Map'}, restify.serveStatic({
  directory: '/tmp',
  file: 'perf-'+process.pid+'.map'
}));


server.listen(port, function() {
  console.log('listening: %s', server.url);
});