var axios = require('axios');
const { URLSearchParams } = require('url');
var appsettings = require('./appsettings.json');

// Step 1: get needed variables 
var resource = appsettings.Resource;
var clientId = appsettings.ClientId;
var clientSecret = appsettings.ClientSecret;
var tenantId = appsettings.TenantId;
var apiVersion = appsettings.ApiVersion;

// Step 2: get the authentication endpoint from the discovery URL
var token = axios({
    url: resource + '/identity/.well-known/openid-configuration',
    method: 'GET',
    headers: {
    Accept: 'application/json',
    'Accept-Encoding': 'gzip',
    },
})
// Step 3: use the client ID and Secret to get the needed bearer token
    .then(function (res) {
    var obj = res.data;
    authority = new URL(obj.token_endpoint);
    resUrl = new URL(resource);
    if (
        authority.protocol === resUrl.protocol &&
        authority.hostname === resUrl.hostname
    ) {
        var body = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        });

        return axios.post(authority.href, body.toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        });
    } else {
        logError(`Encountered error parsing authority: ${authority.href}`);
    }
    })
    .catch(function (err) {
    logError(err);
    });


// Step 4: test token by calling the base tenant endpoint 
var tenant = axios({
    url: resource + '/api/' + apiVersion + '/Tenants/' + tenantId,
    method: 'GET',
    headers: {
    'Accept-Encoding': 'gzip',
    'Content-Encoding': 'gzip',
    Authorization: 'bearer ' + token,
    'Content-type': 'application/json',
    Accept: '*/*; q=1',
    },
});

// test it by making sure we got a valid http status code  