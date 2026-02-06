"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation error',
            details: err.details,
        });
    }
    if (err.name === 'MongoError' && err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            error: `${field} already exists`,
        });
    }
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map