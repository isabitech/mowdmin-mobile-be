import * as brevo from '@getbrevo/brevo';
import dotenv from "dotenv";

dotenv.config();

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();

// Configure API key authentication
let apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

export default apiInstance;
