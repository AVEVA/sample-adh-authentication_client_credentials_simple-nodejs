var axios = require('axios');
const { URLSearchParams } = require('url');
var appsettings = require('./appsettings.json');

// Step 1: get needed variables 
var resource = appsettings.Resource;
var clientId = appsettings.ClientId;
var clientSecret = appsettings.ClientSecret;
var tenantId = appsettings.TenantId;
var apiVersion = appsettings.ApiVersion;

var app = async function (request1, response) {
    // Step 2: get the authentication endpoint from the discovery URL
    var wellknown_information = await axios({
        url: resource + '/identity/.well-known/openid-configuration',
        method: 'GET',
        headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip',
        },
    })

    var obj = wellknown_information.data;
    authority = new URL(obj.token_endpoint);

    // Step 3: use the client ID and Secret to get the needed bearer token
    var body = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
    });

    var token_information = await axios({
        url: authority.href, 
        method: 'POST',
        data: body.toString(), 
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    var obj = token_information.data;
    var token = obj.access_token;

    // Step 4: test token by calling the base tenant endpoint 
    var tenant = await axios({
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
    console.log(tenant.status)
};

//if you want to run a server
var toRun = function () {
    //This server is hosted over HTTP.  This is not secure and should not be used beyond local testing.
    http.createServer(app).listen(8080);
};

process.argv = process.argv.slice(2);
if (require.main === module) {
  app.apply(process.argv);
}

module.exports = app;