import express from 'express';
import { prisma } from './lib/prisma';

const app = express();
const PORT = 2020;

app.get('/', (_req, res) => {
  console.log('Received request to root endpoint');
  res.send('Telegram Expense Bot API is running');
});

app.get('/expenses', async (_req, res) => {
  console.log('Fetching expenses from the database...');
  const expenses = await prisma.expense.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.json(expenses);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});