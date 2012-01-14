# DocRouter #
A Connect/Express router wrapper which exposes a formatted description of the available services of a server.
The documentation is available is multiple formats (Html, Wadl, Json).

The usage mimics the regular router's behavior.

## Retrieving the documentation ##
Two options:

- !! (GET http://myservice.mydomain.com/!!)
- OPTIONS (OPTIONS http://myservice.mydomain.com/)

## Supported outputs ##
- JSON (Accept: application/json) 
- WADL (Accept: text/xml)
- HTML (Accept: text/html)

# Examples #
## Connect Style ##

```
﻿var docRouter = require('docrouter').DocRouter;
var server = connect.createServer(docRouter(connect.router, "http://myservice.mydomain.com", function(app) {
    app.get('/:app', handleGetApp,
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
    app.post('/:app', handleAddApp,
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
);
server.listen(5000);
```

## Express Style ##
```
﻿var docRouter = require('docrouter').DocRouter;
var app = express.createServer();

docRouter(app, "http://myservice.mydomain.com");

app.get('/:app', handleGetApp,
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

app.post('/:app', handleAddApp,
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
```