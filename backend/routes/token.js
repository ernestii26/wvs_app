import { TOKEN_POINT, M2MId, M2MSecret, ENDPOINT } from "../constants/Uri";

const fetchAccessToken = async () => {
    const res = await fetch(TOKEN_POINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${M2MId}:${M2MSecret}`).toString(
                'base64'
            )}`,
        },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            resource: `${ENDPOINT}/api`,
            scope: 'all',
        }).toString(),
    });
    const data = await res.json();
    return data.access_token;
};

export default fetchAccessToken;