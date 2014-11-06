/*
The MIT License (MIT)

Copyright (c) 2014 TAUS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

/*
Author: Klemens Waldhör
Version 2.0b / 24.09.2014
Version 2.0c / 25.09.2014
Version 2.0d / 26.09.2014
Version 2.0e / 06.10.2014
Version 2.0f / 07.10.2014
Version 2.0g / 15.10.2014
Version 2.0h / 15.10.2014
Version 2.0i / 06.11.2014

TAUS Translation API – Version 2.0
TAUS Technical Specification -­ A Common Translation Services API - August 2014
2.0 from 20.08.2014
*/

/* Note: Current version requires express 3.0; will be changed to 4.0 with the next version! */

/*
* Pattern: <url>/v2.0/<request method>
* Example: PUT: http://localhost:3412/v2.0/translation/confirm/697a6639-f8e4-47b1-bc77-865b6a9a53c2
*/

/*
 * Changes:
 * v2.0a
 * - added patch methods
 * - added license, header
 * v2.0b:
 * - Path now starts with 2.0
 * - moved various functions outside the direct call app.put('/v2.0/translation/', function(req, res)) to app.put('/v2.0/translation/confirm', confirm) with confirm a function object 
 * - added comments
 * v2.0c
 * - attribute check for post, put of request
 * v2.0d
 * Minor correction: method names as variables
 * v2.0e add check for POST if translation request id is present; if yes, check if valid uuid and use; if invalid error message back (code 400); otherwise generate new id
 * requires: Install the library with `npm install validator` 
 * v2.0f - removed bug with PUT/POST when submitting same id again - https://github.com/TAUSBV/translationapi/issues/20#event-174771316
 * v2.0g
	- + removed in POST for title link
	- Z added to test entries for time
	- json error returns for all implemented methods
 * v2.0h - removed minor bugs
 * v2.0 i 
	- update/patch corrected 
	- modificationDatetime correct name used now
*/


var express = require('express');
var js2xmlparser = require("js2xmlparser");
var fs = require("fs");
// added 06.10.2014 - for checking UUIDs
var validator = require("validator");

var app = express();

app.use(express.bodyParser({uploadDir:'d:/temp/uploads'}));


// generate an unique id for new requests
function generateUUID()
{
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};

var translationRequests; // an arae with translation requests

var translatioRequestsFile = "requests.txt";
// write two initial requests in queue if external file requests.txt does not exist

if (fs.existsSync("requests.txt"))
{
	var requests = fs.readFileSync(translatioRequestsFile, "utf8");
	translationRequests = JSON.parse(requests);
}
else
{
	var id1 = generateUUID();
	var id2 = generateUUID();
	var id3 = generateUUID();
	translationRequests = 
		[
			{ "translationRequest":
				{
					"id": 				id1,
					"sourceLanguage":	"de-DE",	
					"targetLanguage":	"en-US",	
					"source":			"Das ist ein Test.",	
					"target":			null,	
					"mt":				false,
					"crowd":			false,	
					"professional":		false,	
					"postedit":			false,	
					"comment":			"We need a fast translation",
					"translator":		"",	
					"owner":			"TAUS",
					"creationDatetime":	"2014-05-20T19:20:00Z",			
					"status":			"initial",
				}
			},
			{ "translationRequest":
				{
					"id": 				id2,
					"sourceLanguage":	"de-DE",	
					"targetLanguage":	"fr-FR",	
					"source":			"Das ist ein Test nach Französisch.",	
					"target":			"",	
					"mt":				false,
					"crowd":			false,	
					"professional":		false,	
					"postedit":			false,	
					"comment":			"We need a fast translation",
					"translator":		"",	
					"owner":			"Heartsome",
					"creationDatetime":	"2014-05-20T19:20:00Z",
					"status":			"initial"	
				}
			},
			{ "translationRequest":
				{
					"id":				id3,
					"sourceLanguage":	"de-DE",
					"targetLanguage":	"en-GB",
					"source":			"Hallo Welt",
					"professional":		true,
					"mt":				false,
					"creationDatetime":	"2014-05-20T19:20:00Z",
					"updateCounter":	0,
					"status":			"initial"
				}
			}

		];
}

