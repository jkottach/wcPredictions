"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processMatchResults = exports.calculatePredictionPoints = void 0;
const models_1 = require("../models");
const SCORING = {
    correctResult: 5,
    correctTeam1Score: 2,
    correctTeam2Score: 2,
    correctGoalDifference: 1,
};
const calculatePredictionPoints = (predictedTeam1, predictedTeam2, actualTeam1, actualTeam2) => {
    let points = 0;
    // Check correct result (win/loss/draw)
    const predictedDiff = predictedTeam1 - predictedTeam2;
    const actualDiff = actualTeam1 - actualTeam2;
    if ((predictedDiff > 0 && actualDiff > 0) ||
        (predictedDiff < 0 && actualDiff < 0) ||
        (predictedDiff === 0 && actualDiff === 0)) {
        points += SCORING.correctResult;
    }
    // Check correct Team1 score
    if (predictedTeam1 === actualTeam1) {
        points += SCORING.correctTeam1Score;
    }
    // Check correct Team2 score
    if (predictedTeam2 === actualTeam2) {
        points += SCORING.correctTeam2Score;
    }
    // Check correct goal difference
    if (Math.abs(predictedDiff) === Math.abs(actualDiff)) {
        points += SCORING.correctGoalDifference;
    }
    return points;
};
exports.calculatePredictionPoints = calculatePredictionPoints;
const processMatchResults = async (matchId) => {
    try {
        const match = await models_1.Match.findOne({ matchId });
        if (!match || match.status !== 'completed') {
            throw new Error('Match not found or not completed');
        }
        if (match.team1Score === undefined || match.team2Score === undefined) {
            throw new Error('Match scores not set');
        }
        const predictions = await models_1.Prediction.find({ matchId });
        for (const prediction of predictions) {
            const points = (0, exports.calculatePredictionPoints)(prediction.team1Score, prediction.team2Score, match.team1Score, match.team2Score);
            prediction.points = points;
            await prediction.save();
            // Determine result
            const predictedDiff = prediction.team1Score - prediction.team2Score;
            const actualDiff = match.team1Score - match.team2Score;
            let result = 'loss';
            if ((predictedDiff > 0 && actualDiff > 0) ||
                (predictedDiff < 0 && actualDiff < 0)) {
                result = 'win';
            }
            else if (predictedDiff === 0 && actualDiff === 0) {
                result = 'draw';
            }
            const user = await models_1.User.findOne({ userId: prediction.userId });
            if (user) {
                const resultDoc = await models_1.Result.findOneAndUpdate({ userId: prediction.userId, matchId }, {
                    userId: prediction.userId,
                    userName: `${user.firstName} ${user.lastName}`,
                    matchId,
                    matchTag: prediction.matchTag,
                    result,
                    matchPoints: points,
                    finalPoints: points,
                    communityId1: user.communityId1,
                    communityId2: user.communityId2,
                }, { upsert: true, new: true });
            }
        }
        console.log(`✓ Processed results for match ${matchId}`);
    }
    catch (error) {
        console.error(`✗ Error processing results for match ${matchId}:`, error);
    }
};
exports.processMatchResults = processMatchResults;
//# sourceMappingURL=scoringService.js.map