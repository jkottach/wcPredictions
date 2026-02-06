"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("./config");
const database_1 = require("./config/database");
const errorHandler_1 = require("./middleware/errorHandler");
// Routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const matchRoutes_1 = __importDefault(require("./routes/matchRoutes"));
const predictionRoutes_1 = __importDefault(require("./routes/predictionRoutes"));
const leaderboardRoutes_1 = __importDefault(require("./routes/leaderboardRoutes"));
const communityRoutes_1 = __importDefault(require("./routes/communityRoutes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.config.server.frontendUrl,
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.config.rateLimit.windowMs,
    max: config_1.config.rateLimit.maxRequests,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/matches', matchRoutes_1.default);
app.use('/api/predictions', predictionRoutes_1.default);
app.use('/api/leaderboard', leaderboardRoutes_1.default);
app.use('/api/communities', communityRoutes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Error handler
app.use(errorHandler_1.errorHandler);
// Initialize server
const initializeApp = async () => {
    try {
        // Connect to MongoDB
        await (0, database_1.connectDB)();
        // Start server
        app.listen(config_1.config.server.port, () => {
            console.log(`✓ Server running on port ${config_1.config.server.port}`);
            console.log(`✓ Environment: ${config_1.config.server.nodeEnv}`);
        });
    }
    catch (error) {
        console.error('Failed to initialize app:', error);
        process.exit(1);
    }
};
exports.initializeApp = initializeApp;
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});
exports.default = app;
//# sourceMappingURL=app.js.map