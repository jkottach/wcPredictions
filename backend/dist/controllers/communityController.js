"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommunityById = exports.getCommunities = void 0;
const models_1 = require("../models");
const getCommunities = async (req, res) => {
    try {
        const communities = await models_1.Community.find().select('communityId name state city').sort('name');
        res.json(communities);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch communities' });
    }
};
exports.getCommunities = getCommunities;
const getCommunityById = async (req, res) => {
    try {
        const { communityId } = req.params;
        const community = await models_1.Community.findOne({ communityId });
        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }
        res.json(community);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch community' });
    }
};
exports.getCommunityById = getCommunityById;
//# sourceMappingURL=communityController.js.map