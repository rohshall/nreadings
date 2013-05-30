#!/bin/env node

var app_name = process.env.OPENSHIFT_APP_NAME || 'nreadings',
    host_port = process.env.OPENSHIFT_INTERNAL_PORT || 8080,
    host_url = process.env.OPENSHIFT_INTERNAL_IP  || '127.0.0.1',
    db_name = process.env.OPENSHIFT_APP_NAME || 'sd_ventures_development',
    db_username = process.env.OPENSHIFT_POSTGRESQL_DB_USERNAME || 'sd_ventures',
    db_password = process.env.OPENSHIFT_POSTGRESQL_DB_PASSWORD || ''

var express = require('express');
var pg = require('pg');

var conString = ["tcp://", db_username, ":", db_password, "@", host_url, "/", db_name].join("");

var server = express.createServer();
server.configure(function() {
  server.use(express.bodyParser());
});

server.get('/api/1/devices', function (req, res) {
  pg.connect(conString, function(err, client) {
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
      });
    }
  });
});

server.get('/api/1/devices/:device_id', function (req, res) {
  pg.connect(conString, function(err, client) {
    if (err) {
      console.log(err);
      res.json(501, err);
    } else {
      client.query("SELECT * FROM devices WHERE mac_addr = $1", [req.params.device_id], function(err, result) {
        if (err) {
          console.log(err);
          res.json(501, err);
        } else {
          if (result.rows.length == 1) {
            var row = result.rows[0];
            res.json({device_type_id: row.device_type_id, mac_addr: row.mac_addr});
          } else {
            res.json(501, {status: "no such device"});
          }
        }
      });
    }
  });
});

server.post('/api/1/devices', function (req, res) {
  pg.connect(conString, function(err, client) {
    if (err) {
      console.log(err);
      res.json(501, err);
    } else {
      var today = new Date();
      client.query("INSERT INTO DEVICES (mac_addr, device_type_id, manufactured_at) VALUES ($1, $2, $3)",
        [req.body.mac_addr, req.body.device_type_id, today.toISOString()], function(err, result) {
          if (err) {
            console.log(err);
            res.json(501, err);
          } else {
            res.json({status: "ok"});
          }
      });
    }
  });
});

server.get('/api/1/devices/:device_id/readings', function (req, res) {
  pg.connect(conString, function(err, client) {
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
      });
    }
  });
});

server.post('/api/1/devices/:device_id/readings', function (req, res) {
  pg.connect(conString, function(err, client) {
    if (err) {
      console.log(err);
      res.json(501, err);
    } else {
      client.query("SELECT * FROM devices WHERE mac_addr = $1", [req.params.device_id], function(err, result) {
        if (err) {
          console.log(err);
          res.json(501, err);
        } else {
          // if the device exists, add this reading
          if (result.rows.length == 1) {
            var today = new Date();
            client.query("INSERT INTO readings (value, created_at, device_mac_addr) VALUES ($1, $2, $3)",
              [req.body.value, today.toISOString(), req.params.device_id], function(err, result) {
              if (err) {
                console.log(err);
                res.json(501, err);
              } else {
                res.json({status: "ok"});
              }
            });
          } else {
            res.json(501, {status: "no such device"});
          }
        }
      });
    }
  });
});

server.listen(host_port, host_url, function () {
  console.log('%s listening at %s', server.name, server.url);
});
