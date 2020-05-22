/**
 * express-truepath v1.0.1
 * by FarhanMS123
 * License MIT
 */

var util = require("util");
var path = require("path");
var fs = require("fs");
var url = require("url");

//var resolvePath = require("resolve-path");

var _config = {
    index: ["index.html", "default.html"],
    follow_symlink: true,
    resolveDirectoryURL: true
}

/**
 * get the filepath from system by the url
 * @param {string} rootPath the path of root's public folder from server systems
 * @param {string} urlPath path of url from request (or any)
 * @param {Object} [config]
 * @param {Array.<string>} config.index get an index file from a directory
 * @param {boolean} config.follow_symlink propose a symlink as target link.
 * @returns {Object} {filepath, dirpath, stat}.filepath, if it is file.
 * @returns {Object} {filepath, dirpath, stat}.dirpath, the dirname of a file or it is a directory.
 * @returns {Object} {filepath, dirpath, stat}.stat, a {@link https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_class_fs_stats Stats} from NodeJS
 * @returns {boolean} false, if the file is not exist
 */
function getTruePath(rootPath=process.cwd(), urlPath="/", config=_config){
    var index = typeof config.index == "object" && config.index.constructor == Array ? config.index : ["index.html", "default.html"];
    var follow_symlink = typeof config.follow_symlink == "boolean" ? config.follow_symlink : true;

    //var resolvedRootPath = resolvePath(root, url.substr(1));
    var resolvedRootPath = path.resolve(path.join(path.join(rootPath), path.join(urlPath)));
        
    if(fs.existsSync(resolvedRootPath)){
        var fsStat = (follow_symlink ? fs.statSync : fs.lstatSync)(resolvedRootPath);
        if(fsStat.isDirectory()){
            if(typeof index=="object" && index.constructor == Array){
                var index_filename, index_filepath;
                var rds = fs.readdirSync(resolvedRootPath);
                for(i=0; i<index.length; i++){
                    for(j=0; j<rds.length; j++){
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

/**
 * get the filepath from system by the url
 * @param {string} rootPath the path of root's public folder from server systems
 * @param {Object} [config]
 * @param {Array.<string>} config.index get an index file from a directory
 * @param {boolean} config.follow_symlink propose a symlink as target link.
 * @param {boolean} config.resolveDirectoryURL add slashes to an url of directory
 * 
 * @returns {Object} express {@link https://expressjs.com/en/4x/api.html#middleware-callback-function-examples middleware}
 * 
 */
function middleware(rootPath="/", config=config){
    /**
     * @param {Object} req - HTTP Request
     * @param {Object} res - HTTP Response
     * @param {@callback} next - callback
     */
    var resolveDirectoryURL = typeof config.resolveDirectoryURL == "boolean" ? config.resolveDirectoryURL : true;
    return function(req,res,next){
        var do_next = true;
        var truepath = getTruePath(rootPath, req.path, config);
        if(truepath){
            req.filepath = truepath.filepath;
            req.dirpath = truepath.dirpath;

            var urlParse = url.parse(req.originalUrl);
            if(resolveDirectoryURL && truepath.stat.isDirectory() && urlParse.pathname.substr(-1,1) != "/"){
                res.redirect(urlParse.pathname + "/" + (urlParse.search ? urlParse.search : ""));
            }
        }else{
            res.status(404);
        }
        if(do_next) next();
    }
}

module.exports = middleware;
module.exports.getTruePath = getTruePath;