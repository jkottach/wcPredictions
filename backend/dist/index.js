"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
(0, app_1.initializeApp)().catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map