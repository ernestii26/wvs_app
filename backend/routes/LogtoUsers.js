import { Router } from "express";
import fetchAccessToken from "./token";
import { ENDPOINT } from "../constants/Uri";
import RolesNameToId from "../lib/NameToId";
import AllowAdminEmail from "../constants/AllowEmail";
import { requireAuth } from "../middleware/auth";

const LogtoUsersRouter = Router();

const GetUser = async (req, res) => {
    const userId = req.params.userId
    const adminAccessToken = await fetchAccessToken();
    const userRes = await fetch(`${ENDPOINT}/api/users/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${adminAccessToken}`, // 從 Logto 管理介面取得
            'Content-Type': 'application/json',
        }
    });
    const data = await userRes.json()
    res.status(userRes.status).json(data);
}

const UpdateUser = async (req, res) => {
    const { userData } = req.body;
    const userId = req.params.userId;
    const adminAccessToken = await fetchAccessToken();
    const userRes = await fetch(`${ENDPOINT}/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${adminAccessToken}`, // 從 Logto 管理介面取得
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
    const data = await userRes.json();
    res.status(userRes.status).json(data);
}

const GetUserCustomData = async (req, res) => {
    const userId = req.params.userId;
    const adminAccessToken = await fetchAccessToken();
    const userRes = await fetch(`${ENDPOINT}/api/users/${userId}/custom-data`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${adminAccessToken}`, // 從 Logto 管理介面取得
            'Content-Type': 'application/json',
        }
    });
    const data = await userRes.json()
    res.status(userRes.status).json(data);
}

const UpdateUserCustomData = async (req, res) => {
    const { customData } = req.body;
    const userId = req.params.userId;
    const adminAccessToken = await fetchAccessToken();
    const userRes = await fetch(`${ENDPOINT}/api/users/${userId}/custom-data`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${adminAccessToken}`, // 從 Logto 管理介面取得
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "customData": customData,
        }),
    });
    const data = await userRes.json();
    res.status(userRes.status).json(data);
}

const GetRoleToUsers = async (req, res) => {
    const userId = req.params.userId
    const adminAccessToken = await fetchAccessToken();
    const userRes = await fetch(`${ENDPOINT}/api/users/${userId}/roles`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${adminAccessToken}`, // 從 Logto 管理介面取得
            'Content-Type': 'application/json',
        }
    });
    const data = await userRes.json()
    res.status(userRes.status).json(data);
}

const UpdateRoleToUsers = async (req, res) => {
    const {roles, email} = req.body;
    if (roles.includes('Admin') && (!email || !AllowAdminEmail.includes(email)))
            return res.sendStatus(403);
    const userId = req.params.userId;
    const adminAccessToken = await fetchAccessToken();
    const roleIds = RolesNameToId(roles);
    const userRes = await fetch(`${ENDPOINT}/api/users/${userId}/roles`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${adminAccessToken}`, // 從 Logto 管理介面取得
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "roleIds": roleIds, // 或保留原本 roles 加上新角色
        }),
    });
    res.sendStatus(userRes.status);
}

const AssignRoleToUsers = async (req, res) => {
    const {roles, email} = req.body;
    if ('Admin' in roles && !(email in AllowAdminEmail))
            res.sendStatus(403);
    const userId = req.params.userId;
    const adminAccessToken = await fetchAccessToken();
    const roleIds = RolesNameToId(roles);
    const userRes = await fetch(`${ENDPOINT}/api/users/${userId}/roles`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${adminAccessToken}`, // 從 Logto 管理介面取得
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "roleIds": roleIds, // 或保留原本 roles 加上新角色
        }),
    });
    res.sendStatus(userRes.status);
}

LogtoUsersRouter.get("/:userId", requireAuth(), GetUser);
LogtoUsersRouter.patch("/:userId", requireAuth(), UpdateUser);
LogtoUsersRouter.get("/:userId/custom-data", requireAuth(), GetUserCustomData);
LogtoUsersRouter.patch("/:userId/custom-data", requireAuth(), UpdateUserCustomData);
LogtoUsersRouter.get("/:userId/roles", requireAuth(), GetRoleToUsers);
LogtoUsersRouter.put("/:userId/roles", requireAuth(), UpdateRoleToUsers);
LogtoUsersRouter.post("/:userId/roles", requireAuth(), AssignRoleToUsers);
export default LogtoUsersRouter;