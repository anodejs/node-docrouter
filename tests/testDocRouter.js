var docRouter = require('../index').DocRouter;
var connect = require('connect');
var express = require('express');
var request = require('request');

function nope(req, res) {
    res.end();
}

function mapRouter(app) {
    app.get('/:app', nope,
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
    app.post('/:app', nope,
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
}

exports['test get wadl'] = function (test) {
    var server = connect.createServer(
        docRouter(connect.router, "boo", mapRouter)
    );
    server.listen(5000);

    request('http://localhost:5000/!!', function (error, res) {
        if (error) {
            test.fail("Could not get waml");
            return;
        }

        test.ok(~res.body.indexOf('<method id="GetApp" name="GET">'));
        test.ok(~res.body.indexOf('<method id="UpdateApp" name="POST">'));
        server.close();
        test.done();
    });
};

exports['test get json'] = function (test) {
    var server = connect.createServer(
        docRouter(connect.router, "boo", mapRouter)
    );
    server.listen(5000);

    request({
            uri: 'http://localhost:5000/',
            method: 'OPTIONS',
            headers: { accept: 'application/json'}
        },
        function (error, res) {
            if (error) {
                test.fail("Could not get json");
                return;
            }

            var methodsJson = JSON.parse(res.body);
            test.ok(methodsJson.length == 2);
            server.close();
            test.done();
        });
};

exports['test get html'] = function (test) {
    var server = connect.createServer(
        docRouter(connect.router, "boo", mapRouter)
    );
    server.listen(5000);

    request({
            uri: 'http://localhost:5000/',
            method: 'OPTIONS',
            headers: { accept: 'text/html'}
        },
        function (error, res) {
            if (error) {
                test.fail("Could not get html");
                return;
            }

          test.ok(~res.body.indexOf('GET</label>'));
            test.ok(~res.body.indexOf('POST</label>'));
          server.close();
            test.done();
        });
};


if (express) {
    exports['test get wadl with express'] = function (test) {
        var app = express.createServer();

        docRouter(app, "boo");

        app.get('/:app', nope,
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

        app.post('/:app', nope,
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

        app.listen(5000);

        request('http://localhost:5000/!!', function (error, res) {
            if (error) {
                test.fail("Could not get waml");
                return;
            }

            test.ok(~res.body.indexOf('<method id="GetApp" name="GET">'));
            test.ok(~res.body.indexOf('<method id="UpdateApp" name="POST">'));
            app.close();
            test.done();
        });
    };
}

