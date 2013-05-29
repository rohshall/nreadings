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
  client.connect();
  var query = client.query("SELECT * FROM devices");
  var data = [];
  query.on('row', function(row) {
    data.push({ 
      device_type_id: row.device_type_id,
      mac_addr: row.mac_addr
    });
  });
  query.on('end', function() {
    client.end();
    res.json(data);
    return next();
  });
});

server.get('/api/1/devices/:device_id', function (req, res, next) {
  var client = new pg.Client(conString);
  client.connect();
  var query = client.query("SELECT * FROM devices WHERE mac_addr = $1", [req.params.device_id]);
  query.on('row', function(row) {
    res.send({ 
      device_type_id: row.device_type_id,
      mac_addr: row.mac_addr
    });
  });
  query.on('end', function(result) {
    console.log(result.rows.length + ' rows processed');
    client.end();
    return next();
  });
});

server.post('/api/1/devices', function (req, res, next) {
  var client = new pg.Client(conString);
  client.connect();
  var today = new Date();
  var query = client.query("INSERT INTO DEVICES (mac_addr, device_type_id, manufactured_at) VALUES ($1, $2, $3)",
    [req.params.mac_addr, req.params.device_type_id, '' + today.toISOString()]);
  query.on('end', function(result) {
    console.log(result.rows.length + ' rows processed');
    client.end();
    return next();
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