/*********************************************************************************************************/
/*
* Methods supported by the TAUS API
*/

var translationMethodName = '/v2.0/translation/';

var commentMethodName = '/v2.0/comment/';

var scoreMethodName = '/v2.0/score/';

var scoreMethodName = '/v2.0/callback/';

/*********************************************************************************************************/

var allowedAttributes =
{
	translationRequest:
		{
			id: "id",
			callbackURL: "url",
			links: "links",
			sourceLanguage: "language",
			targetLanguage: "language",
			source: "string",
			target: "string",
			mt: ["true", "false"],
			crowd: ["true", "false"],
			professional: ["true", "false"],
			postedit: ["true", "false"],
			comment: "string",
			translator: "string",
			owner: "string",
			creationDatetime: "date",
			modificationDatetime: "date",
			updateCounter: "int",
			status: ["initial", "translated", "reviewed", "final", "rejected", "accepted", "pending", "timeout"]
		},
	comment:
		{
			id: "id",
			referenceId: "id",
			links: "links",
			callbackURL: "url",
			language: "language",
			text: "string",
			creationDatetime: "date",
			modificationDatetime: "date",
		},
	score:
		{
			id: "id",
			requestId: "id",
			links: "links",
			callbackURL: "url",
			score: "int",
			mt: ["true", "false"],
			crowd: ["true", "false"],
			professional: ["true", "false"],
			text: "string",
			creationDatetime: "date",
			modificationDatetime: "date",
		},
	callbackRequest:
		{
			id: "id",
			requestId: "id",
			links: "links",
			callbackURL: "url",
			score: "int",
			mt: ["true", "false"],
			crowd: ["true", "false"],
			professional: ["true", "false"],
			callbackText: "string",
			callbackStatus: "string",
			callBackcreationDatetime: "date"
		}
}

function checkAttribute(method, attribute, value)
{
	var reqallowed = allowedAttributes[method];
	value = value + ""; // make a string anyway for the value
	// console.log("checkAttribute:\n" + reqallowed);
	for (var allowedprop in reqallowed)
	{
		// console.log(allowedprop);
		if (!reqallowed.hasOwnProperty(allowedprop))
		{
			//The current property is not a direct property of p
			continue;
		}
		if (allowedprop == attribute)
		{
			// check value - very explicit here
			var allowedvalue= reqallowed[allowedprop];
			if (allowedvalue instanceof Array)
			{
				for (var i = 0; i < allowedvalue.length; i++) 
				{
					if (allowedvalue[i] == value)
						return true;
				}
				return false;
			}
			else
				return true;
		}
	}
	return false;
}

function checkAttributes(method, request)
{
	if (request == undefined)
	{
		return [false, 400, "Undefined request method", 1000];
	}
	// console.log("checkAttributes:\n" + method + "\nRequest:" + request);
	for (var prop in request)
	{
		if (!request.hasOwnProperty(prop))
		{
			//The current property is not a direct property of p
			continue;
		}
		var value = request[prop];
		var attok = checkAttribute(method, prop, value);
		if (attok == false)
		{
			return [false, 400, "\"" + prop + "\" with value \"" + value + "\" not allowed for request \"" + method + "\"", 1010];
		}
	}
	return [true, 200, "", 0]; // correct request
}



/*********************************************************************************************************/


// save translation request to file

function saveTranslationRequests()
{
	fs.writeFile(translatioRequestsFile, JSON.stringify(translationRequests), function (err) 
	{
		if (err) throw err;
		console.log(translatioRequestsFile + ' saved!');
	});
}

// find the index in the translationRequests array based on the id
function findTranslationRequest(id) 
{
	var index = findTranslationRequestIndex(id);
	if (index != null)
	{
		return translationRequests[index];
	}
	return null;
}

