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
*/


var express = require('express');
var js2xmlparser = require("js2xmlparser");
var fs = require("fs");

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
// write two inition requests in queue if external file requests.txt does not exist

if (fs.existsSync("requests.txt"))
{
	var requests = fs.readFileSync(translatioRequestsFile, "utf8");
	translationRequests = JSON.parse(requests);
}
else
{
 translationRequests = 
	[
		{ "translationRequest":
			{
				"id": 				generateUUID(),
				"sourceLanguage":	"DE-DE",	
				"targetLanguage":	"EN-US",	
				"source":			"Das ist ein Test.",	
				"target":			null,	
				"mt":				false,
				"crowd":			false,	
				"professional":		false,	
				"postedit":			false,	
				"comment":			"We need a fast translation",
				"translator":		"",	
				"owner":			"TAUS",
				"creationDatetime":	"2014-05-20T19:20+01:00",			
				"status":			"initial"	
			}
		},
		{ "translationRequest":
			{
				"id": 				generateUUID(),
				"sourceLanguage":	"DE-DE",	
				"sourceLanguage":	"FR-FR",	
				"source":			"Das ist ein Test nach Französisch.",	
				"target":			"",	
				"mt":				false,
				"crowd":			false,	
				"professional":		false,	
				"postedit":			false,	
				"comment":			"We need a fast translation",
				"translator":		"",	
				"owner":			"Heartsome",
				"creationDatetime":	"2014-05-20T19:20+01:00",
				"status":			"initial"	
			}
		},
		{ "translationRequest":
			{
				"id":				generateUUID(),
				"sourceLanguage":	"DE-DE",
				"targetLanguage":	"EN-GB",
				"source":			"Hallo Welt",
				"professional":		true,
				"mt":				false,
				"creationDatetime":	"2014-05-20T19:20+01:00",
				"updateCounter":	0,
				"status":			"initial"
			}
		}

	];
}

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
// id is either an index itself or the id of the translation inex to be search for attribute id
function findTranslationRequestIndex(id) 
{
	try
	{
		var index = parseInt(id);
		if ((!isNaN(index)) && (index >= 0) && (translationRequests.length > index))
		{
			return index;
		}
		else
		{
			// we need to check if req.params.id is contained in there
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

app.get('/v2.0/translation/', function(req, res) 
{
	res.set('Content-Type', 'application/json');
	res.statusCode = 200;
	res.json(translationRequests);

  console.log("=============================================================================");
  console.log(req);
  console.log("------------------------------------------------------------------------------");
  console.log(res);
});

/*********************************************************************************************************/
/* 
 * Get a  request 
 * requires an id
 */

app.get('/v2.0/translation/:id', function(req, res) 
{
	var q = findTranslationRequest(req.params.id);
	if (q != null)
	{
		res.set('Content-Type', 'application/json');
		res.statusCode = 200;
		res.json(200, q);
		return;
	}

	res.statusCode = 404;
	return res.send('Error 404: No translationRequest ' + req.params.id + ' found');
});

/*********************************************************************************************************/
/* 
 * Get status of a request 
 * requires an id
 */
 
app.get('/v2.0/translation/status/:id', function(req, res) 
{
	// console.log(req);
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
	return res.send('Error 404: No translationRequest ' + req.params.id + ' found');
});

/*********************************************************************************************************/
/* 
 * Update a request 
 * requires an id - both put and patch
 */

function update(req, res) 
{
	var request = req.body.translationRequest;
	if (request == undefined)
	{
		console.log(req);
		res.statusCode = 400;
		return res.send('Error 400: Put/Patch syntax incorrect. translationRequest for PUT property missing');
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
	return res.send('Error 404: No translationRequest ' + req.params.id + ' found');
}

app.put('/v2.0/translation/:id', update);
app.patch('/v2.0/translation/:id', update);

/*********************************************************************************************************/
/* 
 * Confirm a request 
 * requires an id - both put and patch
 */

function confirm(req, res) 
{
	var i = findTranslationRequestIndex(req.params.id); // need to adapt to the real id!
	if (i != null)
	{
		translationRequests[i].translationRequest.status =					"confirmed";
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
	return res.send('Error 404: No translationRequest ' + req.params.id + ' found');
}

app.put('/v2.0/translation/confirm/:id', confirm);
app.patch('/v2.0/translation/confirm/:id', confirm);

/*********************************************************************************************************/
/* 
 * Cancel a request 
 * requires an id - both put and patch
 */
 
function cancel(req, res) 
{
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
	return res.send('Error 404: No translationRequest ' + req.params.id + ' found');
}

app.put('/v2.0/translation/cancel/:id', cancel);
app.patch('/v2.0/translation/cancel/:id', cancel);

/*********************************************************************************************************/
/* 
 * Reject a request 
 * requires an id - both put and patch
 */

function reject(req, res) 
{
	var i = findTranslationRequestIndex(req.params.id); // need to adapt to the real id!
	if (i != null)
	{
		translationRequests[i].translationRequest.status =					"reject";
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
	return res.send('Error 404: No translationRequest ' + req.params.id + ' found');
}

app.put('/v2.0/translation/reject/:id', reject);
app.patch('/v2.0/translation/reject/:id', reject);

/*********************************************************************************************************/
/* 
 * Accept a request 
 * requires an id - both put and patch
 */

function accept (req, res) 
{
	var i = findTranslationRequestIndex(req.params.id); // need to adapt to the real id!
	if (i != null)
	{
		translationRequests[i].translationRequest.status =					"accept";
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
	return res.send('Error 404: No translationRequest ' + req.params.id + ' found');
}

app.put('/v2.0/translation/accept/:id', accept);
app.patch('/v2.0/translation/accept/:id', accept);

/*********************************************************************************************************/
/* 
 * Create a new request 
 * can be used for post and put with
 */
 
function createNewRequest(req, res) 
{

	var request = req.body.translationRequest;
	if (request == undefined)
	{
		console.log(req);
		res.statusCode = 400;
		return res.send('Error 400: Post/Put syntax incorrect. translationRequest for POST property missing');
	}
	console.log(req);
	// console.log(req.body);
    // console.log(req.files);

	var d = new Date();
	
	var id = generateUUID();
	var url = "http://" + req.headers.host; // how to get the http part of host???? e.g. if it is https??
	// this are some test links will require a description how to define them depending on request method, status ...
	var links = 

		[
			{ 
				"rel": "translation",
				"href": url + "/translation/" + id,
				"type": "application/json",
				"title": "Newly created translation request " + id + " + created on " + " " + d,
				"type": "application/json",
				"verb": "GET"
			},
			{ 
				"rel": "translation.cancel",
				"href": url + "http://localhost:3412/translation/cancel/" + id,
				"type": "application/json",
				"verb": "PATCH"
			},
			{ 
				"rel": "translation.confirm",
				"href": url + "http://localhost:3412/translation/cancel/" + id,
				"type": "application/json",
				"verb": "PATCH"
			},
			{ 
				"rel": "translation.reject",
				"href": url + "http://localhost:3412/translation/cancel/" + id,
				"type": "application/json",
				"verb": "PATCH"
			},
			{ 
				"rel": "translation.patch",
				"href": url + "http://localhost:3412/translation/" + id,
				"type": "application/json",
				"verb": "PATCH"
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

app.post('/v2.0/translation/', createNewRequest);
app.put('/v2.0/translation/', createNewRequest); // just for security, not really needed

/*********************************************************************************************************/
/* 
 * Delete a  request 
 * requires an id
 */

app.delete('/v2.0/translation/:id', function(req, res) 
{
	var index = findTranslationRequestIndex(req.params.id) 
	if (index != null)
	{
		translationRequests.splice(index, 1);
		saveTranslationRequests();
		res.statusCode = 204;
		res.json(true);
		return;
	}

	res.statusCode = 404;
	res.json(false);
	return res.send('Error 404: No translationRequest ' + req.params.id + ' found');

});

/*********************************************************************************************************/

app.listen(process.env.PORT || 3412);