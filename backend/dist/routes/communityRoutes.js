"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const communityController_1 = require("../controllers/communityController");
const router = (0, express_1.Router)();
router.get('/', communityController_1.getCommunities);
router.get('/:communityId', communityController_1.getCommunityById);
exports.default = router;
//# sourceMappingURL=communityRoutes.js.map