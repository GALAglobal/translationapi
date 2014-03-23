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

var translationRequests; // an raaray with translation requests

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
		{
			"id": generateUUID(),
			"sourcelanguage":	"de",	
			"targetlanguage":	"en",	
			"source":	"Das ist ein Test.",	
			"target":	"",	
			"mt":	"n",
			"crowd":	"n",	
			"professional":	"n",	
			"postedit":	"n",	
			"comment":	"We need a fast translation",
			"translator":	"",	
			"owner":	"TAUS",
			"status":	"initial"	
		},
		{
			"id": generateUUID(),
			"sourcelanguage":	"de",	
			"targetlanguage":	"fr",	
			"source":	"Das ist ein Test nach Französisch.",	
			"target":	"",	
			"mt":	"n",
			"crowd":	"n",	
			"professional":	"n",	
			"postedit":	"n",	
			"comment":	"We need a fast translation",
			"translator":	"",	
			"owner":	"Heartsome",
			"status":	"initial"	
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
				if (translationRequests[i].id == id)
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
	var i = findTranslationRequestIndex(req.params.id); // need to adapt to the real id!
	if (i != null)
	{
		translationRequests[i].mt = 			req.body.mt;
		translationRequests[i].sourcelanguage = req.body.sourcelanguage;
		translationRequests[i].targetlanguage = req.body.targetlanguage,
		translationRequests[i].source = 		req.body.source,
		translationRequests[i].target = 		req.body.target,
		translationRequests[i].crowd =			req.body.crowd,	
		translationRequests[i].professional =	req.body.professional,	
		translationRequests[i].postedit =		req.body.postedit,	
		translationRequests[i].comment =		req.body.comment,
		translationRequests[i].translator =		req.body.translator,	
		translationRequests[i].owner =			req.body.owner,
		translationRequests[i].status =			req.body.status
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
	if(!req.body.hasOwnProperty('sourcelanguage') 
		|| !req.body.hasOwnProperty('targetlanguage') 
		|| !req.body.hasOwnProperty('source')) 
	{
		res.statusCode = 400;
		return res.send('Error 400: Post syntax incorrect.');
	}

	var newQuote = 
	{
		id: generateUUID(),
		sourcelanguage : req.body.sourcelanguage,
		targetlanguage : req.body.targetlanguage,
		source : req.body.source,
		target : req.body.target,
		mt:	req.body.mt,
		crowd:	req.body.crowd,	
		professional:	req.body.professional,	
		postedit:	req.body.postedit,	
		comment:	req.body.comment,
		translator:	req.body.translator,	
		owner:	req.body.owner,
		status:	req.body.status
	};

	translationRequests.push(newQuote);

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