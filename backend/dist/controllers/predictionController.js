"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePrediction = exports.updatePrediction = exports.getUserPredictions = exports.submitPrediction = void 0;
const models_1 = require("../models");
const submitPrediction = async (req, res) => {
    try {
        const { matchId, team1Score, team2Score, comment } = req.body;
        const userId = req.user?.userId;
        const email = req.user?.email;
        if (!userId || !email) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const match = await models_1.Match.findOne({ matchId });
        if (!match) {
            return res.status(404).json({ error: 'Match not found' });
        }
        // Check if prediction deadline has passed
        if (new Date() > match.predictionsEndingTime) {
            return res.status(400).json({ error: 'Prediction deadline has passed' });
        }
        // Check if user already predicted for this match
        const existingPrediction = await models_1.Prediction.findOne({ userId, matchId });
        if (existingPrediction) {
            return res.status(400).json({ error: 'You have already made a prediction for this match' });
        }
        const prediction = new models_1.Prediction({
            userId,
            email,
            matchId,
            matchTag: match.matchTag,
            team1Score,
            team2Score,
            comment,
            points: 0,
        });
        await prediction.save();
        res.status(201).json({
            message: 'Prediction submitted successfully',
            prediction,
        });
    }
    catch (error) {
        console.error('Submit prediction error:', error);
        res.status(500).json({ error: 'Failed to submit prediction' });
    }
};
exports.submitPrediction = submitPrediction;
const getUserPredictions = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { matchId, page = '1', limit = '10' } = req.query;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        const filter = { userId };
        if (matchId) {
            filter.matchId = matchId;
        }
        const predictions = await models_1.Prediction.find(filter)
            .sort({ submittedTime: -1 })
            .skip(skip)
            .limit(limitNum);
        const total = await models_1.Prediction.countDocuments(filter);
        res.json({
            predictions,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.error('Get predictions error:', error);
        res.status(500).json({ error: 'Failed to fetch predictions' });
    }
};
exports.getUserPredictions = getUserPredictions;
const updatePrediction = async (req, res) => {
    try {
        const { predictionId } = req.params;
        const { team1Score, team2Score, comment } = req.body;
        const userId = req.user?.userId;
        const prediction = await models_1.Prediction.findById(predictionId);
        if (!prediction) {
            return res.status(404).json({ error: 'Prediction not found' });
        }
        if (prediction.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized to update this prediction' });
        }
        const match = await models_1.Match.findOne({ matchId: prediction.matchId });
        if (match && new Date() > match.predictionsEndingTime) {
            return res.status(400).json({ error: 'Cannot update prediction after deadline' });
        }
        if (team1Score !== undefined)
            prediction.team1Score = team1Score;
        if (team2Score !== undefined)
            prediction.team2Score = team2Score;
        if (comment !== undefined)
            prediction.comment = comment;
        await prediction.save();
        res.json({
            message: 'Prediction updated successfully',
            prediction,
        });
    }
    catch (error) {
        console.error('Update prediction error:', error);
        res.status(500).json({ error: 'Failed to update prediction' });
    }
};
exports.updatePrediction = updatePrediction;
const deletePrediction = async (req, res) => {
    try {
        const { predictionId } = req.params;
        const userId = req.user?.userId;
        const prediction = await models_1.Prediction.findById(predictionId);
        if (!prediction) {
            return res.status(404).json({ error: 'Prediction not found' });
        }
        if (prediction.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized to delete this prediction' });
        }
        const match = await models_1.Match.findOne({ matchId: prediction.matchId });
        if (match && new Date() > match.predictionsEndingTime) {
            return res.status(400).json({ error: 'Cannot delete prediction after deadline' });
        }
        await models_1.Prediction.deleteOne({ _id: predictionId });
        res.json({ message: 'Prediction deleted successfully' });
    }
    catch (error) {
        console.error('Delete prediction error:', error);
        res.status(500).json({ error: 'Failed to delete prediction' });
    }
};
exports.deletePrediction = deletePrediction;
//# sourceMappingURL=predictionController.js.map