// find the index in the translationRequests array based on the id
// id is either an index itself or the id of the translation index to be search for attribute id
function findTranslationRequestIndex(id) 
{
	try
	{
		var index = parseInt(id);
		if (isNaN(id))
		{
			// we need to check if req.params.id is contained in there
			// console.log("Parsed not an int supplied for id: " + id + " - " + index);
			for (var i = 0; i < translationRequests.length; ++i)
			{
				var transReq = translationRequests[i].translationRequest;
				if (transReq.id == id)
				{
					return i;
				}
			}
			return null;
		}
		else if ((!isNaN(index)) && (index >= 0) && (translationRequests.length > index))
		{
			console.log("Parsed int: " + id + " - " + index);
			return index;
		}
		else
		{
			// we need to check if req.params.id is contained in there
			console.log("Curious case: " + id + " - " + index);
			return null;
		}
	}
	catch(e)
	{
		return null;
	}
}

app.use(express.bodyParser());

/*********************************************************************************************************/
/* 
 * Get all  requests 
 * requires no id, will support filter criteria too
 */

app.get(translationMethodName, function(req, res) 
{
	var method = req.method;
	var url = req.url;
	var da = new Date();
	var d = da.toUTCString();
	res.set('Content-Type', 'application/json');
	res.statusCode = 200;
	res.json(translationRequests);

	console.log("==============================================================================");
	console.log(req);
	console.log("------------------------------------------------------------------------------");
	console.log(res);
	console.log("******************************************************************************");
});

/*********************************************************************************************************/
/* 
 * Get a  request 
 * requires an id
 */

app.get(translationMethodName +':id', function(req, res) 
{
	var method = req.method;
	var url = req.url;
	var da = new Date();
	var d = da.toUTCString();
	var q = findTranslationRequest(req.params.id);
	if (q != null)
	{
		res.set('Content-Type', 'application/json');
		res.statusCode = 200;
		res.json(200, q);
		return;
	}

	res.statusCode = 404;

	// return res.send('Error 404: No translationRequest ' + req.params.id + ' found');
	
	console.log("==============================================================================");
	console.log(req);
	console.log("------------------------------------------------------------------------------");
	console.log(res);
	console.log("******************************************************************************");
	var errormessage = "Method: " + method + " Url: " + url + " No translationRequest found " + req.params.id;
	res.json( { error: { id: req.params.id, dateTime: d, errorMessage: errormessage, httpCode: 404, errorCode: 4000, method: method, url: url, request: "translationRequest" } });
	return;
});

/*********************************************************************************************************/
/* 
 * Get status of a request 
 * requires an id
 */
 
app.get(translationMethodName +'status/:id', function(req, res) 
{
	// console.log(req);
	var method = req.method;
	var url = req.url;
	var da = new Date();
	var d = da.toUTCString();
	var q = findTranslationRequest(req.params.id);
	// console.log(q);
	if (q != null)
	{
		res.set('Content-Type', 'application/json');
		res.statusCode = 200;
		var qraw = q.translationRequest;
		result = { "id": qraw.id, "status": qraw.status };
		// console.log(result);
		res.json(200, result);
		return;
	}

	res.statusCode = 404;
	var errormessage = "Method: " + method + " Url: " + url + " No translationRequest found " + req.params.id;
	res.json( { error: { id: req.params.id, dateTime: d, errorMessage: errormessage, httpCode: 404, errorCode: 4010, method: method, url: url, request: "translationRequest" } });
	return;
});

/*********************************************************************************************************/
/* 
 * Update a request 
 * requires an id - both put and patch
 */

