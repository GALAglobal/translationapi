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
Version 2.0a

TAUS Translation API – Version 2.0
TAUS Technical Specification -­ A Common Translation Services API - August 2014
2.0 from 20.08.2014
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

app.get('/translation/', function(req, res) 
{
	res.set('Content-Type', 'application/json');
	res.statusCode = 200;
	res.json(translationRequests);

  console.log("=============================================================================");
  console.log(req);
  console.log("------------------------------------------------------------------------------");
  console.log(res);
});

app.get('/translation/:id', function(req, res) 
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

app.get('/translation/status/:id', function(req, res) 
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

app.put('/translation', function(req, res) 
{
	var request = req.body.translationRequest;
	if (request == undefined)
	{
		console.log(req);
		res.statusCode = 400;
		return res.send('Error 400: Post syntax incorrect. translationRequest for PUT property missing');
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
			translationRequests[i].translationRequest.updateCounter =		request.updateCounter + 1;
		saveTranslationRequests();
		res.statusCode = 201;
		res.json(translationRequests[i]);
		return;
	}

	res.statusCode = 404;
	return res.send('Error 404: No translationRequest ' + req.params.id + ' found');
});

app.put('/translation/:id', function(req, res) 
{
	var request = req.body.translationRequest;
	if (request == undefined)
	{
		console.log(req);
		res.statusCode = 400;
		return res.send('Error 400: Post syntax incorrect. translationRequest for PUT property missing');
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
});

app.patch('/translation/:id', function(req, res) 
{
	var request = req.body.translationRequest;
	if (request == undefined)
	{
		console.log(req);
		res.statusCode = 400;
		return res.send('Error 400: Post syntax incorrect. translationRequest for PUT property missing');
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
});

app.put('/translation/confirm/:id', function(req, res) 
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
});

app.patch('/translation/confirm/:id', function(req, res) 
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
});

app.put('/translation/cancel/:id', function(req, res) 
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
});

app.patch('/translation/cancel/:id', function(req, res) 
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
});

app.put('/translation/reject/:id', function(req, res) 
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
});

app.patch('/translation/reject/:id', function(req, res) 
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
});

app.put('/translation/accept/:id', function(req, res) 
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
});

app.patch('/translation/accept/:id', function(req, res) 
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
});

app.post('/translation/', function(req, res) 
{
	/*
	if(!req.body.hasOwnProperty('translationRequest')) 
		// || !req.body.hasOwnProperty('targetLanguage') 
		// || !req.body.hasOwnProperty('source')) 
	{
		res.statusCode = 400;
		return res.send('Error 400: Post syntax incorrect.');
	}
	
	*/
	
	var request = req.body.translationRequest;
	if (request == undefined)
	{
		console.log(req);
		res.statusCode = 400;
		return res.send('Error 400: Post syntax incorrect. translationRequest for POST property missing');
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
});

app.delete('/translation/:id', function(req, res) 
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

app.listen(process.env.PORT || 3412);