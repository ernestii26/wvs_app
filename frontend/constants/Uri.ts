// The redirect URI registered in Logto Console for the mobile application.
// This handles the callback after a successful sign-in.
const RedirectUri = 'wvs://callback';

// The Logto server endpoint (OIDC Issuer URL).
const ENDPOINT = 'https://m0xju1.logto.app';

// The base URL for Logto's core API.
const API_BASE_URL = `${ENDPOINT}/api`;

// The API Resource identifier (Audience).
// This is critical for obtaining a valid Access Token for your backend services.
const API_RESOURCE = 'https://api.m0xju1.logto.app/api';

// The unique Application ID (Client ID) provided by Logto Console.
const AppId = 'k57fns1jagvscm2mx4a3t';

// The URL of your custom backend server.
// It prioritizes the environment variable, falling back to localhost for local development.
const BackendURL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export { RedirectUri, ENDPOINT, API_BASE_URL, API_RESOURCE, AppId, BackendURL };