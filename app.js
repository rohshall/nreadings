var restify = require('restify');
var pg = require('pg');

var conString = "tcp://sd_ventures:@localhost/sd_ventures_development";

var server = restify.createServer({
  name: 'nreadings',
  version: '0.0.1'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/api/1/devices', function (req, res, next) {
  var client = new pg.Client(conString);
  client.connect(function(err) {
    client.query("SELECT * FROM devices", function(err, result) {
      client.end();
      console.log(result);
      console.log(err);
      var data = result.rows.map(function(row) {
        return({device_type_id: row.device_type_id, mac_addr: row.mac_addr});
      });
      res.json(data);
      return next();
    });
  });
});

server.get('/api/1/devices/:device_id', function (req, res, next) {
  var client = new pg.Client(conString);
  client.connect(function(err) {
    client.query("SELECT * FROM devices WHERE mac_addr = $1", [req.params.device_id], function(err, result) {
      client.end();
      console.log(result);
      console.log(err);
      var row = result.rows[0];
      res.send({device_type_id: row.device_type_id, mac_addr: row.mac_addr});
      return next();
    });
  });
});

server.post('/api/1/devices', function (req, res, next) {
  var client = new pg.Client(conString);
  client.connect(function(err) {
    var today = new Date();
    client.query("INSERT INTO DEVICES (mac_addr, device_type_id, manufactured_at) VALUES ($1, $2, $3)",
      [req.params.mac_addr, req.params.device_type_id, '' + today.toISOString()], function(err, result) {
        client.end();
        console.log(result);
        console.log(err);
        return next();
      });
  });
});

server.get('/api/1/devices/:device_id/readings', function (req, res, next) {
  res.send(req.params);
  return next();
});

server.post('/api/1/devices/:device_id/readings', function (req, res, next) {
  res.send(req.params);
  return next();
});

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});
