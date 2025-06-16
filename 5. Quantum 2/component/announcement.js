"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAnnouncements = loadAnnouncements;
var dataAnnounce = [];
function loadAnnouncements(announceContainer) {
    if (!announceContainer)
        return;
    fetch('json/announcements.json')
        .then(function (response) { return response.json(); })
        .then(function (data) {
        dataAnnounce = data;
        renderAnnouncements(announceContainer);
        updateAnnouncementBubble();
    })
        .catch(function (err) { return console.error('Error fetching announcements:', err); });
}
function renderAnnouncements(announceContainer) {
    if (!announceContainer)
        return;
    announceContainer.innerHTML = dataAnnounce
        .map(function (item, index) { return "\n      <div class=\"".concat(item.read ? '' : 'card-bg1', "\" data-index=\"").concat(index, "\">\n        <div class=\"header-row\">\n          <p class=\"ann-name\">PA: ").concat(item.annName, "</p>\n          <img src=\"../assets/icons/").concat(item.read ? 'tick' : 'untick', ".svg\"\n               alt=\"").concat(item.read ? 'checkmark' : 'unread', "\"\n               class=\"toggle-read\">\n        </div>\n        <div class=\"ann-content\">\n          <p class=\"ann-title\">").concat(item.title, "</p>\n          ").concat(item.courseClass ? "<p class=\"ann-course-class\">".concat(item.courseClass, "</p>") : '', "\n          <p class=\"files-date\">\n            <span class=\"files\">\n              ").concat(item.files ? "<img src=\"../assets/icons/attachment.svg\" alt=\"attachment\"> <span>".concat(item.files, " files are attached</span>") : '', "\n            </span>\n            <span class=\"date\">").concat(item.date, "</span>\n          </p>\n        </div>\n      </div>\n    "); })
        .join('');
    announceContainer.querySelectorAll(".toggle-read").forEach(function (icon) {
        icon.addEventListener("click", function (e) {
            var target = e.target;
            var parent = target.closest("[data-index]");
            var index = parent ? parseInt(parent.dataset.index || '', 10) : NaN;
            if (!isNaN(index)) {
                dataAnnounce[index].read = !dataAnnounce[index].read;
                renderAnnouncements(announceContainer);
                updateAnnouncementBubble();
            }
        });
    });
}
function updateAnnouncementBubble() {
    var announcementBubble = document.getElementById("announcements-bubble");
    if (!announcementBubble)
        return;
    var unreadCount = dataAnnounce.filter(function (item) { return !item.read; }).length;
    if (unreadCount > 0) {
        announcementBubble.textContent = unreadCount.toString();
        announcementBubble.style.display = 'block';
    }
    else {
        announcementBubble.style.display = 'none';
    }
}
