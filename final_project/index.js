const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());//app.use(express.json()) 
//ermöglicht es dem Server, JSON-geformatete Anfragen zu verarbeiten. 
//Dies ist nützlich, wenn der Client Daten im JSON-Format sendet.

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    // Option 1: JWT in the Authorization header
//     Session Middleware: app.use("/customer", session({...})) konfiguriert die 
// Session-Middleware für Pfade, die mit /customer beginnen. Diese Middleware 
// speichert Session-Daten auf dem Server und sendet einen Cookie an den Client, um die 
// Session-ID zu verwalten.
// secret: Ein Geheimnis zur Verschlüsselung des Session-Cookies.
// resave: Konfiguriert das erneute Speichern der Session, selbst wenn sie nicht geändert wurde.
// saveUninitialized: Legt fest, ob neue, noch nicht gespeicherte Sessions gespeichert werden sollen.
// Authentifizierungsmiddleware
// JWT-Authentifizierung: Die Middleware unter app.use("/customer/auth/*", ...) wird für alle 
// Anfragen ausgeführt, die mit /customer/auth/ beginnen. Sie dient dazu, den Benutzer zu 
// authentifizieren. JWT aus dem Authorization-Header: Der Server prüft, ob ein JWT im 
// Authorization-Header der Anfrage vorhanden ist. Wenn ja, wird der Token extrahiert, 
// verifiziert und die Anfrage fortgesetzt.
// JWT aus der Session: Alternativ kann der Server nach einem JWT in der Session suchen und 
// diesen verifizieren. Wenn die Verifizierung fehlschlägt oder kein Token vorhanden ist, 
// sendet der Server eine entsprechende Antwort (Statuscode 401 oder 403).

    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Assuming Bearer token

        jwt.verify(token, 'YOUR_SECRET_KEY', (err, user) => {
            if (err) {
                return res.status(403).json({ message: "Access denied. Invalid token." });
            }
            req.user = user;
            next();
        });
    }
    // Option 2: JWT in the session
    else if (req.session && req.session.user && req.session.user.token) {
        jwt.verify(req.session.user.token, 'YOUR_SECRET_KEY', (err, user) => {
            if (err) {
                return res.status(403).json({ message: "Access denied. Invalid token." });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ message: "Unauthorized access. No token provided." });
    }
});
 
const PORT =3000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
