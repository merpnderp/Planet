
var so = so || {};

so.FileLoader = function( ) { 

    var fileCount = 0;
    var files = {}; 
    var cb; 

    this.getFiles = function( fileNames, callback ) { 
        cb = callback;
        for( var f in fileNames ) { 
            fileCount++;
            var fileName = fileNames[f];
            var r = function(fileName){ 
                return function(data){
                    var f = fileName;
                    result( f, data );
                };  
            }(fileName);
            $.get( fileName, r); 
        }   
    };  

    var result = function( fileName, data) {
        files[fileName] = data;
        if( --fileCount === 0 ) { 
            cb(files);  
        }   
    };  
};
