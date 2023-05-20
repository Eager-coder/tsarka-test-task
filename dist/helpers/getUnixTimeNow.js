"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getUnixTimeNow() {
    return Math.floor(Date.now() / 1000);
}
exports.default = getUnixTimeNow;
