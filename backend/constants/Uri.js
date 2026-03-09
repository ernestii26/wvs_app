const ENDPOINT = 'https://m0xju1.logto.app';
const API_BAES_URL = `${ENDPOINT}/api`
const API_RESOURCE = 'https://api.m0xju1.logto.app/api'
const JWKS_URL = 'https://m0xju1.logto.app/oidc/jwks'
const ISSUER = 'https://m0xju1.logto.app/oidc'
const TOKEN_POINT = `${ENDPOINT}/oidc/token`
const M2MId = process.env.M2M_ID
const M2MSecret = process.env.M2M_SECRET
const AppId = process.env.APP_ID;
const RoleNameToId = new Map([
    ['User', 'v677df9f2bjfiqhujnstq'],
    ['Admin', '09ugt1b4tckooa7wpiei8'],
    ['Handsome_guy', 'nzrjz9me3qurkfwbrly3h']
])
const PostsTake = 10


export { ENDPOINT, API_BAES_URL, API_RESOURCE, JWKS_URL, ISSUER, TOKEN_POINT, M2MId, M2MSecret, AppId, RoleNameToId, PostsTake };