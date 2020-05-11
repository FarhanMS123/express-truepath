var util = require("util");
var path = require("path");
var fs = require("fs");

var resolvePath = require("resolve-path");

var config = {
    index: ["index.html", "default.html"],
    follow_link: true
}
function getTruePath(root=process.cwd(), url="/", config=config){
    var index = config.index;
    var follow_link = config.follow_link;

    var resolvedRootPath = resolvePath(root, url);
        
    if(fs.existsSync(resolvedRootPath)){
        var fsStat = (follow_link ? fs.statSync : fs.lstatSync)(resolvedRootPath);
        if(fsStat.isDirectory()){
            if(typeof index=="object" && index.constructor == Array){
                var index_filename, index_filepath;
                var rds = fs.readdirSync(resolvedRootPath);
                for(i=0; i<=index.length; i++){
                    for(j=0; j<=rds.length; j++){
                        if(index[i] == rds[j]){
                            index_filename = rds[j];
                            index_filepath = path.join(resolvedRootPath, index_filename);
                            break;
                        }
                    }
                    if(index_filename) break;
                }
                if(index_filename){
                    return {
                        filepath: index_filepath,
                        dirpath: resolvedRootPath,
                        stat: fs.statSync(index_filepath)
                    };
                }else{
                    return {
                        dirpath: resolvedRootPath,
                        stat: fsStat
                    };
                }
            }
        }else{
            return {
                filepath: resolvedRootPath,
                dirpath: path.dirname(resolvedRootPath),
                stat: fsStat
            };
        }
    }else{
        return false
    }
};

module.exports = function(root="/", config=config){
    return function(req,res,next){
        var truepath = getTruePath(root, req.path, config);
        if(truepath){
            req.filepath = truepath.filepath;
            req.dirpath = truepath.dirpath;
        }else{
            res.status(404);
        }
        next();
    }
}

module.exports.getTruePath = getTruePath