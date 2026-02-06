"use strict";
// Background jobs have been simplified without Redis/BullMQ
// Jobs are now processed synchronously or can be scheduled using node-cron if needed
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleLeaderboardGeneration = exports.scheduleScoreCalculation = exports.processLeaderboardGeneration = exports.processScoreCalculation = void 0;
const scoringService_1 = require("../services/scoringService");
const leaderboardService_1 = require("../services/leaderboardService");
// Score calculation
const processScoreCalculation = async (matchId) => {
    try {
        console.log(`Processing scores for match: ${matchId}`);
        await (0, scoringService_1.processMatchResults)(matchId);
        console.log(`✓ Score calculation completed for match: ${matchId}`);
        return { success: true, matchId };
    }
    catch (error) {
        console.error(`Score calculation failed for match ${matchId}:`, error);
        throw error;
    }
};
exports.processScoreCalculation = processScoreCalculation;
// Leaderboard generation
const processLeaderboardGeneration = async (type) => {
    try {
        console.log(`Generating ${type} leaderboard`);
        if (type === 'top') {
            await (0, leaderboardService_1.generateTopLeaderboard)(30);
        }
        else if (type === 'daily') {
            await (0, leaderboardService_1.generateDailyLeaderboard)(30);
        }
        else if (type === 'community') {
            await (0, leaderboardService_1.generateCommunityLeaderboard)(30);
        }
        console.log(`✓ ${type} leaderboard generation completed`);
        return { success: true, type };
    }
    catch (error) {
        console.error(`Leaderboard generation failed for type ${type}:`, error);
        throw error;
    }
};
exports.processLeaderboardGeneration = processLeaderboardGeneration;
// Utility function to schedule score calculation (can be called from match controller)
const scheduleScoreCalculation = async (matchId, _delayMs = 0) => {
    // Process immediately (or add delay logic if needed with setTimeout)
    return (0, exports.processScoreCalculation)(matchId);
};
exports.scheduleScoreCalculation = scheduleScoreCalculation;
// Utility function to schedule leaderboard generation (can be called from prediction controller)
const scheduleLeaderboardGeneration = async (type) => {
    // Process immediately
    return (0, exports.processLeaderboardGeneration)(type);
};
exports.scheduleLeaderboardGeneration = scheduleLeaderboardGeneration;
//# sourceMappingURL=queues.js.map