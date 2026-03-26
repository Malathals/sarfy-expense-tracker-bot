import 'dotenv/config';
import express from 'express';
import router from './routes/index';
import { errorHandler } from './middleware/errorHandler';
import logger from './lib/logger';

const app = express();
const PORT = 2020;

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Telegram Expense Bot API is running');
});

app.use('/api/v1', router);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server is running');
});
