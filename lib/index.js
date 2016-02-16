var pathToRegexp = require('path-to-regexp');
var querystring = require('querystring');

function Urly() {
    this._mappings = [];
}

Urly.prototype.register = function(pattern, callback) {
    var keys = [];
    var parts = pattern.split('?', 2);
    var path = parts[0];
    var query = (parts[1] ? parts[1].split('&') : []);
    var regex = pathToRegexp(path, keys);

    this._mappings.push({
        pattern: pattern,
        path: path,
        query: query,
        callback: callback,
        regex: regex,
        keys: keys
    });
};

Urly.prototype.map = function(url, extraParams) {
    var parts = url.split('?', 2);
    var path = parts[0];
    var query = querystring.parse(parts[1]);

    for (var i = 0, len = this._mappings.length; i < len; i++) {
        // Check if path matches
        var match = this._mappings[i].regex.exec(path);

        if (!match) {
            continue;
        }

        // Check if we have all the required query params
        var missingQueryParams = this._mappings[i].query.filter(function(key) {
            return !query.hasOwnProperty(key) || query[key] == '';
        });

        if (missingQueryParams.length) {
            continue;
        }

        var request = {
            params: extraParams || {},
            query: query
        };

        // Extract params
        this._mappings[i].keys.forEach(function(key, index) {
            request.params[key.name] = match[index + 1];
        });

        if (typeof this._mappings[i].callback === 'function') {
            // Invoke the function directly
            return this._mappings[i].callback.call(this, request);
        } else {
            // Reverse generate path from pattern
            var toPath = pathToRegexp.compile(this._mappings[i].callback);

            // Merge query string params with path params
            for (var key in query) {
                request.params[key] = query[key];
            }
            return toPath(request.params);
        }
    }

    return false;
};

module.exports = Urly;
