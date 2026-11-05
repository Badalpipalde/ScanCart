"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const apiError_1 = require("../utils/apiError");
const authorize = (...allowedRoles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(apiError_1.ApiError.unauthorized('Authentication required'));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(apiError_1.ApiError.forbidden(`Access denied. Role '${req.user.role}' is not authorized to access this resource.`));
        }
        next();
    };
};
exports.authorize = authorize;
