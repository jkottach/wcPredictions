"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePasswords = exports.hashPassword = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = require("../config");
const generateToken = (userId, email) => {
    return jsonwebtoken_1.default.sign({ userId, email }, config_1.config.jwt.secret, {
        expiresIn: config_1.config.jwt.expiresIn,
    });
};
exports.generateToken = generateToken;
const hashPassword = async (password) => {
    const salt = await bcryptjs_1.default.genSalt(10);
    return bcryptjs_1.default.hash(password, salt);
};
exports.hashPassword = hashPassword;
const comparePasswords = async (password, hash) => {
    return bcryptjs_1.default.compare(password, hash);
};
exports.comparePasswords = comparePasswords;
//# sourceMappingURL=auth.js.map