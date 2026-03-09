import { Router } from "express";
import prisma from "../prisma/prisma";
import { requireAuth } from "../middleware/auth";

const DBCommentsRouter = Router();

// 獲取某個貼文的所有評論
const GetPostComments = async (req, res) => {
    try {
        const { postId } = req.body;
        
        if (!postId) {
            return res.status(400).json({ message: "postId 為必填欄位" });
        }

        const comments = await prisma.comment.findMany({
            where: {
                postId: postId
            },
            orderBy: {
                createdAt: 'asc'
            },
            include: {
                author: true
            }
        });

        res.status(200).json(comments);
    } catch (error) {
        console.error("[GetPostComments] Error:", error);
        res.status(500).json({ message: "無法獲取評論列表", error: error.message });
    }
}

// 創建新評論
const CreateComment = async (req, res) => {
    try {
        const { postId, userId, content } = req.body;
        
        if (!postId || !userId || !content) {
            return res.status(400).json({ message: "postId, userId 和 content 為必填欄位" });
        }
        
        const newComment = await prisma.comment.create({
            data: {
                content: content,
                postId: postId,
                authorId: userId
            },
            include: {
                author: true
            }
        });

        res.status(200).json(newComment);
    } catch (error) {
        console.error("[CreateComment] Error:", error);
        res.status(500).json({ message: "無法創建評論", error: error.message });
    }
}

// 刪除評論
const DeleteComment = async (req, res) => {
    try {
        const { commentId, userId } = req.body;
        
        if (!commentId || !userId) {
            return res.status(400).json({ message: "commentId 和 userId 為必填欄位" });
        }

        // 檢查評論是否存在且屬於該用戶
        const comment = await prisma.comment.findUnique({
            where: { id: parseInt(commentId) }
        });

        if (!comment) {
            return res.status(404).json({ message: "評論不存在" });
        }

        if (comment.authorId !== userId) {
            return res.status(403).json({ message: "無權刪除此評論" });
        }

        await prisma.comment.delete({
            where: { id: parseInt(commentId) }
        });

        res.status(200).json({ message: "評論刪除成功" });
    } catch (error) {
        console.error("[DeleteComment] Error:", error);
        res.status(500).json({ message: "無法刪除評論", error: error.message });
    }
}

DBCommentsRouter.post("/post", requireAuth(), GetPostComments);
DBCommentsRouter.post("/create", requireAuth(), CreateComment);
DBCommentsRouter.post("/delete", requireAuth(), DeleteComment);

export default DBCommentsRouter;
