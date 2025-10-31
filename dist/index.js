"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./server/app");
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const app = (0, app_1.createServer)();
app.listen(port, () => {
    console.log(`Social Network microservice listening on http://localhost:${port}`);
});
