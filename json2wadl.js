//
// Transform a wadl description in json to a wadl description in xml
// NOTE: the json representation supports only a subset of WADL
//

// The following is an example of WADL xml
//<?xml version="1.0" encoding="UTF-8"?>

//<application xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
//	xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:apigee="http://api.apigee.com/wadl/2010/07/"
//	xmlns="http://wadl.dev.java.net/2009/02" xmlns:t="urn:github:githubresponse"
//	xsi:schemaLocation="http://wadl.dev.java.net/2009/02 http://apigee.com/schemas/wadl-schema.xsd http://api.apigee.com/wadl/2010/07/ http://apigee.com/schemas/apigee-wadl-extensions.xsd">

//	<resources base="http://github.com/">

//		<resource path="{format}/user/search/{username}">
//			<param name="format" type="xsd:string" style="template" required="true" default="json">
//				<option value="xml" mediaType="application/xml"/>
//				<option value="json" mediaType="application/json"/>
//				<option value="yaml" mediaType="application/yaml"/>
//			</param>
//			<param name="username" required="true" type="xsd:string" style="query" default="chacon"/>
//			<method id="GetUsers" apigee:displayName="GetUsers" name="GET">
//				<apigee:tags>
//					<apigee:tag primary="true">Users</apigee:tag>
//				</apigee:tags>
//				<apigee:authentication required="false" />
//				<apigee:example url="api/v2/{format}/user/search/{userName}"/>
//				<doc title="" apigee:url="http://develop.github.com/p/users">
//					Returns the users using their username.
//				</doc>
//			</method>
//		</resource>
//	</resources>
//</application>

//var desc = {
//    path: ':format/user/search/:username',
//    method: 'GET',
//    id: 'GetUsers',
//    doc: 'Returns the users using their username.',
//    params: {
//        format: {
//            style: 'template',
//            type: 'string',
//            required: true,
//            defaultValue: 'json',
//            options: {
//                'json': '',
//                'xml': ''
//            }
//        },
//        username: {
//            style: 'query',
//            type: 'string',
//            required: true,
//            defaultValue: 'chacon'
//        }
//    }
//}

var builder = require('xmlbuilder');
var sinatraPathRegex = /:(.*?)(\/|$)/g;

var WadlHelper = {
    sinatraPathToWADL: function (path) {
        return path.replace(sinatraPathRegex, "{$1}$2");
    },
    toXsdType: function (type) {
        return "xsd:" + type.toLowerCase();
    },
    createWADLDoc: function (baseUrl) {
        var doc = builder.create();
        return doc.begin('application', { 'version': '1.0', 'encoding': 'UTF-8', 'standalone': true })
            .att("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
            .att("xmlns:xsd", "http://www.w3.org/2001/XMLSchema")
            .att("xmlns:apigee", "http://api.apigee.com/wadl/2010/07/")
            .att("xmlns", "http://wadl.dev.java.net/2009/02")
            .att("xsi:schemaLocation", "http://wadl.dev.java.net/2009/02 http://apigee.com/schemas/wadl-schema.xsd http://api.apigee.com/wadl/2010/07/ http://apigee.com/schemas/apigee-wadl-extensions.xsd")
                .ele('resources')
                .att('base', baseUrl);
    },
    addParamsToElement: function (params, element) {
        var param,
            paramDesc,
            option,
            paramEle;

        for (param in params) {
            paramDesc = params[param];
            paramEle = element.ele('param', { 'name': param });
            if (paramDesc.type) paramEle.att('type', this.toXsdType(paramDesc.type));
            if (paramDesc.style) paramEle.att('style', paramDesc.style);
            if (paramDesc.required) paramEle.att('required', paramDesc.required);
            if (paramDesc.defaultValue) paramEle.att('default', paramDesc.defaultValue);
            if (paramDesc.doc) paramEle.ele('doc', paramDesc.doc);
            if (paramDesc.options) {
                for (option in paramDesc.options) {
                    paramEle.ele('option', { 'value': option });
                }
            }
        }
    },
    addMethodToWADLDoc: function (methodJson, resoucesElement) {
        var path = this.sinatraPathToWADL(methodJson.path),
            resource = resoucesElement.ele('resource'),
            representation,
            representationEle,
            requestEle,
            responseEle,
            methodEle,
            i,
            l;

        resource.att('path', path);

        if (methodJson.params) {
            this.addParamsToElement(methodJson.params, resource);
        }

        methodEle = resource.ele('method');
        if (methodJson.id) methodEle.att('id', methodJson.id);
        methodEle.att('name', methodJson.method); // required
        if (methodJson.doc) methodEle.ele('doc', methodJson.doc);

        if (methodJson.request) {
            requestEle = methodEle.ele('request');
            if (methodJson.request.doc) requestEle.ele('doc', methodJson.request.doc);
            if (methodJson.request.params) {
                this.addParamsToElement(methodJson.request.params, requestEle);
            }
        }

        if (methodJson.response) {
            responseEle = methodEle.ele('response');
            if (methodJson.response.doc) requestEle.ele('doc', methodJson.response.doc);
            if (methodJson.response.representations) {
                for(i = 0, l = methodJson.response.representations.length; i < l; i++) {
                    representation = methodJson.response.representations[i];
                    representationEle = responseEle.ele('representation ').att('mediaType',representation );
                }
            }
        }

        return resource.up();
    }
};

exports.toWadl = function (methodJsons, baseUrl, format) {
    var resoucesElement = WadlHelper.createWADLDoc(baseUrl),
        doc = resoucesElement.doc(),
        methodJson,
        i,
        l;

    for (i = 0, l = methodJsons.length; i < l; i++) {
        methodJson = methodJsons[i];
        WadlHelper.addMethodToWADLDoc(methodJson, resoucesElement);
    }

    if (!format) {
        format = { 'pretty': true, 'indent': '  ', 'newline': '\n' };
    }

    return doc.toString(format);
};