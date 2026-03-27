"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationEvent = exports.NOTIFICATIONS_QUEUE = void 0;
exports.NOTIFICATIONS_QUEUE = 'notifications';
var NotificationEvent;
(function (NotificationEvent) {
    NotificationEvent["NEW_MESSAGE"] = "new_message";
    NotificationEvent["PAYMENT_RECEIVED"] = "payment_received";
    NotificationEvent["CONSULTATION_CONFIRMED"] = "consultation_confirmed";
    NotificationEvent["NEW_REVIEW"] = "new_review";
    NotificationEvent["LAWYER_VERIFIED"] = "lawyer_verified";
    NotificationEvent["CONSULTATION_DISPUTED"] = "consultation_disputed";
    NotificationEvent["ESCROW_RELEASED"] = "escrow_released";
    NotificationEvent["ORDER_CONFIRMED"] = "order_confirmed";
})(NotificationEvent || (exports.NotificationEvent = NotificationEvent = {}));
//# sourceMappingURL=notifications.constants.js.map