function update(req, res) 
{
	var request = req.body.translationRequest;
	var method = req.method;
	var url = req.url;
	var da = new Date();
	var d = da.toUTCString();
	if (request == undefined)
	{
		console.log(req);
		console.log("Method: " + method + " Url: " + url);
		res.statusCode = 400;
		// return res.send('Error 400: Put/Patch (update) syntax incorrect. translationRequest for PUT property missing');
		var errormessage = "Method: " + method + " Url: " + url + " Put/Patch (update) syntax incorrect. translationRequest for PUT property missing " + req.params.id;
		res.json( { error: { id: req.params.id, dateTime: d, errorMessage: errormessage, httpCode: 400, errorCode: 5000, method: method, url: url, request: "translationRequest" } });
		return;
	}
	
	var correctAttributes = checkAttributes("translationRequest", request);
	// check for id and generate if necessary
	var id = generateUUID();
	console.log(correctAttributes);
	// return [false, 400, "\"" + prop + "\" with value \"" + value + "\" not allowed for request \"" + method + "\""];
	if (correctAttributes[0] == false)
	{
		res.statusCode = correctAttributes[1];
		res.json( { error: { id: id, requestId: req.params.id, dateTime: d, errorMessage: correctAttributes[2], httpCode: correctAttributes[1], errorCode: correctAttributes[3], method: method, url: url, request: "translationRequest" } });
		return; // 06.11.2014
	}
	
	var i = findTranslationRequestIndex(req.params.id); // need to adapt to the real id!
	if (i != null)
	{
		if (request.mt != undefined)
			translationRequests[i].translationRequest.mt = 					request.mt;
		if (request.sourceLanguage != undefined)
			translationRequests[i].translationRequest.sourceLanguage =  	request.sourceLanguage;
		if (request.targetLanguage != undefined)
			translationRequests[i].translationRequest.targetLanguage =  	request.targetLanguage;
		if (request.source != undefined)
			translationRequests[i].translationRequest.source = 				request.source;
		if (request.target != undefined)
			translationRequests[i].translationRequest.target = 				request.target;
		if (request.crowd != undefined)
			translationRequests[i].translationRequest.crowd =				request.crowd;	
		if (request.professional != undefined)
			translationRequests[i].translationRequest.professional =		request.professional;	
		if (request.postedit != undefined)
			translationRequests[i].translationRequest.postedit =			request.postedit;	
		if (request.comment != undefined)
			translationRequests[i].translationRequest.comment =				request.comment;
		if (request.translator != undefined)
			translationRequests[i].translationRequest.translator =			request.translator;	
		if (request.owner != undefined)
			translationRequests[i].translationRequest.owner =				request.owner;
		if (request.status != undefined)
			translationRequests[i].translationRequest.status =				request.status;
		
		// 06.11.2014 modificationDatetime - problem solved
		if (request.modificationDatetime != undefined)
			translationRequests[i].translationRequest.modificationDatetime =		request.modificationDatetime;
		else	
			translationRequests[i].translationRequest.modificationDatetime =		d;
		if (request.creationDatetime != undefined)
			translationRequests[i].translationRequest.creationDatetime =			request.creationDatetime;
		//
		
		if (translationRequests[i].translationRequest.updateCounter == undefined)
			translationRequests[i].translationRequest.updateCounter = 1;
		else if (translationRequests[i].translationRequest.updateCounter == null)
			translationRequests[i].translationRequest.updateCounter = 1;
		else
			translationRequests[i].translationRequest.updateCounter =		translationRequests[i].translationRequest.updateCounter + 1;
		saveTranslationRequests();
		res.statusCode = 200;
		res.json(translationRequests[i]);
		return;
	}

	res.statusCode = 404;
	// return res.send('Error 404: No translationRequest ' + req.params.id + ' found');
	var errormessage = "Method: " + method + " Url: " + url + " No translationRequest id found " + req.params.id;
	res.json( { error: { id: req.params.id, dateTime: d, errorMessage: errormessage, httpCode: 404, errorCode: 5000, method: method, url: url, request: "translationRequest" } });
	return;
}

app.put(translationMethodName +':id', update);
app.patch(translationMethodName +':id', update);

/*********************************************************************************************************/
/* 
 * Confirm a request 
 * requires an id - both put and patch
 */

