var CleanCSS = require('clean-css'),
    usage = require("./usage");

var SourceMapConsumer = require('source-map').SourceMapConsumer;

module.exports = function(less) {
    function CleanCSSProcessor(options) {
        this.options = options || {};
    };

    CleanCSSProcessor.prototype = {
        process: function (css, extra) {
            var options = this.options,
                sourceMap = extra.sourceMap,
                sources,
                sourcesContent;

            var sourceMapJson = undefined;
            var minifyMap = {};

            if (sourceMap) {
              options.sourceMap = true;

              sourceMapJson = sourceMap.getExternalSourceMap();

              if (sourceMapJson) {
                var sourceMapObj = new SourceMapConsumer(sourceMapJson);
                    if (sourceMapObj.sourcesContent) {
                        sourcesContent = sourceMapObj.sourcesContent;
                        sources = sourceMapObj.sources;
                    }
                }
            }
            else {
              options.sourceMap = false;
            }

            options.processImport = false;

            var output = new CleanCSS(options).minify(css, sourceMapJson);

            if (sourceMap) {
                if (sourcesContent) {
                    for(var source = 0; source < sources.length; source++)
                    {
                        output.sourceMap.setSourceContent(sources[source], sourcesContent[source]);
                    }
                }
                sourceMap.setExternalSourceMap(JSON.stringify(output.sourceMap));
            }

            var css = output.styles;
            if (sourceMap) {
                var sourceMapURL = sourceMap.getSourceMapURL();
                css += sourceMap.getCSSAppendage();
            }

            return css;
        }
    };

    return CleanCSSProcessor;
};
