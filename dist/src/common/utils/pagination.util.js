"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeCursor = encodeCursor;
exports.decodeCursor = decodeCursor;
function encodeCursor(id) {
    return Buffer.from(id).toString('base64url');
}
function decodeCursor(cursor) {
    return Buffer.from(cursor, 'base64url').toString('utf-8');
}
//# sourceMappingURL=pagination.util.js.map