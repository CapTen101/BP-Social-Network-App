"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUUIDParam = validateUUIDParam;
const zod_1 = require("zod");
const errors_1 = require("../../infrastructure/errors");
const uuidSchema = zod_1.z.string().uuid();
function validateUUIDParam(paramName) {
    return (req, _res, next) => {
        const value = req.params[paramName];
        const result = uuidSchema.safeParse(value);
        if (!result.success) {
            return next(new errors_1.ValidationError(`${paramName} must be a valid UUID`));
        }
        next();
    };
}
