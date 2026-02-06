"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getUserProfile = exports.login = exports.register = void 0;
const models_1 = require("../models");
const auth_1 = require("../utils/auth");
const register = async (req, res) => {
    try {
        const { email, firstName, lastName, password, city, state, country, communityId1, communityId2, whatsappNumber } = req.body;
        const existingUser = await models_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        // Validate communities exist if provided
        if (communityId1) {
            const community1 = await models_1.Community.findOne({ communityId: communityId1 });
            if (!community1) {
                return res.status(400).json({ error: 'Community 1 not found' });
            }
        }
        if (communityId2) {
            const community2 = await models_1.Community.findOne({ communityId: communityId2 });
            if (!community2) {
                return res.status(400).json({ error: 'Community 2 not found' });
            }
        }
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const user = new models_1.User({
            userId,
            email,
            firstName,
            lastName,
            password: hashedPassword,
            city,
            state,
            country,
            communityId1,
            communityId2,
            whatsappNumber,
            status: 'active',
            isActive: true,
        });
        await user.save();
        const token = (0, auth_1.generateToken)(userId, email);
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                userId,
                email,
                firstName,
                lastName,
                city,
                state,
                country,
                communityId1,
                communityId2,
            },
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await models_1.User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const passwordMatch = await (0, auth_1.comparePasswords)(password, user.password || '');
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = (0, auth_1.generateToken)(user.userId, user.email);
        res.json({
            message: 'Login successful',
            token,
            user: {
                userId: user.userId,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                city: user.city,
                state: user.state,
                country: user.country,
                communityId1: user.communityId1,
                communityId2: user.communityId2,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};
exports.login = login;
const getUserProfile = async (req, res) => {
    try {
        const user = await models_1.User.findOne({ userId: req.user?.userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            userId: user.userId,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            city: user.city,
            state: user.state,
            country: user.country,
            communityId1: user.communityId1,
            communityId2: user.communityId2,
            whatsappNumber: user.whatsappNumber,
            status: user.status,
            isActive: user.isActive,
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
};
exports.getUserProfile = getUserProfile;
const updateUserProfile = async (req, res) => {
    try {
        const { firstName, lastName, city, state, country, whatsappNumber, communityId1, communityId2 } = req.body;
        const user = await models_1.User.findOne({ userId: req.user?.userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (firstName)
            user.firstName = firstName;
        if (lastName)
            user.lastName = lastName;
        if (city)
            user.city = city;
        if (state)
            user.state = state;
        if (country)
            user.country = country;
        if (whatsappNumber)
            user.whatsappNumber = whatsappNumber;
        if (communityId1)
            user.communityId1 = communityId1;
        if (communityId2)
            user.communityId2 = communityId2;
        await user.save();
        res.json({
            message: 'Profile updated successfully',
            user: {
                userId: user.userId,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                city: user.city,
                state: user.state,
                country: user.country,
                communityId1: user.communityId1,
                communityId2: user.communityId2,
            },
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
exports.updateUserProfile = updateUserProfile;
//# sourceMappingURL=authController.js.map