var docRouter = require('../index').docRouter;
var express = require('express');
var request = require('request');
var http = require('http');

function nope(req, res) {
    res.end();
}

exports['test get wadl with express'] = function (test) {
  var app = express();
  var router = express.Router();
    
  docRouter(router, "boo", function (router) {

    router.get('/:app', nope,
      {
        id: "GetApp",
        doc: "Gets the app",
        params: {
          app: {
            style: "template",
            type: "string",
            required: true
          }
        }
      });

    router.post('/:app', nope,
      {
        id: "UpdateApp",
        doc: "Updates the app",
        params: {
          app: {
            style: "template",
            type: "string",
            required: true
          }
        }
      });
    });
    
    app.use('/', router);
    var server = app.listen(5000);

    request({
        url: 'http://localhost:5000/!!',
        headers: {
          'accept': 'text/html'
        } 
      },
      function (error, res) {
          if (error) {
              return test.fail("Could not get waml");
          }

          test.ok(~res.body.indexOf('<label class="methodType">GET</label><label class="methodPath">/:app</label><div class="doc">Gets the app</div>'));
          test.ok(~res.body.indexOf('<label class="methodType">POST</label><label class="methodPath">/:app</label><div class="doc">Updates the app</div>'));
          server.close();
          test.done();
      }
    );
};
