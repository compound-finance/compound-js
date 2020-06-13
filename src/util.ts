let request: any;
let http: any;
let https: any;

const nodeJsRequest = (options: any) => {
  return new Promise<Object>((resolve, reject) => {
    let url = options.url || options.hostname;

    // Use 'https' if the protocol is not specified in 'options.hostname'
    if (
      url.indexOf("http://") !== 0 &&
      url.indexOf("https://") !== 0
    ) {
      url = "https://" + url;
    }

    // Choose the right module based on the protocol in 'options.hostname'
    const httpOrHttps = url.indexOf("http://") === 0 ? http : https;

    // Remove the 'http://' so the native node.js module will understand
    options.hostname = url.split('://')[1];

    const req = httpOrHttps.request(options, (res: any) => {
      res.on("data", (bodyBuffer: any) => {
        const body: string = bodyBuffer.toString();
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          body
        });
      });
    });

    req.on('timeout', () => {
      req.abort();
      return reject({
        status: 408,
        statusText: 'Client HTTP request timeout limit reached.'
      });
    });

    req.on('error', (err: any) => {
      if (req.aborted) return;
      try {
        console.error(err);
        return reject({});
      } catch (e) {
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

const webBrowserRequest = (options: any) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let contentTypeIsSet = false;
    options = options || {};
    const method = options.method || "GET";
    let url = options.url || options.hostname;
    url += typeof options.path === "string" ? options.path : "";

    if (typeof url !== "string") {
      return reject("HTTP Request: Invalid URL.");
    }

    // Use 'https' if the protocol is not specified in 'options.hostname'
    if (
      url.indexOf("http://") !== 0 &&
      url.indexOf("https://") !== 0
    ) {
      url = "https://" + url;
    }

    xhr.open(method, url);

    for (let header in options.headers) {
      if ({}.hasOwnProperty.call(options.headers, header)) {
        let lcHeader = header.toLowerCase();
        contentTypeIsSet = lcHeader === "content-type" ? true : contentTypeIsSet;
        xhr.setRequestHeader(header, options.headers[header]);
      }
    }

    if (!contentTypeIsSet) {
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    }

    xhr.onload = function() {
      let body;
      if (xhr.status >= 100 && xhr.status < 400) {
        try {
          JSON.parse(xhr.response);
          body = xhr.response;
        } catch (e) {
          body = xhr.statusText;
        }

        return resolve({
          status: xhr.status,
          statusText: xhr.statusText,
          body
        });
      } else {
        return reject({
          status: xhr.status,
          statusText: xhr.statusText
        });
      }
    };

    if (method !== "GET") {
      xhr.send(JSON.stringify(options.body));
    } else {
      xhr.send();
    }
  });
};

try {
  window;
  request = webBrowserRequest;
} catch (e) {
  http = require('http');
  https = require('https');
  request = nodeJsRequest;
}

export {
  request,
};
