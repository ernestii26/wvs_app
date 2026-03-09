import { Router } from "express";
import prisma from "../prisma/prisma";
import { requireAuth } from "../middleware/auth";
import { PostsTake } from "../constants/Uri";

const DBQuestionsRouter = Router();

const GetCursorQuestions = async (req, res) => {
    try {
        const { cursor } = req.body;
        const newQuestions = await prisma.question.findMany({
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
        if (newQuestions.length > PostsTake) {
            const nextItem = newQuestions.pop(); // 拿掉多出來那一筆
            nextCursor = nextItem.id;
        }

        res.status(200).json({
            newQuestions,
            nextCursor, // 前端用來抓下一頁
        });
    } catch (error) {
        console.error("[GetCursorQuestions] Error:", error);
        res.status(500).json({ message: "無法獲取問題列表", error: error.message });
    }
}

const CreateQuestion = async (req, res) => {
    try {
        const { userId, title, content, image } = req.body;
        
        if (!userId || title === undefined || title === null) {
            return res.status(400).json({ message: "userId 和 title 為必填欄位" });
        }
        
        const newQuestion = await prisma.question.create({
            data: {
                title: title,
                content: content || '',
                image: image || null,
                authorId: userId
            }
        })

        res.status(200).json(newQuestion)
    } catch (error) {
        console.error("[CreateQuestion] Error:", error);
        res.status(500).json({ message: "無法創建問題", error: error.message });
    }
}

const GetIdQuestion = async (req, res) => {
    try {
        const { userId, questionId } = req.body;
        const question = await prisma.question.findUnique({
            where: {
                id: questionId,
            },
            include: {
                author: true
            }
        });

        res.status(200).json(question)
    } catch (error) {
        console.error("[GetIdQuestion] Error:", error);
        res.status(500).json({ message: "無法獲取問題", error: error.message });
    }
}

const GetUserQuestions = async (req, res) => {
    try {
        const { userId, cursor } = req.body;
        
        if (!userId) {
            return res.status(400).json({ message: "userId 為必填欄位" });
        }

        const userQuestions = await prisma.question.findMany({
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
        if (userQuestions.length > PostsTake) {
            const nextItem = userQuestions.pop();
            nextCursor = nextItem.id;
        }

        res.status(200).json({
            userQuestions,
            nextCursor
        });
    } catch (error) {
        console.error("[GetUserQuestions] Error:", error);
        res.status(500).json({ message: "無法獲取用戶問題列表", error: error.message });
    }
}

DBQuestionsRouter.post("/cursor", requireAuth(), GetCursorQuestions);
DBQuestionsRouter.post("/create", requireAuth(), CreateQuestion);
DBQuestionsRouter.post("/id", requireAuth(), GetIdQuestion);
DBQuestionsRouter.post("/user", requireAuth(), GetUserQuestions);

export default DBQuestionsRouter;
