"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const errors_1 = require("../../infrastructure/errors");
// maps domain/application errors to HTTP responses.
// keeps controllers thin and consistent.
function errorHandler(err, req, res, next) {
    if (err instanceof errors_1.ValidationError) {
        return res.status(400).json({ error: err.message });
    }
    if (err instanceof errors_1.NotFoundError) {
        return res.status(404).json({ error: err.message });
    }
    if (err instanceof errors_1.ConflictError) {
        return res.status(409).json({ error: err.message });
    }
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal Server Error" }); // return server error if neither of the above cases are met
}
