import { createCourseCard } from "../component/courseCard.js";
import { renderFooter } from "../component/footer.js";
import { loadAlerts } from '../component/alerts.js';
import { loadAnnouncements } from '../component/announcement.js';



// ALERTS AND ANNOUNCEMENTS DROPDOWN
document.addEventListener("DOMContentLoaded", () => {
  const alertContainer = document.getElementById("alerts-data");
  const announceContainer = document.getElementById("announcements-data");
  if (alertContainer) {
    loadAlerts(alertContainer);
  }
  if (announceContainer) {
    loadAnnouncements(announceContainer);
  }
});

// RENDER COURSES
fetch('../json/courses.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById("course-container");
    data.forEach(course => {
      const card = createCourseCard(course);
      container.appendChild(card);
    });
  });


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



//TOGGLE INSPECTORS
window.switchTab = switchTab;
window.switchTab2 = switchTab2;
window.toggleSubTabs = toggleSubTabs;