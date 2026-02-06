"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMatch = exports.createMatch = exports.getMatchById = exports.getAllMatches = void 0;
const models_1 = require("../models");
const getAllMatches = async (req, res) => {
    try {
        const { status, page = '1', limit = '10' } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        const filter = {};
        if (status) {
            filter.status = status;
        }
        const matches = await models_1.Match.find(filter)
            .sort({ matchTime: -1 })
            .skip(skip)
            .limit(limitNum);
        const total = await models_1.Match.countDocuments(filter);
        res.json({
            matches,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.error('Get matches error:', error);
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
};
exports.getAllMatches = getAllMatches;
const getMatchById = async (req, res) => {
    try {
        const { matchId } = req.params;
        const match = await models_1.Match.findOne({ matchId });
        if (!match) {
            return res.status(404).json({ error: 'Match not found' });
        }
        res.json(match);
    }
    catch (error) {
        console.error('Get match error:', error);
        res.status(500).json({ error: 'Failed to fetch match' });
    }
};
exports.getMatchById = getMatchById;
const createMatch = async (req, res) => {
    try {
        const { matchId, sequence, team1, team2, matchTime, predictionsEndingTime, round, matchTag, comment } = req.body;
        const existingMatch = await models_1.Match.findOne({ matchId });
        if (existingMatch) {
            return res.status(400).json({ error: 'Match already exists' });
        }
        const match = new models_1.Match({
            matchId,
            sequence,
            team1,
            team2,
            matchTime: new Date(matchTime),
            predictionsEndingTime: new Date(predictionsEndingTime),
            round,
            matchTag,
            comment,
            status: 'scheduled',
        });
        await match.save();
        res.status(201).json({
            message: 'Match created successfully',
            match,
        });
    }
    catch (error) {
        console.error('Create match error:', error);
        res.status(500).json({ error: 'Failed to create match' });
    }
};
exports.createMatch = createMatch;
const updateMatch = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { team1Score, team2Score, status } = req.body;
        const match = await models_1.Match.findOne({ matchId });
        if (!match) {
            return res.status(404).json({ error: 'Match not found' });
        }
        if (team1Score !== undefined)
            match.team1Score = team1Score;
        if (team2Score !== undefined)
            match.team2Score = team2Score;
        if (status)
            match.status = status;
        await match.save();
        res.json({
            message: 'Match updated successfully',
            match,
        });
    }
    catch (error) {
        console.error('Update match error:', error);
        res.status(500).json({ error: 'Failed to update match' });
    }
};
exports.updateMatch = updateMatch;
//# sourceMappingURL=matchController.js.map