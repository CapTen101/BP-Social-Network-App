"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const posts_routes_1 = require("../web/routes/posts.routes");
const errorHandler_1 = require("../web/middleware/errorHandler");
function createServer() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)()); // enable CORS for all routes
    app.use(express_1.default.json()); // parse JSON bodies
    app.use((0, morgan_1.default)("dev")); // log requests to the console
    app.get("/", (req, res) => {
        res.json({ message: "Welcome to Social Network Application Backend!" });
    });
    // health check endpoint
    app.get("/health", (req, res) => {
        res.json({ status: "ok" });
    });
    // feature routes
    app.use("/api/v1/posts", posts_routes_1.postsRouter);
    // centralized error handling
    app.use(errorHandler_1.errorHandler);
    return app;
}
