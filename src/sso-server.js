const crypto = require('crypto');

const USER_DB = [
    {id:"usr_123",email:"developer@test.com",password:"password123",name:"John Doe"}
];

const ACTIVE_SESSIONS = {};
const http = require('http');
const PORT = 5000;

const server = http.createServer((req,res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    if(req.url === '/ping' && req.method === 'GET'){
        res.writeHead(200, {'Content-Type' : 'application/json'});
        res.end(JSON.stringify({ message: "Hello from SSO Core !"}));
    }
    if(req.url === '/login' && req.method == 'GET'){
        //Parse the incoming request header for a cookie header
        const cookieHeader = req.headers.cookie;
        // if a session cookie exists and its ID is found inside your ACTIVE_SESSIONS objects, immediately return a 200 OK with a HTML message <h1> Hello, ${session.name}! You are logged in.</h1>
        if(cookieHeader){
            const cookies =  cookieHeader.split(';').reduce((acc, cookie) => {
                const [name,value]=cookie.trim().split('=');
                acc[name]=value;
                return acc;
            }, {});
        }
        //if no valid session cookie is found, server a clean HTML string containing a form
        if(!cookieHeader || !cookies.sessionID || !ACTIVE_SESSIONS[cookies.sessionID]){
            res.writeHead(200, {'Content-Type': 'test/html'});
            res.end(`
                <h1> Login to SSO Core </h1>
                <form method="POST" action="/login">
                    <label for="email">Email:</label>
                    <input type="email" name="email" required><br>
                    <label for="password">Password:</label>
                    <input type="password" name="password" required><br>
                    <button type="submit">Login</button>
                </form>
            `);
        }
    }
    let body ='';
    if(req.url === '/login' && req.method === 'POST'){
        req.on('data',chunk=>{
            body+=chunk;
        })
        req.on(
            'end',()=>{
                const params = new URLSearchParams(body);
                const email = params.get('email');
                const password = params.get('password');
                const user = USER_DB.find(u=>u.email === email && u.password === password);
                if(user){
                    const sessionID = crypto.randomBytes(16).toString('hex');
                    ACTIVE_SESSIONS[sessionID]={id:user.id,name:user.name,email:user.email};
                    res.writeHead(200, {
                        'Content-Type': 'text/html',
                        'Set-Cookie': `sessionID=${sessionID}; HttpOnly;Path=/; SameSite=Lax`
                    });
                    res.end(`<h1> Hello, ${user.name}! You are logged in.</h1>`);
                }
                else
                {
                    res.writeHead(401, {'Content-Type': 'text/html'});
                    res.end('<h1> Invalid email or password. Please try again.</h1>');
                }
            }
        )

    }
    else{
        res.writeHead(404);
        res.end();
    }
})

server.listen(PORT, () => console.log(`SSO Hub running at http://sso-core.local:${PORT}`));