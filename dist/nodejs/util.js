"use strict";
exports.__esModule = true;
exports.request = void 0;
var request;
exports.request = request;
var http;
var https;
var nodeJsRequest = function (options) {
    return new Promise(function (resolve, reject) {
        var url = options.url || options.hostname;
        // Use 'https' if the protocol is not specified in 'options.hostname'
        if (url.indexOf("http://") !== 0 &&
            url.indexOf("https://") !== 0) {
            url = "https://" + url;
        }
        // Choose the right module based on the protocol in 'options.hostname'
        var httpOrHttps = url.indexOf("http://") === 0 ? http : https;
        // Remove the 'http://' so the native node.js module will understand
        options.hostname = url.split('://')[1];
        var req = httpOrHttps.request(options, function (res) {
            res.on("data", function (bodyBuffer) {
                var body = bodyBuffer.toString();
                resolve({
                    status: res.statusCode,
                    statusText: res.statusMessage,
                    body: body
                });
            });
        });
        req.on('timeout', function () {
            req.abort();
            return reject({
                status: 408,
                statusText: 'Client HTTP request timeout limit reached.'
            });
        });
        req.on('error', function (err) {
            if (req.aborted)
                return;
            try {
                console.error(err);
                return reject({});
            }
            catch (e) {
                console.error(err, e);
                return reject();
            }
        });
        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        req.end();
    });
};
var webBrowserRequest = function (options) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        var contentTypeIsSet = false;
        options = options || {};
        var method = options.method || "GET";
        var url = options.url || options.hostname;
        url += typeof options.path === "string" ? options.path : "";
        if (typeof url !== "string") {
            return reject("HTTP Request: Invalid URL.");
        }
        // Use 'https' if the protocol is not specified in 'options.hostname'
        if (url.indexOf("http://") !== 0 &&
            url.indexOf("https://") !== 0) {
            url = "https://" + url;
        }
        xhr.open(method, url);
        for (var header in options.headers) {
            if ({}.hasOwnProperty.call(options.headers, header)) {
                var lcHeader = header.toLowerCase();
                contentTypeIsSet = lcHeader === "content-type" ? true : contentTypeIsSet;
                xhr.setRequestHeader(header, options.headers[header]);
            }
        }
        if (!contentTypeIsSet) {
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        }
        xhr.onload = function () {
            var body;
            if (xhr.status >= 100 && xhr.status < 400) {
                try {
                    JSON.parse(xhr.response);
                    body = xhr.response;
                }
                catch (e) {
                    body = xhr.statusText;
                }
                return resolve({
                    status: xhr.status,
                    statusText: xhr.statusText,
                    body: body
                });
            }
            else {
                return reject({
                    status: xhr.status,
                    statusText: xhr.statusText
                });
            }
        };
        if (method !== "GET") {
            xhr.send(JSON.stringify(options.body));
        }
        else {
            xhr.send();
        }
    });
};
try {
    window;
    exports.request = request = webBrowserRequest;
}
catch (e) {
    http = require('http');
    https = require('https');
    exports.request = request = nodeJsRequest;
}
//# sourceMappingURL=util.js.map