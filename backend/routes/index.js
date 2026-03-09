import { Router } from 'express';
import LogtoUsersRouter from './LogtoUsers';
import DBPostsRouter from './DBPosts';
import DBUsersRouter from './DBUsers';
import DBQuestionsRouter from './DBQuestions';
import DBCommentsRouter from './DBComments';

const router = Router();
router.use('/api/logto/users/', LogtoUsersRouter);
router.use('/api/db/posts/', DBPostsRouter);
router.use('/api/db/users/', DBUsersRouter);
router.use('/api/db/questions/', DBQuestionsRouter);
router.use('/api/db/comments/', DBCommentsRouter);
export default router;