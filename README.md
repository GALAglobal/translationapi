translationapi
==============

Getting Started
----------
As with all of our node projects, the packages required by the translation API is defined in `package.json`.

```json
// package.json
{
	"name": "taus-api",
	"main": "tausapiserver.js",
	"dependencies": {
		"express": "~3.0.0",
		"js2xmlparser": "~0.1.5"
	}
}
```

**What do these packages do?** express is the Node framework and js2xmlparser is a Node.js module that parses JavaScript objects into XML.

Installing Node packages (Tested on mac os)
----------
To quickly install node packages,

`Open terminal --> navigate to the root of the application and type: npm install`

npm will now install the dependencies into a node_modules folder in the project.

Starting the server
----------
To start the server,
`Type in terminal: node tausapiserver.js`

Troubleshooting
----------
If you see the below error in termial after tring to start the server,

```
Error: listen EADDRINUSE
    at errnoException (net.js:904:11)
    at Server._listen2 (net.js:1042:14)
    at listen (net.js:1064:10)
    at Server.listen (net.js:1138:5)
    ```

then the port number specified in the translation api server is already in use.

**Quick fix**
`Type in terminal: killall -9 node` 

Now start the server again