function confirm(req, res) 
{
	var method = req.method;
	var url = req.url;
	var da = new Date();
	var d = da.toUTCString();
	var i = findTranslationRequestIndex(req.params.id); // need to adapt to the real id!
	if (i != null)
	{
		translationRequests[i].translationRequest.status =					"confirmed";
		translationRequests[i].translationRequest.modificationDate =		d;
		
		if (translationRequests[i].translationRequest.updateCounter == undefined)
			translationRequests[i].translationRequest.updateCounter = 1;
		else if (translationRequests[i].translationRequest.updateCounter == null)
			translationRequests[i].translationRequest.updateCounter = 1;
		else
			translationRequests[i].translationRequest.updateCounter =		translationRequests[i].translationRequest.updateCounter + 1;
		saveTranslationRequests();
		res.statusCode = 200;
		res.json(translationRequests[i]);
		return;
	}

	res.statusCode = 404;
	// return res.send('Error 404: No translationRequest ' + req.params.id + ' found');
	var errormessage = "Method: " + method + " Url: " + url + " No translationRequest id found " + req.params.id;
	res.json( { error: { id: req.params.id, dateTime: d, errorMessage: errormessage, httpCode: 404, errorCode: 5000, method: method, url: url, request: "translationRequest" } });
	return;
}

app.put(translationMethodName +'confirm/:id', confirm);
app.patch(translationMethodName +'confirm/:id', confirm);

/*********************************************************************************************************/
/* 
 * Cancel a request 
 * requires an id - both put and patch
 */
 
function cancel(req, res) 
{
	var method = req.method;
	var url = req.url;
	var da = new Date();
	var d = da.toUTCString();
	var i = findTranslationRequestIndex(req.params.id); // need to adapt to the real id!
	if (i != null)
	{
		translationRequests[i].translationRequest.status =					"cancel";
		translationRequests[i].translationRequest.modificationDate =		new Date();
		
		if (translationRequests[i].translationRequest.updateCounter == undefined)
			translationRequests[i].translationRequest.updateCounter = 1;
		else if (translationRequests[i].translationRequest.updateCounter == null)
			translationRequests[i].translationRequest.updateCounter = 1;
		else
			translationRequests[i].translationRequest.updateCounter =		translationRequests[i].translationRequest.updateCounter + 1;
		saveTranslationRequests();
		res.statusCode = 200;
		res.json(translationRequests[i]);
		return;
	}

	res.statusCode = 404;
	var errormessage = "Method: " + method + " Url: " + url + " No translationRequest id found " + req.params.id;
	res.json( { error: { id: req.params.id, dateTime: d, errorMessage: errormessage, httpCode: 404, errorCode: 5010, method: method, url: url, request: "translationRequest" } });
	return;
}

app.put(translationMethodName +'cancel/:id', cancel);
app.patch(translationMethodName +'cancel/:id', cancel);

/*********************************************************************************************************/
/* 
 * Reject a request 
 * requires an id - both put and patch
 */

function reject(req, res) 
{
	var method = req.method;
	var url = req.url;
	var da = new Date();
	var d = da.toUTCString();
	var i = findTranslationRequestIndex(req.params.id); // need to adapt to the real id!
	if (i != null)
	{
		translationRequests[i].translationRequest.status =					"reject";
		translationRequests[i].translationRequest.modificationDate =		d;
		
		if (translationRequests[i].translationRequest.updateCounter == undefined)
			translationRequests[i].translationRequest.updateCounter = 1;
		else if (translationRequests[i].translationRequest.updateCounter == null)
			translationRequests[i].translationRequest.updateCounter = 1;
		else
			translationRequests[i].translationRequest.updateCounter =		translationRequests[i].translationRequest.updateCounter + 1;
		saveTranslationRequests();
		res.statusCode = 200;
		res.json(translationRequests[i]);
		return;
	}

	res.statusCode = 404;
	// return res.send('Error 404: No translationRequest ' + req.params.id + ' found');
	var errormessage = "Method: " + method + " Url: " + url + " No translationRequest id found " + req.params.id;
	res.json( { error: { id: req.params.id, dateTime: d, errorMessage: errormessage, httpCode: 404, errorCode: 5020, method: method, url: url, request: "translationRequest" } });
	return;
}

app.put(translationMethodName +'reject/:id', reject);
app.patch(translationMethodName +'reject/:id', reject);

/*********************************************************************************************************/
/* 
 * Accept a request 
 * requires an id - both put and patch
 */

