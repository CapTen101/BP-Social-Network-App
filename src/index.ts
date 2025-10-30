import { createServer } from './server/app';

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const app = createServer();

app.listen(port, () => {
  console.log(`Social Network microservice listening on http://localhost:${port}`);
});
