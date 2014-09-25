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

#1. Instructions - mac os#

##1.1 Installing Node.js##
If you already have Node.js installed on your computer, then skip this section and move to section 1.2.

Node.js® is a platform built on Chrome's JavaScript runtime for easily building fast, scalable network applications.

To install Node.js on mac os, visit http://nodejs.org/ and click install. This will download a pre-compiled binary package to your computer `node-vx.xx.xx.pkg`. Once the download is complete open the .pkg file which will open a installer that is quite similar to all the installation wizards available for mac. Follow the on screen instructions to complete the installation. 

To test if Node.js is installed on your computer,
`Open terminal --> type node` if you don't see any errors on the screen and see this `>` on the screen, then you have succesfully installed Node.js.


##1.2 Installing Node packages##
To quickly install node packages,

`Open terminal --> navigate to the root of the application and type: npm install`

npm will now install the dependencies into a `node_modules` folder in the project.

##1.3 Starting the server##
To start the server,
`Type in terminal: node tausapiserver.js`

##1.4 Troubleshooting##

If you see the below error in termial after trying to start the server,

```linux
Error: listen EADDRINUSE
    at errnoException (net.js:904:11)
    at Server._listen2 (net.js:1042:14)
    at listen (net.js:1064:10)
    at Server.listen (net.js:1138:5)
```

then the port number specified in the translation api server is already in use.

**Quick fix**
`Type in terminal: killall -9 node` 

Now start the server again!
