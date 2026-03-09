import { createRemoteJWKSet, jwtVerify, decodeJwt } from "jose"
import { JWKS_URL, ISSUER, API_RESOURCE } from "../constants/Uri";

const getTokenFromHeader = (headers) => {
    const { authorization } = headers;
    const bearerTokenIdentifier = "Bearer";

    if (!authorization) {
        throw new Error("Authorization header missing");
    }

    if (!authorization.startsWith(bearerTokenIdentifier)) {
        throw new Error("Authorization token type not supported");
    }

    return authorization.slice(bearerTokenIdentifier.length + 1);
};

const hasScopes = (tokenScopes, requiredScopes) => {
    if (!requiredScopes || requiredScopes.length === 0) {
        return true;
    }
    const scopeSet = new Set(tokenScopes);
    return requiredScopes.every((scope) => scopeSet.has(scope));
};

const verifyJwt = async (token) => {
    const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

    const { payload } = await jwtVerify(token, JWKS, {
        issuer: ISSUER,
        audience: API_RESOURCE,
    }).catch(error => {
        const decoded = decodeJwt(token);
        console.log("Decoded JWT:", decoded);
        throw err;
    });

    return payload;
};

const requireAuth = (requiredScopes = []) => {
    return async (req, res, next) => {
        try {
            // 提取令牌
            const token = getTokenFromHeader(req.headers);

            // 驗證令牌
            const payload = await verifyJwt(token);

            // 添加用戶信息到請求
            req.user = {
                id: payload.sub,
                scopes: payload.scope?.split(" ") || [],
            };

            console.log(`${payload.sub} verifyJwt success`);

            // 驗證所需範圍
            if (!hasScopes(req.user.scopes, requiredScopes)) {
                throw new Error("權限不足");
            }

            next();
        } catch (error) {
            res.status(401).json({ error: "未授權" });
        }
    };
};

export { requireAuth, hasScopes };