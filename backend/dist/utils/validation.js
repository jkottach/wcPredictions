"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = exports.schemas = void 0;
const joi_1 = __importDefault(require("joi"));
exports.schemas = {
    register: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        firstName: joi_1.default.string().min(2).required(),
        lastName: joi_1.default.string().min(2).required(),
        password: joi_1.default.string().min(6).required(),
        whatsappNumber: joi_1.default.string(),
        city: joi_1.default.string(),
        state: joi_1.default.string(),
        country: joi_1.default.string(),
        communityId1: joi_1.default.string(),
        communityId2: joi_1.default.string(),
    }),
    login: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().required(),
    }),
    prediction: joi_1.default.object({
        matchId: joi_1.default.string().required(),
        team1Score: joi_1.default.number().min(0).required(),
        team2Score: joi_1.default.number().min(0).required(),
        comment: joi_1.default.string(),
    }),
    match: joi_1.default.object({
        matchId: joi_1.default.string().required(),
        sequence: joi_1.default.number().required(),
        team1: joi_1.default.string().required(),
        team2: joi_1.default.string().required(),
        matchTime: joi_1.default.date().required(),
        predictionsEndingTime: joi_1.default.date().required(),
        round: joi_1.default.number().required(),
        matchTag: joi_1.default.string().required(),
    }),
};
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            console.error('Validation error:', error.details);
            return res.status(400).json({
                error: 'Validation failed',
                details: error.details.map((d) => ({
                    field: d.path.join('.'),
                    message: d.message,
                })),
            });
        }
        req.validatedBody = value;
        next();
    };
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validation.js.map