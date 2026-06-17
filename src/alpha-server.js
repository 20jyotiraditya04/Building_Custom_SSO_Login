const http =require('http');
const PORT = 5001;
const server = http.createServer((req,res)=>{
    if(req.url === '/'){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('<h1>Welcome to Alpha Server </h1>');
    }

    else if(req.url ==='/test-sso-connection'){
        http.get('http://sso-core.local:5000/ping', (ssoRes) => {
            let data = '';
            ssoRes.on('data', (chunk) => {
                data+=chunk;
            });
            ssoRes.on('end',()=>{
                res.writeHead(200, {'Content-Type' : 'application/json'});
                res.end(`<h3>Alpha backend Succcessfully fetched from SSO Core!</h3><p> Data Received: ${data}</p>`);
            })
        }).on('error',(err)=>{
            res.writeHead(500);
            res.end(`Failed to connect to SSO Core: ${err.message}`);
            
        })
    }
});





server.listen(PORT,()=>console.log(`Alpha Server running at http://app-server.local:${PORT}`));
