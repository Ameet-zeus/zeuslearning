import { createCourseCard } from "../component/courseCard";
import { renderFooter } from "../component/footer";
import { loadAlerts } from "../component/alerts";
import { loadAnnouncements } from "../component/announcement";

interface Course {
  title: string;
  image: string;
  subject: string;
  grade: string | number;
  units?: number;
  lessons?: number;
  topics?: number;
  teacher?: string;
  students?: number;
  startDate?: string;
  endDate?: string;
  icons?: {
    preview?: boolean;
    calendar?: boolean;
    clone?: boolean;
    report?: boolean;
  };
  starred: boolean;
}

// ALERTS AND ANNOUNCEMENTS DROPDOWN
document.addEventListener("DOMContentLoaded", () => {
  const alertContainer = document.getElementById("alerts-data");
  const announceContainer = document.getElementById("announcements-data");

  if (alertContainer) loadAlerts(alertContainer);
  if (announceContainer) loadAnnouncements(announceContainer);
});

// RENDER COURSES
fetch("../json/courses.json")
  .then(response => response.json())
  .then((data: Course[]) => {
    const container = document.getElementById("course-container");
    if (!container) return;
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
function switchTab(clickedTab: HTMLElement, type: string): void {
  document.querySelectorAll<HTMLElement>(".nav-tab").forEach(tab => {
    tab.classList.remove("active");
  });
  clickedTab.classList.add("active");
}

// COURSE CLASSES SWITCH TAB
function switchTab2(clickedTab: HTMLElement, type: string): void {
  document.querySelectorAll<HTMLElement>(".tab").forEach(tab => {
    tab.classList.remove("active");
  });
  clickedTab.classList.add("active");
}

// NAVBAR HAMBURGER SUBTABS
function toggleSubTabs(tabName: string): void {
  const allSubTabs = document.querySelectorAll<HTMLElement>(".sub-tab");

  let subTabClass = "";
  switch (tabName) {
    case "content": subTabClass = "course-tab"; break;
    case "users": subTabClass = "user-tab"; break;
    case "reports": subTabClass = "report-tab"; break;
    case "admin": subTabClass = "admin-tab"; break;
  }

  if (!subTabClass) {
    allSubTabs.forEach(tab => tab.style.display = "none");
    document.querySelectorAll<HTMLElement>(".arrow").forEach(icon => icon.classList.remove("rotated"));
    return;
  }

  const subTabs = document.querySelectorAll<HTMLElement>(`.${subTabClass}`);
  let toggleTab: HTMLElement | undefined;

  document.querySelectorAll<HTMLElement>(".hamburger-tab").forEach(el => {
    if (el.textContent?.trim().toUpperCase() === tabName.toUpperCase()) {
      toggleTab = el;
    }
  });


  const arrowIcon = toggleTab?.querySelector<HTMLElement>(".arrow");

  const isOpen = subTabs.length > 0 && getComputedStyle(subTabs[0]).display !== "none";

  if (isOpen) {
    subTabs.forEach(tab => tab.style.display = "none");
    if (arrowIcon) arrowIcon.classList.remove("rotated");
  } else {
    allSubTabs.forEach(tab => tab.style.display = "none");
    subTabs.forEach(tab => tab.style.display = "flex");
    if (arrowIcon) arrowIcon.classList.add("rotated");

    document.querySelectorAll<HTMLElement>(".arrow").forEach(icon => {
      if (icon !== arrowIcon) icon.classList.remove("rotated");
    });
  }
}

// DROPDOWN LOGIC
document.addEventListener("DOMContentLoaded", () => {
  function setupHoverMenu(
    tabSelector: string,
    menuSelector: string,
    imgSelector: string,
    hoverImgSrc: string
  ): void {
    const tab = document.querySelector<HTMLElement>(tabSelector);
    const menu = document.querySelector<HTMLElement>(menuSelector);
    const img = tab?.querySelector<HTMLImageElement>(imgSelector);

    if (!tab || !menu || !img) return;

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
          img.src = img.dataset.originalSrc!;
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
      img.src = img.dataset.originalSrc!;
    });
  }

  setupHoverMenu('[data-tab="alerts"]', "#alert-dropdown", "img", "./assets/icons/alert-active.svg");
  setupHoverMenu('[data-tab="announcements"]', "#announcement-dropdown", "img", "./assets/icons/announcement-active.svg");
  setupHoverMenu(".hamburg", "#mobile-menu", "img", "./assets/icons/hamburger-menu-active.svg");
});

// Make functions globally accessible
declare global {
  interface Window {
    switchTab: typeof switchTab;
    switchTab2: typeof switchTab2;
    toggleSubTabs: typeof toggleSubTabs;
  }
}

window.switchTab = switchTab;
window.switchTab2 = switchTab2;
window.toggleSubTabs = toggleSubTabs;
