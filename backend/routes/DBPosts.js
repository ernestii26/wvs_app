import { Router } from "express";
import prisma from "../prisma/prisma";
import { requireAuth } from "../middleware/auth";
import { PostsTake } from "../constants/Uri";

const DBPostsRouter = Router();

const GetCursorPosts = async (req, res) => {
    try {
        const { cursor } = req.body;
        const newPosts = await prisma.post.findMany({
            take: PostsTake + 1,
            ...(cursor
                ? {
                    cursor: { id: cursor },
                    skip: 1, // 跳過 cursor 那一筆
                }
                : {}),
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                author: true
            }
        })

        let nextCursor = null;
        if (newPosts.length > PostsTake) {
          const nextItem = newPosts.pop(); // 拿掉多出來那一筆
            nextCursor = nextItem.id;
        }

        res.status(200).json({
            newPosts,
            nextCursor, // 前端用來抓下一頁
        });
    } catch (error) {
        console.error("[GetCursorPosts] Error:", error);
        res.status(500).json({ message: "無法獲取貼文列表", error: error.message });
    }
}

const CreatePost = async (req, res) => {
    try {
        const { userId, title, content, image } = req.body;
        
        if (!userId || title === undefined || title === null) {
            return res.status(400).json({ message: "userId 和 title 為必填欄位" });
        }
        
        const newPost = await prisma.post.create({
            data: {
                title: title,
                content: content || '',
                image: image || null,
                authorId: userId
            }
        })

        res.status(200).json(newPost)
    } catch (error) {
        console.error("[CreatePost] Error:", error);
        res.status(500).json({ message: "無法創建貼文", error: error.message });
    }
}

const GetIdPost = async (req, res) => {
    try {
        const { userId, postId } = req.body;
        const post = await prisma.post.findUnique({
            where: {
                id: postId,
            },
            include: {
                author: true
            }
        });

        res.status(200).json(post)
    } catch (error) {
        console.error("[GetIdPost] Error:", error);
        res.status(500).json({ message: "無法獲取貼文", error: error.message });
    }
}

const GetUserPosts = async (req, res) => {
    try {
        const { userId, cursor } = req.body;
        
        if (!userId) {
            return res.status(400).json({ message: "userId 為必填欄位" });
        }

        const userPosts = await prisma.post.findMany({
            where: {
                authorId: userId
            },
            take: PostsTake + 1,
            ...(cursor
                ? {
                    cursor: { id: cursor },
                    skip: 1,
                }
                : {}),
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                author: true
            }
        });

        let nextCursor = null;
        if (userPosts.length > PostsTake) {
            const nextItem = userPosts.pop();
            nextCursor = nextItem.id;
        }

        res.status(200).json({
            newPosts: userPosts,
            nextCursor,
        });
    } catch (error) {
        console.error("[GetUserPosts] Error:", error);
        res.status(500).json({ message: "無法獲取用戶貼文", error: error.message });
    }
}

DBPostsRouter.post("/cursor", requireAuth(), GetCursorPosts);
DBPostsRouter.post("/create", requireAuth(), CreatePost);
DBPostsRouter.post("/get", requireAuth(), GetIdPost);
DBPostsRouter.post("/user", requireAuth(), GetUserPosts);
export default DBPostsRouter;