function accept (req, res) 
{
	var method = req.method;
	var url = req.url;
	var da = new Date();
	var d = da.toUTCString();
	var i = findTranslationRequestIndex(req.params.id); // need to adapt to the real id!
	if (i != null)
	{
		translationRequests[i].translationRequest.status =					"accept";
		translationRequests[i].translationRequest.modificationDate =		d;
	
		if (translationRequests[i].translationRequest.updateCounter == undefined)
			translationRequests[i].translationRequest.updateCounter = 1;
		else if (translationRequests[i].translationRequest.updateCounter == null)
			translationRequests[i].translationRequest.updateCounter = 1;
		else
			translationRequests[i].translationRequest.updateCounter =		translationRequests[i].translationRequest.updateCounter + 1;
		saveTranslationRequests();
		res.statusCode = 200;
		res.json(translationRequests[i]);
		return;
	}

	res.statusCode = 404;
	// return res.send('Error 404: No translationRequest ' + req.params.id + ' found');
	var errormessage = "Method: " + method + " Url: " + url + " No translationRequest id found " + req.params.id;
	res.json( { error: { id: req.params.id, dateTime: d, errorMessage: errormessage, httpCode: 404, errorCode: 5030, method: method, url: url, request: "translationRequest" } });
	return;
}

app.put(translationMethodName +'accept/:id', accept);
app.patch(translationMethodName +'accept/:id', accept);

/*********************************************************************************************************/
/* 
 * Create a new request 
 * can be used for post and put with
 */
 
function createNewRequest(req, res) 
{
	var request = req.body.translationRequest;
	var method = req.method;
	var url = req.url;
	var da = new Date();
	var d = da.toUTCString();
	if (request == undefined)
	{
		console.log(req);
		console.log("Method: " + method + " Url: " + url);
		res.statusCode = 400;
		// return res.send('Error 400: Post/Put (create) syntax incorrect. translationRequest for POST property missing');
		var errormessage = "Method: " + method + " Url: " + url;
		res.json( { error: { id: "Undefined", dateTime: d, errorMessage: errormessage, httpCode: 400, errorCode: 2000, method: method, url: url, request: "translationRequest" } });
		return;
	}
	console.log(req);
	// console.log(req.body);
    // console.log(req.files);

	var correctAttributes = checkAttributes("translationRequest", request);
	console.log("Request ID: " + request.id);
	if (request.id != undefined)
	{
		if (!validator.isUUID(request.id)) // error
		{
			// console.log(req);
			var errormessage = "Method: " + method + " Url: " + url + " Wrong UUID: " + request.id;
			console.log("Method: " + method + " Url: " + url + " Wrong UUID: " + request.id);
			res.statusCode = 400;
			res.json( { error: { id: request.id, dateTime: d, errorMessage: errormessage, httpCode: 400, errorCode: 2010, method: method, url: url, request: "translationRequest" } });
			return;
			//return res.send('Error 400: POST/PUT syntax incorrect. UUID structure supplied not correct: ' + request.id);
		}
		// 07.10.2014 - check if id exists
		var i = findTranslationRequestIndex(request.id); // find id
		if (i != null)
		{
			console.log("Method: " + method + " Url: " + url + " Wrong UUID: " + request.id);
			res.statusCode = 400;
			// return res.send('Error 400: POST/PUT incorrect. UUID exist: ' + request.id);
			var errormessage = "Method: " + method + " Url: " + url + " POST/PUT incorrect. UUID exist: " + request.id;
			res.json( { error: { id: request.id, dateTime: d, errorMessage: errormessage, httpCode: 400, errorCode: 2020, method: method, url: url, request: "translationRequest" } });
			return;
		}
		
		id = request.id; 
	}
	else
	{
		id = generateUUID();
	}
	console.log(correctAttributes);
	// return [false, 400, "\"" + prop + "\" with value \"" + value + "\" not allowed for request \"" + method + "\""];
	if (correctAttributes[0] == false)
	{
		res.statusCode = correctAttributes[1];
		res.json( { error: { id: id, dateTime: d, errorMessage: correctAttributes[2], httpCode: correctAttributes[1], errorCode: correctAttributes[3], method: method, url: url, request: "translationRequest" } });
		return;
	}
	

	var url = "http://" + req.headers.host; // how to get the http part of host???? e.g. if it is https??
	// this are some test links will require a description how to define them depending on request method, status ...
	var links = 

		[
			{ 
				"rel": "translation",
				"href": url + translationMethodName + id,
				"type": "application/json",
				"title": "Newly created translation request " + id + " created on " + " " + d,
				"type": "application/json",
				"verb": "GET"
			},
			{ 
				"rel": "translation",
				"href": url + translationMethodName + id,
				"type": "application/json",
				"title": "Delete translation request " + id + " created on " + " " + d,
				"type": "application/json",
				"verb": "DELETE"
			},
			{ 
				"rel": "translation.cancel",
				"href": url + translationMethodName +"cancel/" + id,
				"title": "Cancel translation request " + id,
				"type": "application/json",
				"verb": "PATCH"
			},
			{ 
				"rel": "translation.reject",
				"href": url + translationMethodName +"reject/" + id,
				"title": "Reject translation request " + id,
				"type": "application/json",
				"verb": "PATCH"
			},
			{ 
				"rel": "translation.status",
				"href": url + translationMethodName +"status/" + id,
				"title": "Status of translation request " + id,
				"type": "application/json",
				"verb": "PATCH"
			},
			{ 
				"rel": "translation.confirm",
				"href": url + translationMethodName + "confirm/" + id,
				"title": "Confirm translation request " + id,
				"type": "application/json",
				"verb": "PATCH"
			},
			{ 
				"rel": "translation.accept",
				"href": url + translationMethodName + "accept/" + id,
				"title": "Accept translation request " + id,
				"type": "application/json",
				"verb": "PATCH"
			},
			{ 
				"rel": "translation.patch",
				"href": url + translationMethodName + id,
				"title": "Patch translation request " + id,
				"type": "application/json",
				"verb": "PATCH"
			},
			{ 
				"rel": "translation.put",
				"href": url + translationMethodName + id,
				"title": "PUT translation request " + id,
				"type": "application/json",
				"verb": "PUT"
			}
		]
	;
	
	var newQuote = 
	{
		id: id,
		sourceLanguage : request.sourceLanguage,
		targetLanguage : request.targetLanguage,
		source : 		request.source,
		target : 		request.target,
		mt:				request.mt,
		crowd:			request.crowd,	
		professional:	request.professional,	
		postedit:		request.postedit,	
		comment:		request.comment,
		translator:		request.translator,	
		owner:			request.owner,
		status:			request.status,
		creationDatetime: d,
		updateCounter: 0,
		links: links
	};
	
	var newTranslationRequest = 
	{
		translationRequest: newQuote
	}

	translationRequests.push(newTranslationRequest);

	saveTranslationRequests();
	res.statusCode = 201;
	res.json(newQuote);
}

