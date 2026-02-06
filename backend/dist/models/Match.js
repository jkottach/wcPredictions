"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Match = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const matchSchema = new mongoose_1.Schema({
    matchId: {
        type: String,
        unique: true,
        required: true,
        trim: true,
    },
    sequence: {
        type: Number,
        required: true,
    },
    team1: {
        type: String,
        required: true,
        trim: true,
    },
    team2: {
        type: String,
        required: true,
        trim: true,
    },
    team1Score: {
        type: Number,
    },
    team2Score: {
        type: Number,
    },
    matchTime: {
        type: Date,
        required: true,
    },
    predictionsEndingTime: {
        type: Date,
        required: true,
    },
    round: {
        type: Number,
        required: true,
    },
    comment: {
        type: String,
    },
    matchTag: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ['scheduled', 'ongoing', 'completed'],
        default: 'scheduled',
    },
}, { timestamps: true });
exports.Match = mongoose_1.default.model('Match', matchSchema);
//# sourceMappingURL=Match.js.map