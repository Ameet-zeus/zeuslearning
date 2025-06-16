"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAlerts = loadAlerts;
var alertData = [];
function loadAlerts(alertContainer) {
    if (!alertContainer)
        return;
    fetch('json/alerts.json')
        .then(function (response) { return response.json(); })
        .then(function (data) {
        alertData = data;
        renderAlerts(alertContainer);
        updateAlertBubble();
    })
        .catch(function (err) { return console.error('Error fetching alerts:', err); });
}
function renderAlerts(alertContainer) {
    if (!alertContainer)
        return;
    alertContainer.innerHTML = alertData
        .map(function (item, index) { return "\n      <div class=\"alert-card ".concat(item.read ? '' : 'card-bg1', "\" data-index=\"").concat(index, "\">\n        <div class=\"header-row\">\n          <p class=\"alert-title\">").concat(item.title, "</p>\n          <img src=\"../assets/icons/").concat(item.read ? 'tick' : 'untick', ".svg\"\n               alt=\"").concat(item.read ? 'checkmark' : 'unread', "\"\n               class=\"toggle-alert-read\">\n        </div>\n        ").concat(item.course ? "<p class=\"alert-course\">".concat(item.course, "</p>") : '', "\n        <p class=\"alert-date\">").concat(item.date, "</p>\n      </div>\n    "); })
        .join('');
    alertContainer.querySelectorAll(".toggle-alert-read").forEach(function (icon) {
        icon.addEventListener("click", function (e) {
            var target = e.target;
            var card = target.closest("[data-index]");
            var index = card ? parseInt(card.dataset.index || '', 10) : NaN;
            if (!isNaN(index)) {
                alertData[index].read = !alertData[index].read;
                renderAlerts(alertContainer);
                updateAlertBubble();
            }
        });
    });
}
function updateAlertBubble() {
    var alertBubble = document.getElementById("alerts-bubble");
    if (!alertBubble)
        return;
    var unreadCount = alertData.filter(function (item) { return !item.read; }).length;
    if (unreadCount > 0) {
        alertBubble.textContent = unreadCount.toString();
        alertBubble.style.display = 'block';
    }
    else {
        alertBubble.style.display = 'none';
    }
}
