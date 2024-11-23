const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

class ClassroomService {
    constructor() {
        this.oAuth2Client = null;
        this.classroom = null;
        this.tokens = null;
    }

    initialize(credentials) {
        this.oAuth2Client = new OAuth2Client(
            credentials.client_id,
            credentials.client_secret,
            credentials.redirect_uris[0]
        );
    }

    setCredentials(tokens) {
        if (!this.oAuth2Client) {
            throw new Error('OAuth2Client no inicializado');
        }
        
        this.tokens = tokens;
        this.oAuth2Client.setCredentials(tokens);
        this.classroom = google.classroom({ version: 'v1', auth: this.oAuth2Client });
        
        console.log('Credenciales establecidas correctamente');
    }

    getAuthUrl() {
        if (!this.oAuth2Client) {
            throw new Error('OAuth2Client no inicializado');
        }

        return this.oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/classroom.courses.readonly',
                'https://www.googleapis.com/auth/classroom.coursework.me',
                'https://www.googleapis.com/auth/classroom.coursework.students'
            ],
            prompt: 'consent'
        });
    }

    async getToken(code) {
        if (!this.oAuth2Client) {
            throw new Error('OAuth2Client no inicializado');
        }

        try {
            console.log('Obteniendo tokens con código:', code);
            const { tokens } = await this.oAuth2Client.getToken(code);
            console.log('Tokens obtenidos:', tokens);
            this.setCredentials(tokens);
            return tokens;
        } catch (error) {
            console.error('Error al obtener tokens:', error);
            throw error;
        }
    }

    async listCourses() {
        if (!this.classroom) {
            throw new Error('Classroom API no inicializada');
        }

        try {
            console.log('Listando cursos...');
            const response = await this.classroom.courses.list({
                pageSize: 10,
            });
            console.log('Respuesta de cursos:', response.data);
            return response.data.courses || [];
        } catch (error) {
            console.error('Error al listar cursos:', error);
            throw error;
        }
    }

    isAuthenticated() {
        return !!(this.oAuth2Client && this.tokens && this.classroom);
    }

    async refreshTokenIfNeeded() {
        if (this.tokens && this.tokens.expiry_date && Date.now() >= this.tokens.expiry_date) {
            try {
                console.log('Refrescando token...');
                const { tokens } = await this.oAuth2Client.refreshToken(this.tokens.refresh_token);
                this.setCredentials(tokens);
                console.log('Token refrescado exitosamente');
            } catch (error) {
                console.error('Error al refrescar token:', error);
                throw error;
            }
        }
    }
}

module.exports = new ClassroomService();
