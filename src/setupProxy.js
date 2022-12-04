const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use('/auth/**',(req) =>{
        createProxyMiddleware({ 
            target: `${req.get('referer')}`
        })
    }
    );
};