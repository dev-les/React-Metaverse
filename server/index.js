const express = require('express');
const request = require('request');
const dotenv = require('dotenv');
var path = require('path');
const cors = require('cors');

const corsOption = {
    origin: '*',
};

const port = process.env.PORT || 8080;

global.access_token = '';

dotenv.config();

var spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
var spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;
// var spotify_redirect_uri = `http://localhost:3000/auth/callback`

var generateRandomStrings = (length) => {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for(var i=0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
function requireHTTPS(req, res, next) {
    // The 'x-forwarded-proto' check is for Heroku
    if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
        return res.redirect('https://' + req.get('host') + req.url);
    }
    next();
}
var app = express();
app.use(requireHTTPS);
app.use(cors(corsOption));
app.use(express.static(path.join(__dirname, '../build')));

app.get('/auth/login', (req, res) => {
    var scope = "streaming \
                 user-read-email \
                 user-read-private";

    var state = generateRandomStrings(16);
    var spotify_redirect_uri = `${req.get('referer')}auth/callback`;
    console.log('***LOGIN***');
    console.log(spotify_redirect_uri);

    var auth_query_parameters = new URLSearchParams({
        response_type: "code",
        client_id: spotify_client_id,
        scope: scope,
        redirect_uri: spotify_redirect_uri,
        state: state
    });

    res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
});

app.get('/auth/callback', (req, res) => {
    var code = req.query.code;

    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: `${req.get('referer')}auth/callback`,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization' : 'Basic '+(Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')),
            'Content-Type' : 'applications/x-www-from-urlencoded'
        },
        json: true
    }
    console.log('***CALLBACK***');
    console.log(authOptions);
    try {request.post(authOptions, function(error, response, body){
        if(!error && response.statusCode === 200) {
            access_token = body.access_token;
            res.redirect('/');
        }else{
            console.log(`Status Code: ${response.statusCode}`)
            console.log(`Status Code: ${response.statusMessage}`)
        }
    })}
    catch(error) {
        console.log(error);
    }
});

app.get('/auth/token', (req, res) => {
    res.json({ access_token: access_token})
})

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})