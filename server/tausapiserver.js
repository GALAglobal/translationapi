var express = require('express');
var fs = require("fs");

var app = express();

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

var translationRequests;

if (fs.existsSync("requests.txt"))
{
	var requests = fs.readFileSync("requests.txt", "utf8");
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

app.use(express.bodyParser());

app.get('/request/', function(req, res) 
{
  res.json(translationRequests);
});

app.get('/request/:id', function(req, res) 
{
  if(translationRequests.length <= req.params.id || req.params.id < 0) 
  {
    res.statusCode = 404;
    return res.send('Error 404: No translationRequests found');
  }
  try
  {
	var index = parseInt(req.params.id);
	if ((!isNaN(index)) && (index >= 0) && (translationRequests.length > index))
	{
		var q = translationRequests[index]; // need to adapt to the real id!
		res.json(q);
		return;
	}
	else
	{
		// we need to check if req.params.id is contained in there
		for (var i = 0; i < translationRequests.length; ++i)
		{
			console.log('req: %d %s', i, translationRequests[i].id);
			if (translationRequests[i].id == req.params.id)
			{
				res.json(translationRequests[i]);
				res.statusCode = 201;
				return;
			}
		}
		res.statusCode = 404;
		return res.send('Error 404: No translationRequest ' + req.params.id + ' found');
	}
  }
  catch(e)
  {
	res.statusCode = 404;
	return res.send('Error 404: No translationRequest ' + req.params.id + ' found');
  }
});

app.put('/request/:id', function(req, res) 
{
  try
  {
	var index = parseInt(req.params.id);
	if ((!isNaN(index)) && (index >= 0) && (translationRequests.length > index))
	{
		var q = translationRequests[index]; // need to adapt to the real id!
		q.mt = "changed"; 
		translationRequests[i].mt = "changed";
		fs.writeFile('requests.txt', JSON.stringify(translationRequests), function (err) 
		{
			if (err) throw err;
			console.log('requests.txt saved!');
		});
		res.statusCode = 200;
		res.json(q);
		return;
	}
	else
	{
		// we need to check if req.params.id is contained in there
		for (var i = 0; i < translationRequests.length; ++i)
		{
			console.log('req: %d %s', i, translationRequests[i].id);
			if (translationRequests[i].id == req.params.id)
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
			}
				
			res.json(translationRequests[i]);
			res.statusCode = 200;
			fs.writeFile('requests.txt', JSON.stringify(translationRequests), function (err) 
			{
				if (err) throw err;
				console.log('requests.txt saved!');
			});
			return;
		}
		res.statusCode = 404;
		return res.send('Error 404: No translationRequest ' + req.params.id + ' found');
	}
  }
  catch(e)
  {
	res.statusCode = 404;
	return res.send('Error 404: No translationRequest ' + req.params.id + ' found');
  }
});

app.post('/request/', function(req, res) 
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
  
	fs.writeFile('requests.txt', JSON.stringify(translationRequests), function (err) 
	{
		if (err) throw err;
		console.log('requests.txt saved!');
	});

  res.json(newQuote);
});

app.delete('/request/:id', function(req, res) 
{
 try
  {
	var index = parseInt(req.params.id);
	if ((!isNaN(index)) && (index >= 0) && (translationRequests.length > index))
	{
		translationRequests.splice(req.params.id, 1);
		fs.writeFile('requests.txt', JSON.stringify(translationRequests), function (err) 
		{
			if (err) throw err;
			console.log('requests.txt saved!');
		});
		res.statusCode = 200;
		res.json(true);
		return;
	}
	else
	{
		// we need to check if req.params.id is contained in there
		for (var i = 0; i < translationRequests.length; ++i)
		{
			console.log('req: %d %s', i, translationRequests[i].id);
			if (translationRequests[i].id == req.params.id)
			{
				translationRequests.splice(i, 1);
				fs.writeFile('requests.txt', JSON.stringify(translationRequests), function (err) 
				{
					if (err) throw err;
					console.log('requests.txt saved!');
				});
				res.statusCode = 200;
				res.json(true);
				return;
			}
		}
		res.statusCode = 404;
		return res.send('Error 404: No translationRequest ' + req.params.id + ' found');
	}
  }
  catch(e)
  {
	res.statusCode = 404;
	return res.send('Error 404: No translationRequest ' + req.params.id + ' found');
  }


});

app.listen(process.env.PORT || 3412);

