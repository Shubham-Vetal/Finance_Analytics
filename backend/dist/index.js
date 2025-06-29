"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = __importDefault(require("./router/index"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: 'http://localhost:3000', credentials: true }));
app.use((0, compression_1.default)());
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.json());
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/default';
mongoose_1.default.Promise = Promise;
mongoose_1.default.connect(MONGO_URL);
mongoose_1.default.connection.on('connected', () => {
    console.log('✅ MongoDB Connected');
});
mongoose_1.default.connection.on('error', (err) => {
    console.log('❌ MongoDB connection error:', err);
});
app.use('/', index_1.default);
const server = http_1.default.createServer(app);
server.listen(8080, () => {
    console.log('🚀 Server running on http://localhost:8080');
});
//# sourceMappingURL=index.js.map