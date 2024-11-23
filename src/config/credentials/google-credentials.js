// src/config/credentials/google-credentials.js
module.exports = {
    web: {
        client_id: "954938476114-jplsbq9fjhj0k4gmsq4fdvajrqhfr4dc.apps.googleusercontent.com",
        project_id: "llamalearn-classroom",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uris: [
            "http://localhost:3000/auth/google/callback",
            "http://localhost:8502/auth/google/callback"
        ],
        javascript_origins: [
            "http://localhost:3000",
            "http://localhost:8502"
        ]
    }
};