const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

class ClassroomService {
    constructor() {
        this.oauth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
        
        this.classroom = google.classroom({ version: 'v1' });
        this.drive = google.drive({ version: 'v3' });
    }

    getAuthUrl() {
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/classroom.courses',
                'https://www.googleapis.com/auth/classroom.coursework.students',
                'https://www.googleapis.com/auth/classroom.rosters',
                'https://www.googleapis.com/auth/drive.file'
            ]
        });
    }

    async getTokenFromCode(code) {
        const { tokens } = await this.oauth2Client.getToken(code);
        return tokens;
    }

    async setCredentials(tokens) {
        this.oauth2Client.setCredentials(tokens);
        this.classroom = google.classroom({ version: 'v1', auth: this.oauth2Client });
        this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    }

    async listCourses() {
        try {
            const response = await this.classroom.courses.list({
                pageSize: 10,
            });
            return response.data.courses || [];
        } catch (error) {
            console.error('Error listing courses:', error);
            throw new Error('Failed to list courses');
        }
    }

    async uploadPdfToDrive(filePath, fileName) {
        try {
            const response = await this.drive.files.create({
                requestBody: {
                    name: fileName,
                    mimeType: 'application/pdf',
                },
                media: {
                    mimeType: 'application/pdf',
                    body: require('fs').createReadStream(filePath),
                },
            });
            return response.data.id;
        } catch (error) {
            console.error('Error uploading file to Drive:', error);
            throw new Error('Failed to upload file to Drive');
        }
    }

    async createCourseMaterial(courseId, title, description, fileId) {
        try {
            const response = await this.classroom.courses.courseWorkMaterials.create({
                courseId: courseId,
                requestBody: {
                    title: title,
                    description: description,
                    materials: [
                        {
                            driveFile: {
                                driveFile: {
                                    id: fileId,
                                },
                                shareMode: 'VIEW',
                            },
                        },
                    ],
                    state: 'PUBLISHED',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating course material:', error);
            throw new Error('Failed to create course material');
        }
    }

    async createAssignment(courseId, title, description, dueDate) {
        try {
            const response = await this.classroom.courses.courseWork.create({
                courseId: courseId,
                requestBody: {
                    title: title,
                    description: description,
                    workType: 'ASSIGNMENT',
                    state: 'PUBLISHED',
                    dueDate: dueDate ? {
                        year: dueDate.getFullYear(),
                        month: dueDate.getMonth() + 1,
                        day: dueDate.getDate(),
                    } : undefined,
                    dueTime: dueDate ? {
                        hours: dueDate.getHours(),
                        minutes: dueDate.getMinutes(),
                    } : undefined,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating assignment:', error);
            throw new Error('Failed to create assignment');
        }
    }

    async getStudents(courseId) {
        try {
            const response = await this.classroom.courses.students.list({
                courseId: courseId,
            });
            return response.data.students || [];
        } catch (error) {
            console.error('Error getting students:', error);
            throw new Error('Failed to get students');
        }
    }

    async getTeachers(courseId) {
        try {
            const response = await this.classroom.courses.teachers.list({
                courseId: courseId,
            });
            return response.data.teachers || [];
        } catch (error) {
            console.error('Error getting teachers:', error);
            throw new Error('Failed to get teachers');
        }
    }
}

module.exports = new ClassroomService();
