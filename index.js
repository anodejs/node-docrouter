var j2w = require('./json2wadl'),
    jade = require('jade'),
    fs = require('fs'),
    methods = require('./methods'),
    path = require('path');

var jadeTemplate = fs.readFileSync(path.join(__dirname, 'doc.jade'), 'utf8');

var DocRouter = function (connectRouter, baseUrl) {
    if (!connectRouter) throw new Error("Connect router function is missing.");
    if (!baseUrl) throw new Error("A base url is missing.");

    this.connectRouter = null;
    this.methodJsons = [];
    this.baseUrl = baseUrl;
    this.wadl = null;

    var self = this;
    self.connectRouter = connectRouter;

    this.connectRouter.get("/!!", function (req, res) {
        getWadl(req, res);
    });


    this.connectRouter.options("/", function (req, res) {
        getWadl(req, res);
    });

    var method,
        i,
        l;

    for (i = 0, l = methods.length; i < l; i++) {
        method = methods[i];
        // override the original router method
        this.connectRouter[method] = (function (method, originalMethodFunction) {
            return function (route) {
                var args = arguments;
                var handlersCount = args.length;
                // Multiple arguments may exist for multiple middlewares. The Json describing the method is the last argument.
                var methodJson = {};
                if (typeof(args[args.length - 1]) === 'object'){
                    methodJson = args[args.length - 1];
                    handlersCount -= 1;
                }
                methodJson.method = method.toUpperCase();
                methodJson.path = route;

                self.methodJsons.push(methodJson);

                // call the original router with the original arguments

                var originalArgs = Array.prototype.slice.call(args, 0, handlersCount);
                originalMethodFunction.apply(self.connectRouter, originalArgs);
            };
        }(method, self.connectRouter[method]));
    }

    function getWadl(req, res) {
        var htmlTemplate;
        if (req.headers.accept &&
            (~req.headers.accept.indexOf('application/json') || ~req.headers.accept.indexOf('text/json')))
        {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(self.methodJsons));
            return;
        }

        if (req.headers.accept &&
            (~req.headers.accept.indexOf('text/html') || ~req.headers.accept.indexOf('text/plain')))
        {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            if (!self.html) {
                try {
                    htmlTemplate = jade.compile(jadeTemplate);
                    self.html = htmlTemplate({methodJsons: self.methodJsons, baseUrl: self.baseUrl});
                } catch(e) {
                    console.error(e);
                }
            }
            res.end(self.html);
            return;
        }

        if (!self.wadl) {
            self.wadl = j2w.toWadl(self.methodJsons, self.baseUrl, { pretty: true });
        }
        res.writeHead(200, { 'Content-Type': 'application/xml' });
        res.end(self.wadl);
    }
};


exports.docRouter = function (connectRouter, baseUrl, fn) {
    if (!connectRouter) throw new Error("connectRouter is missing");

    var docRouter = new DocRouter(connectRouter, baseUrl);

    if (fn) {
        fn(docRouter.connectRouter);
    }

    return docRouter.connectRouter;
};

