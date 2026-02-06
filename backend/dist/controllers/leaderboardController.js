"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStats = exports.getCommunityLeaderboard = exports.getDailyLeaderboard = exports.getTopLeaderboard = void 0;
const models_1 = require("../models");
const leaderboardService_1 = require("../services/leaderboardService");
const getTopLeaderboard = async (req, res) => {
    try {
        const { limit = '30' } = req.query;
        const limitNum = parseInt(limit, 10);
        // Generate fresh leaderboard from database
        const leaderboard = await (0, leaderboardService_1.generateTopLeaderboard)(limitNum);
        res.json({
            leaderboard,
            source: 'database',
        });
    }
    catch (error) {
        console.error('Get top leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
};
exports.getTopLeaderboard = getTopLeaderboard;
const getDailyLeaderboard = async (req, res) => {
    try {
        const { limit = '30', date } = req.query;
        const limitNum = parseInt(limit, 10);
        const today = date ? new Date(date) : new Date();
        today.setHours(0, 0, 0, 0);
        // Generate fresh leaderboard from database
        const leaderboard = await (0, leaderboardService_1.generateDailyLeaderboard)(limitNum);
        res.json({
            leaderboard,
            source: 'database',
        });
    }
    catch (error) {
        console.error('Get daily leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch daily leaderboard' });
    }
};
exports.getDailyLeaderboard = getDailyLeaderboard;
const getCommunityLeaderboard = async (req, res) => {
    try {
        const { limit = '30' } = req.query;
        const limitNum = parseInt(limit, 10);
        // Generate fresh leaderboard from database
        const leaderboard = await (0, leaderboardService_1.generateCommunityLeaderboard)(limitNum);
        res.json({
            leaderboard,
            source: 'database',
        });
    }
    catch (error) {
        console.error('Get community leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch community leaderboard' });
    }
};
exports.getCommunityLeaderboard = getCommunityLeaderboard;
const getUserStats = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const topRank = await models_1.TopLeader.findOne({ userId });
        const dailyRank = await models_1.DailyLeader.findOne({ userId });
        res.json({
            overall: topRank || { rank: 'N/A', totalPoints: 0 },
            daily: dailyRank || { rank: 'N/A', totalPoints: 0 },
        });
    }
    catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
};
exports.getUserStats = getUserStats;
//# sourceMappingURL=leaderboardController.js.map