"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateLeaderboardCache = exports.generateCommunityLeaderboard = exports.generateDailyLeaderboard = exports.generateTopLeaderboard = void 0;
const models_1 = require("../models");
const generateTopLeaderboard = async (limit = 30) => {
    try {
        const results = await models_1.Result.aggregate([
            {
                $group: {
                    _id: '$userId',
                    totalPoints: { $sum: '$matchPoints' },
                    userName: { $first: '$userName' },
                    email: { $first: '$email' },
                },
            },
            { $sort: { totalPoints: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'user',
                },
            },
            {
                $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    userId: '$_id',
                    totalPoints: 1,
                    userName: 1,
                    email: 1,
                    state: '$user.state',
                    community1: '$user.communityId1',
                    community2: '$user.communityId2',
                },
            },
        ]);
        // Add rank
        const leaderboard = results.map((item, index) => ({
            rank: index + 1,
            ...item,
        }));
        // Update TopLeader collection
        await models_1.TopLeader.deleteMany({});
        await models_1.TopLeader.insertMany(leaderboard);
        return leaderboard;
    }
    catch (error) {
        console.error('Error generating top leaderboard:', error);
        return [];
    }
};
exports.generateTopLeaderboard = generateTopLeaderboard;
const generateDailyLeaderboard = async (limit = 30) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const results = await models_1.Result.aggregate([
            {
                $match: {
                    createdAt: { $gte: today },
                },
            },
            {
                $group: {
                    _id: '$userId',
                    totalPoints: { $sum: '$matchPoints' },
                    userName: { $first: '$userName' },
                    email: { $first: '$email' },
                },
            },
            { $sort: { totalPoints: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'user',
                },
            },
            {
                $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    userId: '$_id',
                    totalPoints: 1,
                    userName: 1,
                    email: 1,
                    state: '$user.state',
                    community1: '$user.communityId1',
                    community2: '$user.communityId2',
                },
            },
        ]);
        const leaderboard = results.map((item, index) => ({
            rank: index + 1,
            date: today,
            ...item,
        }));
        // Update DailyLeader collection
        await models_1.DailyLeader.deleteMany({ date: { $gte: today } });
        await models_1.DailyLeader.insertMany(leaderboard);
        return leaderboard;
    }
    catch (error) {
        console.error('Error generating daily leaderboard:', error);
        return [];
    }
};
exports.generateDailyLeaderboard = generateDailyLeaderboard;
const generateCommunityLeaderboard = async (limit = 30) => {
    try {
        const results = await models_1.CommunityResult.aggregate([
            {
                $group: {
                    _id: '$communityId',
                    totalPoints: { $sum: '$communityMatchPoint' },
                },
            },
            { $sort: { totalPoints: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'communities',
                    localField: '_id',
                    foreignField: 'communityId',
                    as: 'community',
                },
            },
            {
                $unwind: {
                    path: '$community',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    communityId: '$_id',
                    communityName: '$community.name',
                    totalPoints: 1,
                },
            },
        ]);
        const leaderboard = results.map((item, index) => ({
            rank: index + 1,
            ...item,
        }));
        // Update CommunityLeader collection
        await models_1.CommunityLeader.deleteMany({});
        await models_1.CommunityLeader.insertMany(leaderboard);
        return leaderboard;
    }
    catch (error) {
        console.error('Error generating community leaderboard:', error);
        return [];
    }
};
exports.generateCommunityLeaderboard = generateCommunityLeaderboard;
const invalidateLeaderboardCache = async () => {
    try {
        // Cache invalidation no longer needed - using direct database queries
        console.log('✓ Leaderboard data refreshed from database');
    }
    catch (error) {
        console.error('Error refreshing leaderboard:', error);
    }
};
exports.invalidateLeaderboardCache = invalidateLeaderboardCache;
//# sourceMappingURL=leaderboardService.js.map