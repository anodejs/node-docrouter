var j2w = require('../json2wadl');

exports["test json 2 wadl"] = function (test) {
    var desc = {
        path: ':format/user/search/:username',
        method: 'GET',
        id: 'GetUsers',
        doc: 'Returns the users using their username.',
        params: {
            format: {
                style: 'template',
                type: 'string',
                required: true,
                defaultValue: 'json',
                options: {
                    'xml': '',
                    'json': '',
                    'yaml': ''
                }
            },
            username: {
                style: 'query',
                type: 'string',
                required: true,
                defaultValue: 'chacon'
            }
        }
    };

    var wadl = j2w.toWadl([desc], "http://github.com/", { pretty: false });
    var originalWadl = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><application xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:apigee="http://api.apigee.com/wadl/2010/07/" xmlns="http://wadl.dev.java.net/2009/02" xsi:schemaLocation="http://wadl.dev.java.net/2009/02 http://apigee.com/schemas/wadl-schema.xsd http://api.apigee.com/wadl/2010/07/ http://apigee.com/schemas/apigee-wadl-extensions.xsd"><resources base="http://github.com/"><resource path="{format}/user/search/{username}"><param name="format" type="xsd:string" style="template" required="true" default="json"><option value="xml"/><option value="json"/><option value="yaml"/></param><param name="username" type="xsd:string" style="query" required="true" default="chacon"/><method id="GetUsers" name="GET"><doc>Returns the users using their username.</doc></method></resource></resources></application>';
    test.equals(wadl, originalWadl);
    test.done();
};