const crypto = require('crypto');
const http = require('http');
const PORT = 5000;

const USER_DB = [
    { id: "usr_123", email: "developer@test.com", password: "password123", name: "John Doe" }
];

const CLIENTS_DB = {
    "alpha_client_id": {
        secret: "alpha_client_secret",
        redirect_uri: "http://app-alpha.local:5001/callback"
    },
    "beta_client_id": {
        secret: "beta_client_secret",
        redirect_uri: "http://app-beta.local:5002/callback"
    }
};

const ONE_TIME_TICKETS = {};
const ACTIVE_SESSIONS = {};

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.url === '/ping' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: "Hello from SSO Core !" }));
    }

    else if (req.url.startsWith('/login') && req.method == 'GET') {
        const cookieHeader = req.headers.cookie;
        let cookies = {};

        const full_url = new URL(req.url, `http://${req.headers.host}`);
        const clientID = full_url.searchParams.get('client_id');
        const redirect_uri = full_url.searchParams.get('redirect_uri');
        console.log("Inside /login with req_method=GET");
        if (clientID || redirect_uri) {
            const client = CLIENTS_DB[clientID];
            if (!client || redirect_uri !== client.redirect_uri) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                return res.end(`<h1> "400 Unauthorized Access: Bad Client ID or Redirect URI" </h1>`);
            }
            console.log("Valid Client Present Not rejected till now")
        }

        if (cookieHeader) {
            console.log(`Cookie Header Present with value ${cookieHeader}`)
            cookies = cookieHeader.split(';').reduce((acc, cookie) => {
                const [name, value] = cookie.trim().split('=');
                acc[name] = value;
                console.log(`Name=${name} and Value=${value}`)
                return acc;
            }, {});
        }

        const session = ACTIVE_SESSIONS[cookies.sessionID];
        console.log(`session is ${session}`)
        if (session && clientID && redirect_uri) {
            const ticket = crypto.randomBytes(16).toString('hex');
            console.log(`ticket is ${ticket}`)
            ONE_TIME_TICKETS[ticket] = {
                userId: session.id,
                clientID: clientID,
                expiresAt: Date.now() + 60000
            };
            res.writeHead(302, { 'Location': `${redirect_uri}?ticket=${ticket}` });
            return res.end();
        }

        if (!cookieHeader || !cookies.sessionID || !session) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            return res.end(`
                <h1> Login to SSO Core </h1>
                <form method="POST" action="/login">
                    <input type="hidden" name="client_id" value="${clientID || ''}">
                    <input type="hidden" name="redirect_uri" value="${redirect_uri || ''}">
                    <label for="email">Email:</label>
                    <input type="email" name="email" required><br>
                    <label for="password">Password:</label>
                    <input type="password" name="password" required><br>
                    <button type="submit">Login</button>
                </form>
            `);
            
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            return res.end(`<h1> Hello, ${session.name}! You are logged in. </h1>`);
        }
    }

    else if (req.url.startsWith('/login') && req.method === 'POST') {
        let body = '';
        console.log("After Clicking Signin the Process reaches here")
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const email = params.get('email');
            const password = params.get('password');
            const formClientId = params.get('client_id');      // Must be lowercase matching hidden field
            const formRedirectUri = params.get('redirect_uri'); // Must be lowercase matching hidden field

            const user = USER_DB.find(u => u.email === email && u.password === password);

            if (user) {
                console.log("User verified as valid.")
                const sessionID = crypto.randomBytes(16).toString('hex');
                ACTIVE_SESSIONS[sessionID] = { id: user.id, name: user.name, email: user.email };
                res.setHeader('Set-Cookie', `sessionID=${sessionID}; HttpOnly; Path=/; SameSite=Lax`);
                console.log(`sessionId is ${sessionID}`)
                console.log(`POST method got client_id as ${formClientId}`)
                console.log(`POST method got redirect URL as ${formRedirectUri}`)
                if (formClientId && formRedirectUri) {
                    const ticket = crypto.randomBytes(16).toString('hex');

                    ONE_TIME_TICKETS[ticket] = { 
                        userId: user.id, 
                        clientId: formClientId, 
                        expiresAt: Date.now() + 60000 
                    };
                    res.writeHead(302, { 'Location': `${formRedirectUri}?ticket=${ticket}`});
                    console.log(`Verified Client and redirectURL and ticket is ${ticket}`)
                    return res.end(); // Stops execution and redirects successfully!
                }

                // Fallback if logging in directly to sso-core
                res.writeHead(200, { 'Content-Type': 'text/html' });
                return res.end(`<h1> Hello, ${user.name}! You are logged in directly to Core.</h1>`);
            } else {
                res.writeHead(401, { 'Content-Type': 'text/html' });
                return res.end('<h1> Invalid email or password. Please try again.</h1>');
            }
        });
    }

    else {
        res.writeHead(404);
        return res.end();
    }
});

server.listen(PORT, () => console.log(`SSO Hub running at http://sso-core.local:${PORT}`));