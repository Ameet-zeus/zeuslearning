import { createCourseCard } from "../component/courseCard.js";
import { renderFooter } from "../component/footer.js";

// COURSE DATA
const courseData = [
  {
    title: "Acceleration",
    subject: "Physics",
    grade: "7•2",
    units: 4,
    lessons: 18,
    topics: 24,
    teacher: "Mr. Frank's Class B",
    students: 50,
    startDate: "21-Jan-2020",
    endDate: "21-Aug-2020",
    image: "assets/images/imageMask-1.svg",
    starred: true,
    expired: false,
    icons: { preview: true, calendar: true, clone: true, report: true }
  },
  {
    title: "Displacement, Velocity and Speed",
    subject: "Physics",
    grade: "6•3",
    units: 2,
    lessons: 15,
    topics: 20,
    teacher: "No Classes",
    students: null,
    startDate: null,
    endDate: null,
    image: "assets/images/imageMask-2.svg",
    starred: true,
    expired: false,
    icons: { preview: true, calendar: false, clone: false, report: true }
  },
  {
    title: "Introduction to Biology: Microorganisms...",
    subject: "Biology",
    grade: "4•1",
    units: 5,
    lessons: 16,
    topics: 22,
    teacher: "All Classes",
    students: 300,
    startDate: null,
    endDate: null,
    image: "assets/images/imageMask.svg",
    starred: true,
    expired: false,
    icons: { preview: true, calendar: false, clone: false, report: true }
  },
  {
    title: "Introduction to High School Mathematics",
    subject: "Mathematics",
    grade: "8•3",
    units: null,
    lessons: null,
    topics: null,
    teacher: "Mr. Frank's Class A",
    students: 44,
    startDate: "14-Oct-2019",
    endDate: "20-Oct-2020",
    image: "assets/images/imageMask-3.svg",
    starred: false,
    expired: true,
    icons: { preview: true, calendar: true, clone: true, report: true }
  }
];

// RENDER COURSES
const container = document.getElementById("course-container");
courseData.forEach((course) => container.appendChild(createCourseCard(course)));

// RENDER FOOTER
const container2 = document.getElementById("footer-container");
container2.appendChild(renderFooter());

// NAVBAR SWITCH TAB
function switchTab(clickedTab, type) {
  document.querySelectorAll(".nav-tab").forEach((tab) => tab.classList.remove("active"));
  clickedTab.classList.add("active");
}

// COURSE CLASSES SWITCH TAB
function switchTab2(clickedTab, type) {
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
  clickedTab.classList.add("active");
}

// NAVBAR HAMBURGER SUBTABS
function toggleSubTabs(tabName) {
  document.querySelectorAll('.sub-tab').forEach(tab => tab.style.display = 'none');

  let subTabClass = '';
  switch (tabName) {
    case 'content': subTabClass = 'course-tab'; break;
    case 'users': subTabClass = 'user-tab'; break;
    case 'reports': subTabClass = 'report-tab'; break;
    case 'admin': subTabClass = 'admin-tab'; break;
  }

  if (subTabClass) {
    document.querySelectorAll(`.${subTabClass}`).forEach(tab => tab.style.display = 'block');
  }
}


//DROPDOWN LOGIC
document.addEventListener("DOMContentLoaded", function () {
  function setupHoverMenu(tabSelector, menuSelector, imgSelector, hoverImgSrc) {
    const tab = document.querySelector(tabSelector);
    const menu = document.querySelector(menuSelector);
    const img = tab.querySelector(imgSelector); // Select the image inside the tab

    if (!tab || !menu || !img) return;

    // Store the original image source in data-original-src if not already set
    if (!img.dataset.originalSrc) {
      img.dataset.originalSrc = img.src;
    }

    tab.addEventListener("mouseenter", () => {
      menu.classList.add("show");
      menu.hidden = false;
      // Change the image source on hover
      img.src = hoverImgSrc;
    });

    tab.addEventListener("mouseleave", () => {
      setTimeout(() => {
        if (!menu.matches(":hover")) {
          menu.classList.remove("show");
          menu.hidden = true;
          // Restore the original image source
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
      // Restore the original image source when mouse leaves the menu
      img.src = img.dataset.originalSrc;
    });
  }

  // Setup for alerts: original image is 'alerts.svg', hover image is 'alerts-hover.svg'
  setupHoverMenu('[data-tab="alerts"]', '#alert-dropdown', 'img', './assets/icons/alert-active.svg');
  
  // Setup for announcements: original image is 'announcements.svg', hover image is 'announcements-hover.svg'
  setupHoverMenu('[data-tab="announcements"]', '#announcement-dropdown', 'img', './assets/icons/announcement-active.svg');

  // Setup for hamburger menu: original image is 'hamburger-menu.svg', hover image is 'hamburger-menu-hover.svg'
  setupHoverMenu('.hamburg', '#mobile-menu', 'img', './assets/icons/hamburger-menu-active.svg');
});




window.switchTab = switchTab;
window.switchTab2 = switchTab2;
window.toggleSubTabs = toggleSubTabs;