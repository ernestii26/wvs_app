import { Router } from "express";
import prisma from "../prisma/prisma";
import { requireAuth } from "../middleware/auth";

const DBUsersRouter = Router();

const UpsertUser = async (req, res) => {
    const { where, update, create } = req.body;
    
    try {
        // ✅ 步驟 1：先檢查用戶是否存在
        const existingUser = await prisma.user.findUnique({
            where
        });

        let user;
        if (existingUser) {
            // ✅ 用戶存在：更新允許的欄位
            console.log(`[DBUsers] User ${where.id} exists, updating...`);
            
            const updateData = {};
            
            // 更新 avatar（始終允許）
            if (update?.avatar !== undefined) {
                updateData.avatar = update.avatar;
            }
            
            // 更新 displayName（檢查 0 天冷卻期 - 測試用）
            if (update?.displayName !== undefined) {
                if (existingUser.lastDisplayNameChange) {
                    const daysSinceLastChange = (Date.now() - new Date(existingUser.lastDisplayNameChange).getTime()) / (1000 * 60 * 60 * 24);
                    if (daysSinceLastChange < 0) {
                        const remainingDays = Math.ceil(0 - daysSinceLastChange);
                        return res.status(429).json({ 
                            message: `顯示名稱每 0 天只能改一次，還需等待 ${remainingDays} 天`,
                            code: "DISPLAY_NAME_COOLDOWN",
                            remainingDays
                        });
                    }
                }
                updateData.displayName = update.displayName;
                updateData.lastDisplayNameChange = new Date();
            }
            
            user = await prisma.user.update({
                where,
                data: updateData
            });
        } else {
            // ✅ 用戶不存在：新建用戶
            console.log(`[DBUsers] User ${where.id} does not exist, creating...`);
            user = await prisma.user.create({
                data: {
                    id: create?.id || where.id,
                    username: create?.username,
                    displayName: create?.displayName || create?.username,
                    avatar: create?.avatar,
                }
            });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("[DBUsers] UpsertUser error:", error);
        
        if (error.code === 'P2002') {
            const field = error.meta?.target?.[0] || 'unknown';
            return res.status(409).json({ 
                message: `${field} already exists`,
                code: "UNIQUE_CONSTRAINT_VIOLATION",
                field
            });
        }
        
        if (error.code === 'P2025') {
            return res.status(404).json({ 
                message: "User not found",
                code: "USER_NOT_FOUND"
            });
        }
        
        res.status(500).json({ 
            message: "Internal server error",
            details: error.message 
        });
    }
}

DBUsersRouter.post("/:userId/upsert", requireAuth(), UpsertUser);
export default DBUsersRouter;