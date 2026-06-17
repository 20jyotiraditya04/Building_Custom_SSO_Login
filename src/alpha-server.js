const http =require('http');
const PORT = 5001;
const server = http.createServer((req,res)=>{
    if(req.url === '/'){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('<h1>Welcome to Alpha Server </h1>');
    }
});

server.listen(PORT,()=>console.log('Alpha Server running at http://app-server.local:${PORT}'));
