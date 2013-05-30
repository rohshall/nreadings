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
  pg.connect(conString, function(err, client, done) {
    if (err) {
      console.log(err);
      res.json(501, err);
    } else {
      client.query("SELECT * FROM devices", function(err, result) {
        if (err) {
          console.log(err);
          res.json(501, err);
        } else {
          var data = result.rows.map(function(row) {
            return({device_type_id: row.device_type_id, mac_addr: row.mac_addr});
          });
          res.json(data);
        }
        done();
      });
    }
    return next();
  });
});

server.get('/api/1/devices/:device_id', function (req, res, next) {
  pg.connect(conString, function(err, client, done) {
    if (err) {
      console.log(err);
      res.json(501, err);
    } else {
      client.query("SELECT * FROM devices WHERE mac_addr = $1", [req.params.device_id], function(err, result) {
        if (err) {
          console.log(err);
          res.json(501, err);
        } else {
          var row = result.rows[0];
          res.json({device_type_id: row.device_type_id, mac_addr: row.mac_addr});
        }
        done();
      });
    }
    return next();
  });
});

server.post('/api/1/devices', function (req, res, next) {
  pg.connect(conString, function(err, client, done) {
    if (err) {
      console.log(err);
      res.json(501, err);
    } else {
      var today = new Date();
      client.query("INSERT INTO DEVICES (mac_addr, device_type_id, manufactured_at) VALUES ($1, $2, $3)",
        [req.params.mac_addr, req.params.device_type_id, today.toISOString()], function(err, result) {
          if (err) {
            console.log(err);
            res.json(501, err);
          } else {
            res.json({status: "ok"});
          }
          done();
      });
    }
    return next();
  });
});

server.get('/api/1/devices/:device_id/readings', function (req, res, next) {
  pg.connect(conString, function(err, client, done) {
    if (err) {
      console.log(err);
      res.json(501, err);
    } else {
      client.query("SELECT * FROM readings WHERE device_mac_addr = $1", [req.params.device_id], function(err, result) {
        if (err) {
          console.log(err);
          res.json(501, err);
        } else {
          var data = result.rows.map(function(row) {
            return({value: row.value, created_at: row.created_at.toISOString()});
          });
          res.json(data);
        }
        done();
      });
    }
    return next();
  });
});

server.post('/api/1/devices/:device_id/readings', function (req, res, next) {
  pg.connect(conString, function(err, client, done) {
    if (err) {
      console.log(err);
      res.json(501, err);
    } else {
      var today = new Date();
      client.query("INSERT INTO readings (value, created_at) VALUES ($1, $2)",
        [req.params.value, today.toISOString()], function(err, result) {
        if (err) {
          console.log(err);
          res.json(501, err);
        } else {
          res.json({status: "ok"});
        }
        done();
      });
    }
    return next();
  });
});

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});
