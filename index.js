var restify = require('restify'),
  bunyan = require('bunyan'),
  util = require('util');

var server = restify.createServer({
  name: 'helloworld'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.authorizationParser());
server.use(restify.dateParser());
server.use(restify.queryParser());
server.use(restify.urlEncodedBodyParser());

server.use(function slowHandler(req, res, next) {
  setTimeout(function() {
    return next();
  }, 250);
});

server.get({path: '/hello/:name', name: 'GetFoo'}, function respond(req, res, next) {
  res.send({
    hello: req.params.name
  });
  return next();
});

server.listen(8080, function() {
  console.log('listening: %s', server.url);
});