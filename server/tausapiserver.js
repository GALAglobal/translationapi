var express = require('express');
var fs = require("fs");

var app = express();

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
				"sourceLanguage":	"de",	
				"targetLanguage":	"en",	
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
				"sourceLanguage":	"de",	
				"sourceLanguage":	"fr",	
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
				"sourceLanguage":	"de-de",
				"targetLanguage":	"en-en",
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
  res.json(translationRequests);
  res.statusCode = 201;
});

app.get('/translation/:id', function(req, res) 
{
	var q = findTranslationRequest(req.params.id);
	if (q != null)
	{
		res.json(q);
		res.statusCode = 201;
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
			translationRequests[i].translationRequest.updateCounter =		request.updateCounter + 1;
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

	var d = new Date();
	
	var newQuote = 
	{
		id: generateUUID(),
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
		updateCounter: 0
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
		res.statusCode = 200;
		res.json(true);
		return;
	}

	res.statusCode = 404;
	res.json(false);
	return res.send('Error 404: No translationRequest ' + req.params.id + ' found');

});

app.listen(process.env.PORT || 3412);