app.post(translationMethodName, createNewRequest);
app.put(translationMethodName, createNewRequest); // just for security, not really needed

/*********************************************************************************************************/
/* 
 * Delete a  request 
 * requires an id
 */

app.delete(translationMethodName +':id', function(req, res) 
{
	var method = req.method;
	var url = req.url;
	var d = new Date();
	var index = findTranslationRequestIndex(req.params.id);
	if (index != null)
	{
		console.log("delete: " + req.params.id + " >> " + index + " - translationRequests: " + translationRequests.length);
		translationRequests.splice(index, 1);
		saveTranslationRequests();
		console.log("delete - translationRequests: " + translationRequests.length);
		res.statusCode = 204;
		res.json(true);
		return;
	}
	else
	{
		console.log("delete: " + req.params.id + " not found ");
	}

	res.statusCode = 404;
	// res.json(false);
	// return res.send('Error 404: No translationRequest ' + req.params.id + ' found');
	var errormessage = "Method: " + method + " Url: " + url + " No translationRequest found " + req.params.id;
	res.json( { error: { id: req.params.id, dateTime: d, errorMessage: errormessage, httpCode: 404, errorCode: 3000, method: method, url: url, request: "translationRequest" } });
	return;
});

/*********************************************************************************************************/

app.listen(process.env.PORT || 3412);
console.log("Listening on port " + 3412);
