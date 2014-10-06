TAUS Translation API Test Implementation
========================================

#Instructions#

##Installing Node.js##
If you already have Node.js installed on your computer, then skip this section and move to section 1.2.

Node.js® is a platform built on Chrome's JavaScript runtime for easily building fast, scalable network applications.

###OS X###
To install Node.js on mac os, visit http://nodejs.org/ and click install. This will download a pre-compiled binary package to your computer `node-vx.xx.xx.pkg`. Once the download is complete open the .pkg file which will open a installer that is quite similar to all the installation wizards available for mac. Follow the on screen instructions to complete the installation. 

###Windows###
To install Node.js on windows os, visit http://nodejs.org/ and click Install. You will be prompted to download an .msi file that contains the installer. Save the .msi file to a location on your drive and launch the installer by double-clicking on it. Follow the on screen instructions to complete the installation.

###Testing the installation###

To test if Node.js is installed on your computer,
`Open command prompt --> type node` if you don't see any errors on the screen and see this `>` on the screen, then you have succesfully installed Node.js. To exit the Node.js prompt press Ctrl+C twice.

##Installing Node packages##
To quickly install node packages,

`Open command prompt --> navigate to the /server folder and type: npm install`

npm will now install the dependencies into a `node_modules` folder in the project.

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

###Possible Windows installation issue###

On Windows you might get the following error message when installing the packages:
```
npm install
Error: ENOENT, stat 'C:\Users\UserName\AppData\Roaming\npm'
```
In this case you will have to create the `npm` folder manually and re-run the package installation.

##Starting the server##
To start the server,
`Type in command prompt: node tausapiserver.js`

You might be prompted to open access to the server by the firewall built into your operating system.

###Port number in use on Un*x-based operating systems###
If you see the below error in the command prompt after trying to start the server,

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

Now start the server again!

##Accessing the server##
You can access the server in your browser at http://localhost:3412/v2.0/translation/ (the terminiating slash is significant!).

For full access to the RESTful API use a REST client (some are available as browser plug-ins) and refer to the [TAUS Translation API v2.0 Specification](https://labs.taus.net/interoperability/taus-translation-api) for available methods.


