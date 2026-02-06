"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const models_1 = require("../models");
const config_1 = require("../config");
const communities = [
    {
        communityId: 'mmnj',
        name: 'MMNJ',
        state: 'New Jersey',
        city: 'Multiple Cities',
        address: 'New Jersey Area',
    },
    {
        communityId: 'gso',
        name: 'GSO',
        state: 'North Carolina',
        city: 'Greensboro',
        address: 'Greensboro, NC Area',
    },
    {
        communityId: 'nanma',
        name: 'NANMA',
        state: 'Massachusetts',
        city: 'Multiple Cities',
        address: 'North America - New England/Massachusetts Area',
    },
    {
        communityId: 'velicham',
        name: 'Velicham',
        state: 'Texas',
        city: 'Multiple Cities',
        address: 'Texas Area',
    },
];
async function seedCommunities() {
    try {
        await mongoose_1.default.connect(config_1.config.mongodb.uri);
        console.log('✓ Connected to MongoDB');
        // Clear existing communities
        await models_1.Community.deleteMany({});
        console.log('✓ Cleared existing communities');
        // Insert new communities
        const result = await models_1.Community.insertMany(communities);
        console.log(`✓ Seeded ${result.length} communities`);
        result.forEach((community) => {
            console.log(`  - ${community.name} (${community.communityId})`);
        });
        await mongoose_1.default.disconnect();
        console.log('✓ Disconnected from MongoDB');
        process.exit(0);
    }
    catch (error) {
        console.error('✗ Error seeding communities:', error);
        process.exit(1);
    }
}
seedCommunities();
//# sourceMappingURL=seedCommunities.js.map