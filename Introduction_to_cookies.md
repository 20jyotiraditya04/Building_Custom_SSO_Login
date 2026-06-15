# HTTP Cookies — Summary

A cookie is a small piece of data a server sends to a user's browser to store state across requests. Browsers save cookies and send them back on later requests to the same site, enabling session management, personalization, and tracking.

- **Main uses:** session management (authentication, carts), personalization (language, theme), and tracking/analytics.
- **Creation & lifecycle:** servers set cookies via `Set-Cookie`; browsers return them in the `Cookie` header. Cookies can be session-only or persistent (via `Expires` or `Max-Age`). To delete a cookie, reset it with `Max-Age=0` or an expired `Expires` value.
- **Security attributes:** `Secure` (send only over HTTPS) and `HttpOnly` (inaccessible to JavaScript) reduce theft and XSS risks. Use opaque session IDs rather than sensitive data in cookies.
- **Scope attributes:** `Domain` and `Path` control which hosts and URL paths receive the cookie.
- **Cross-site control:** `SameSite` (Strict, Lax, None) limits when cookies are sent on cross-site requests. `SameSite=None` requires `Secure`.
- **Cookie prefixes:** special name prefixes (e.g., `__Host-`, `__Secure-`) enforce stricter attribute rules on supporting browsers.
- **Privacy & tracking:** third-party cookies enable cross-site tracking and are increasingly blocked; prefer privacy-preserving alternatives and minimize reliance on third-party cookies.
- **Regulation & best practices:** comply with laws (GDPR, ePrivacy, CCPA), notify users, allow opt-outs, keep sensitive cookie lifetimes short, and avoid "zombie" cookie techniques.

### Security — Summary

Cookies are visible and modifiable by the client by default, which creates risks like session theft or fixation. Key security measures:

- **Set `Secure`:** only send cookies over HTTPS to protect them in transit.
- **Set `HttpOnly`:** prevent JavaScript from reading or modifying session cookies, reducing XSS exposure.
- **Avoid storing secrets in cookies:** store opaque session identifiers server-side instead of sensitive data in cookie values.
- **Regenerate session cookies on authentication:** helps prevent session fixation attacks.
- **Use tight scope and short lifetimes:** constrain `Domain`/`Path` and prefer short `Max-Age` for sensitive cookies.
- **Leverage `SameSite`:** restrict cross-site sending to mitigate CSRF; use `Strict` or `Lax` where appropriate.
- **Use cookie prefixes:** `__Host-` and `__Secure-` help enforce secure, host-only cookie policies on supporting browsers.

Together these practices reduce theft, XSS, CSRF, and session-fixation risks when using cookies for authentication and state.