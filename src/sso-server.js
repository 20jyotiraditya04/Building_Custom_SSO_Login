const http = require('http');
const PORT = 5000;

const server = http.createServer((req,res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    if(req.url === '/ping' && req.method === 'GET'){
        res.writeHead(200, {'Content-Type' : 'application/json'});
        res.end(JSON.stringify({ message: "Hello from SSO Core !"}));
    }else{
        res.writeHead(404);
        res.end();
    }
})

server.listen(PORT, () => console.log(`SSO Hub running at http://sso-core.local:${PORT}`));