// filepath: /c:/Users/merce/Desktop/Bonita/BonitaBack/src/controller/TAXXA/TAXXAUtils.js
const axios = require('axios');
const dotenv = require('dotenv');
const { Token } = require('../../data'); // Importa el modelo de Sequelize para el token

dotenv.config();

const TAXXA_API_URL = process.env.TAXXA_API_URL;
const TAXXA_EMAIL = process.env.TAXAA_EMAIL;
const TAXXA_PASSWORD = process.env.TAXXA_PASSWORD;
let   CURRENT_TOKEN = process.env.TAXAA_TOKEN;


console.log('TAXXA_API_URL:', TAXXA_API_URL);
async function generateToken() {
    const url = TAXXA_API_URL;
    const payload = {
        jApi: {
            sMethod: 'classTAXXA.fjTokenGenerate',
            jParams: {
                sEmail: "bonitaBoutiquecumaral@gmail.com",
                sPass: "F3lec2024*"
            },
        },
    };

    try {
        const response = await axios.post(url, payload);
        const data = response.data;

        if (data.rerror === 0) {
            const newToken = data.jret.stoken;
            console.log('New token generated:', newToken);
            CURRENT_TOKEN = newToken; // Update the current token

            // Guardar el token en la base de datos
            await Token.create({
                token: newToken,
                // Puedes agregar otros campos como fecha de creación, etc.
            });

            return newToken;
        } else {
            console.error('Error generating token:', data);
            return null;
        }
    } catch (error) {
        console.error('Request error:', error);
        return null;
    }
}

console.log('TAXXA_API_URL:', TAXXA_API_URL);
async function generateToken() {
    const url = TAXXA_API_URL;
    const payload = {
        jApi: {
            sMethod: 'classTAXXA.fjTokenGenerate',
            jParams: {
                sEmail: "bonitaBoutiquecumaral@gmail.com",
                sPass: "F3lec2024*"
            },
        },
    };

    try {
        const response = await axios.post(url, payload);
        const data = response.data;

        if (data.rerror === 0) {
            const newToken = data.jret.stoken;
            console.log('New token generated:', newToken);
            CURRENT_TOKEN = newToken; // Update the current token

            // Guardar el token en la base de datos
            await Token.create({
                token: newToken,
                // Puedes agregar otros campos como fecha de creación, etc.
            });

            return newToken;
        } else {
            console.error('Error generating token:', data);
            return null;
        }
    } catch (error) {
        console.error('Request error:', error);
        return null;
    }
}

async function sendDocument(documentData, token = CURRENT_TOKEN) {
    const url = TAXXA_API_URL;
    const payload = {
        stoken: token,
        jApi: documentData,
    };

    try {
        const response = await axios.post(url, payload);
        const data = response.data;

        if (data && typeof data === 'object' && data.rerror === 9) { // Assuming rerror 9 means token expired
            console.log('Token expired. Generating a new token...');
            const newToken = await generateToken();
            if (newToken) {
                // Retry sending the document with the new token
                return sendDocument(documentData, newToken);
            } else {
                console.error('Failed to generate a new token. Document not sent.');
                throw new Error('Failed to generate a new token. Document not sent.');
            }
        } else if (data && typeof data === 'object' && data.rerror !== 0) {
            // Lanzar un error si la respuesta de Taxxa tiene un código de error diferente de 0
            console.error('Error sending document:', data);
            const error = new Error(`Error sending document: ${JSON.stringify(data)}`);
            error.response = { data: data }; // Incluir la data en el objeto response
            throw error;
        } else {
            // Process the successful response here
            console.log('Document sent successfully:', data);
            return data;
        }
    } catch (error) {
        console.error('Request error:', error);
        throw error;
    }
}

module.exports = {
    generateToken,
    sendDocument
};