"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var courseCard_1 = require("../component/courseCard");
var footer_1 = require("../component/footer");
var alerts_1 = require("../component/alerts");
var announcement_1 = require("../component/announcement");
// ALERTS AND ANNOUNCEMENTS DROPDOWN
document.addEventListener("DOMContentLoaded", function () {
    var alertContainer = document.getElementById("alerts-data");
    var announceContainer = document.getElementById("announcements-data");
    if (alertContainer)
        (0, alerts_1.loadAlerts)(alertContainer);
    if (announceContainer)
        (0, announcement_1.loadAnnouncements)(announceContainer);
});
// RENDER COURSES
fetch("../json/courses.json")
    .then(function (response) { return response.json(); })
    .then(function (data) {
    var container = document.getElementById("course-container");
    if (!container)
        return;
    data.forEach(function (course) {
        var card = (0, courseCard_1.createCourseCard)(course);
        container.appendChild(card);
    });
});
// RENDER FOOTER
var footerContainer = document.getElementById("footer-container");
if (footerContainer) {
    footerContainer.appendChild((0, footer_1.renderFooter)());
}
// NAVBAR SWITCH TAB
function switchTab(clickedTab, type) {
    document.querySelectorAll(".nav-tab").forEach(function (tab) {
        tab.classList.remove("active");
    });
    clickedTab.classList.add("active");
}
// COURSE CLASSES SWITCH TAB
function switchTab2(clickedTab, type) {
    document.querySelectorAll(".tab").forEach(function (tab) {
        tab.classList.remove("active");
    });
    clickedTab.classList.add("active");
}
// NAVBAR HAMBURGER SUBTABS
function toggleSubTabs(tabName) {
    var allSubTabs = document.querySelectorAll(".sub-tab");
    var subTabClass = "";
    switch (tabName) {
        case "content":
            subTabClass = "course-tab";
            break;
        case "users":
            subTabClass = "user-tab";
            break;
        case "reports":
            subTabClass = "report-tab";
            break;
        case "admin":
            subTabClass = "admin-tab";
            break;
    }
    if (!subTabClass) {
        allSubTabs.forEach(function (tab) { return tab.style.display = "none"; });
        document.querySelectorAll(".arrow").forEach(function (icon) { return icon.classList.remove("rotated"); });
        return;
    }
    var subTabs = document.querySelectorAll(".".concat(subTabClass));
    var toggleTab;
    document.querySelectorAll(".hamburger-tab").forEach(function (el) {
        var _a;
        if (((_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim().toUpperCase()) === tabName.toUpperCase()) {
            toggleTab = el;
        }
    });
    var arrowIcon = toggleTab === null || toggleTab === void 0 ? void 0 : toggleTab.querySelector(".arrow");
    var isOpen = subTabs.length > 0 && getComputedStyle(subTabs[0]).display !== "none";
    if (isOpen) {
        subTabs.forEach(function (tab) { return tab.style.display = "none"; });
        if (arrowIcon)
            arrowIcon.classList.remove("rotated");
    }
    else {
        allSubTabs.forEach(function (tab) { return tab.style.display = "none"; });
        subTabs.forEach(function (tab) { return tab.style.display = "flex"; });
        if (arrowIcon)
            arrowIcon.classList.add("rotated");
        document.querySelectorAll(".arrow").forEach(function (icon) {
            if (icon !== arrowIcon)
                icon.classList.remove("rotated");
        });
    }
}
// DROPDOWN LOGIC
document.addEventListener("DOMContentLoaded", function () {
    function setupHoverMenu(tabSelector, menuSelector, imgSelector, hoverImgSrc) {
        var tab = document.querySelector(tabSelector);
        var menu = document.querySelector(menuSelector);
        var img = tab === null || tab === void 0 ? void 0 : tab.querySelector(imgSelector);
        if (!tab || !menu || !img)
            return;
        if (!img.dataset.originalSrc) {
            img.dataset.originalSrc = img.src;
        }
        tab.addEventListener("mouseenter", function () {
            menu.classList.add("show");
            menu.hidden = false;
            img.src = hoverImgSrc;
        });
        tab.addEventListener("mouseleave", function () {
            setTimeout(function () {
                if (!menu.matches(":hover")) {
                    menu.classList.remove("show");
                    menu.hidden = true;
                    img.src = img.dataset.originalSrc;
                }
            }, 200);
        });
        menu.addEventListener("mouseenter", function () {
            menu.classList.add("show");
            menu.hidden = false;
        });
        menu.addEventListener("mouseleave", function () {
            menu.classList.remove("show");
            menu.hidden = true;
            img.src = img.dataset.originalSrc;
        });
    }
    setupHoverMenu('[data-tab="alerts"]', "#alert-dropdown", "img", "./assets/icons/alert-active.svg");
    setupHoverMenu('[data-tab="announcements"]', "#announcement-dropdown", "img", "./assets/icons/announcement-active.svg");
    setupHoverMenu(".hamburg", "#mobile-menu", "img", "./assets/icons/hamburger-menu-active.svg");
});
window.switchTab = switchTab;
window.switchTab2 = switchTab2;
window.toggleSubTabs = toggleSubTabs;
