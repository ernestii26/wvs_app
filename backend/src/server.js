import express from 'express';
import cors from 'cors';
import router from '../routes/index';
import prisma from '../prisma/prisma';

const app = express();
const port = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());
app.use('/', router);

app.listen(port, () =>
    console.log(`App listening on port ${port}!`),
);

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    console.log('Prisma Client Disconnected');
    process.exit();
});

process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    console.log('Prisma Client Disconnected');
    process.exit();
});
