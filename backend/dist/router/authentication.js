"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticationRoutes = void 0;
const authentication_1 = require("../controllers/authentication");
const index_1 = require("../middlewares/index");
const authenticationRoutes = (router) => {
    router.post('/auth/register', authentication_1.register);
    router.post('/auth/login', authentication_1.login);
    router.post('/auth/logout', index_1.isAuthenticated, authentication_1.logout);
    router.put('/auth/update', index_1.isAuthenticated, authentication_1.updateUser);
};
exports.authenticationRoutes = authenticationRoutes;
//# sourceMappingURL=authentication.js.map