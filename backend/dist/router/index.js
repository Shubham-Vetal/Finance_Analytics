"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_1 = require("./authentication");
const router = (0, express_1.Router)();
(0, authentication_1.authenticationRoutes)(router);
exports.default = router;
//# sourceMappingURL=index.js.map