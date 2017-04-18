# DocRouter #
Express router wrapper which exposes a formatted description of the available services of a server.
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

docRouter follows the ___RestDoc___ spec (https://github.com/RestDoc), RestDoc is a live spec so please 
expect changes over time.

# Examples #

```
var docRouter = require('docrouter').docRouter;
var app = express();
var router = express.Router();

docRouter(router, "http://myservice.mydomain.com");

router.get('/:app', handleGetApp,
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

router.post('/:app', handleAddApp,
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
    
app.use('/', router);
app.listen(5000);
```

# Credits #
* **[xmlbuilder-js](https://github.com/oozcitak/xmlbuilder-js)** by [oozcitak](https://github.com/oozcitak).
* **[jade](https://github.com/visionmedia/jade)** by [visionmedia](https://github.com/visionmedia).
* **[connect](https://github.com/senchalabs/connect)** by [senchalabs](https://github.com/senchalabs).

# License
[MIT](LICENSE)
