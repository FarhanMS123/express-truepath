# express-truepath

Parsing url to be root file.

## Installation

```
npm install express-truepath
```

## Documentation
```javascript
var path = require("path");

var truePath = require("express-truepath");

var root = path.resolve(".", "public");
var config = { // this is default value
    index: ["index.html", "default.html"],
    follow_symlink: true, // while it set to true, it will identify symlink as file or folder and follow its link. Otherwise, it would identify as file (or flag) if it set to false.
    resolveDirectoryURL: true // only works in http/express middleware. see the middleware
}

// using as express middleware
config.resolveDirectoryURL = true; //while the url is a directory, rediredt to a url with a slash at the end.
var truePath_middleware = truePath(root, config); // config is optional

app.all("/*", truePath_middleware, (req,res,next) => {
    // while the file or folder is exist, there would be these propertieses
    // req.filepath is only exist if it is a file.
    // req.dirpath is always exist either it is a file or folder
    req.filepath = "/path/from/the-system/dir1/filename.html";
    req.dirpath = "/path/from/the-system/dir1";
    
    ...
    //your script
    ...

    next();
});

// This implement as parsing module.
// This example is using basic HTTP Server

var url = require("url");

http_server.on("request", (req, res)=>{
    var urlPath = url.parse(req.path).pathname;
    var webTruePath = truePath.getTruePath(root, urlPath, config);
    
    // webTruePath is returning filepath, dirpath, and fsStat
    // for fsStat is implement by `fs.statSync`.
    // If you set config.follow_link to false, fsStat would implement `fs.lstatSync`
    var {filepath, dirpath, fsStat} = webTruePath;

    // otherwise, it would retrun false if the file is not exist.
    if(webTruePath == false) res.writeHead(400).end("not found");
});

```

## LICENSE

This package is using MIT License.