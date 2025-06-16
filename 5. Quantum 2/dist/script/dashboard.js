import { createCourseCard } from "../component/courseCard";
import { renderFooter } from "../component/footer";
import { loadAlerts } from "../component/alerts";
import { loadAnnouncements } from "../component/announcement";
// ALERTS AND ANNOUNCEMENTS DROPDOWN
document.addEventListener("DOMContentLoaded", () => {
    const alertContainer = document.getElementById("alerts-data");
    const announceContainer = document.getElementById("announcements-data");
    if (alertContainer)
        loadAlerts(alertContainer);
    if (announceContainer)
        loadAnnouncements(announceContainer);
});
// RENDER COURSES
fetch("../json/courses.json")
    .then(response => response.json())
    .then((data) => {
    const container = document.getElementById("course-container");
    if (!container)
        return;
    data.forEach(course => {
        const card = createCourseCard(course);
        container.appendChild(card);
    });
});
// RENDER FOOTER
const footerContainer = document.getElementById("footer-container");
if (footerContainer) {
    footerContainer.appendChild(renderFooter());
}
// NAVBAR SWITCH TAB
function switchTab(clickedTab, type) {
    document.querySelectorAll(".nav-tab").forEach(tab => {
        tab.classList.remove("active");
    });
    clickedTab.classList.add("active");
}
// COURSE CLASSES SWITCH TAB
function switchTab2(clickedTab, type) {
    document.querySelectorAll(".tab").forEach(tab => {
        tab.classList.remove("active");
    });
    clickedTab.classList.add("active");
}
// NAVBAR HAMBURGER SUBTABS
function toggleSubTabs(tabName) {
    const allSubTabs = document.querySelectorAll(".sub-tab");
    let subTabClass = "";
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
        allSubTabs.forEach(tab => tab.style.display = "none");
        document.querySelectorAll(".arrow").forEach(icon => icon.classList.remove("rotated"));
        return;
    }
    const subTabs = document.querySelectorAll(`.${subTabClass}`);
    let toggleTab;
    document.querySelectorAll(".hamburger-tab").forEach(el => {
        var _a;
        if (((_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim().toUpperCase()) === tabName.toUpperCase()) {
            toggleTab = el;
        }
    });
    const arrowIcon = toggleTab === null || toggleTab === void 0 ? void 0 : toggleTab.querySelector(".arrow");
    const isOpen = subTabs.length > 0 && getComputedStyle(subTabs[0]).display !== "none";
    if (isOpen) {
        subTabs.forEach(tab => tab.style.display = "none");
        if (arrowIcon)
            arrowIcon.classList.remove("rotated");
    }
    else {
        allSubTabs.forEach(tab => tab.style.display = "none");
        subTabs.forEach(tab => tab.style.display = "flex");
        if (arrowIcon)
            arrowIcon.classList.add("rotated");
        document.querySelectorAll(".arrow").forEach(icon => {
            if (icon !== arrowIcon)
                icon.classList.remove("rotated");
        });
    }
}
// DROPDOWN LOGIC
document.addEventListener("DOMContentLoaded", () => {
    function setupHoverMenu(tabSelector, menuSelector, imgSelector, hoverImgSrc) {
        const tab = document.querySelector(tabSelector);
        const menu = document.querySelector(menuSelector);
        const img = tab === null || tab === void 0 ? void 0 : tab.querySelector(imgSelector);
        if (!tab || !menu || !img)
            return;
        if (!img.dataset.originalSrc) {
            img.dataset.originalSrc = img.src;
        }
        tab.addEventListener("mouseenter", () => {
            menu.classList.add("show");
            menu.hidden = false;
            img.src = hoverImgSrc;
        });
        tab.addEventListener("mouseleave", () => {
            setTimeout(() => {
                if (!menu.matches(":hover")) {
                    menu.classList.remove("show");
                    menu.hidden = true;
                    img.src = img.dataset.originalSrc;
                }
            }, 200);
        });
        menu.addEventListener("mouseenter", () => {
            menu.classList.add("show");
            menu.hidden = false;
        });
        menu.addEventListener("mouseleave", () => {
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
