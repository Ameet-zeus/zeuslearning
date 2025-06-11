// import { createCourseCard } from "../component/courseCard.js";
// import { renderFooter } from "../component/footer.js";

// // COURSE DATA
// const courseData = [
//   {
//     title: "Acceleration",
//     subject: "Physics",
//     grade: "7•2",
//     units: 4,
//     lessons: 18,
//     topics: 24,
//     teacher: "Mr. Frank's Class B",
//     students: 50,
//     startDate: "21-Jan-2020",
//     endDate: "21-Aug-2020",
//     image: "/assets/images/imageMask-1.svg",
//     starred: true,
//     expired: false,
//     icons: {
//       preview: true,
//       calendar: true,
//       clone: true,
//       report: true
//     }
//   },
//   {
//     title: "Displacement, Velocity and Speed",
//     subject: "Physics",
//     grade: "6•3",
//     units: 2,
//     lessons: 15,
//     topics: 20,
//     teacher: "No Classes",
//     students: null,
//     startDate: null,
//     endDate: null,
//     image: "/assets/images/imageMask-2.svg",
//     starred: true,
//     expired: false,
//     icons: {
//       preview: true,
//       calendar: false,
//       clone: false,
//       report: true
//     }
//   },
//   {
//     title: "Introduction to Biology: Microorganisms...",
//     subject: "Biology",
//     grade: "4•1",
//     units: 5,
//     lessons: 16,
//     topics: 22,
//     teacher: "All Classes",
//     students: 300,
//     startDate: null,
//     endDate: null,
//     image: "/assets/images/imageMask.svg",
//     starred: true,
//     expired: false,
//     icons: {
//       preview: true,
//       calendar: false,
//       clone: false,
//       report: true
//     }
//   },
//   {
//     title: "Introduction to High School Mathematics",
//     subject: "Mathematics",
//     grade: "8•3",
//     units: null,
//     lessons: null,
//     topics: null,
//     teacher: "Mr. Frank's Class A",
//     students: 44,
//     startDate: "14-Oct-2019",
//     endDate: "20-Oct-2020",
//     image: "/assets/images/imageMask-3.svg",
//     starred: false,
//     expired: true,
//     icons: {
//       preview: true,
//       calendar: true,
//       clone: true,
//       report: true
//     }
//   },
// ];

// //RENDER COURSES
// const container = document.getElementById("course-container");
// courseData.forEach((course) => container.appendChild(createCourseCard(course)));

// //RENDER FOOTER
// const container2 = document.getElementById("footer-container");
// container2.appendChild(renderFooter());

// //HAMBURGER ICON
// const hamburger = document.querySelector('.hamburg');
// const mobileMenu = document.getElementById('mobile-menu');

// hamburger.addEventListener('click', () => {
//   mobileMenu.hidden = !mobileMenu.hidden;
// });

// document.addEventListener('click', (event) => {
//   const isClickInside = hamburger.contains(event.target) || mobileMenu.contains(event.target);
//   if (!isClickInside) {
//     mobileMenu.hidden = true;
//   }
// });

// //NAV BAR HAMBUERGER SUBTABS
// function toggleSubTabs(tabName) {
//   document.querySelectorAll('.sub-tab').forEach(tab => {
//     tab.style.display = 'none';
//   });

//   let subTabClass = '';
//   switch (tabName) {
//     case 'content':
//       subTabClass = 'course-tab';
//       break;
//     case 'users':
//       subTabClass = 'user-tab';
//       break;
//     case 'reports':
//       subTabClass = 'report-tab';
//       break;
//     case 'admin':
//       subTabClass = 'admin-tab';
//       break;
//   }

//   if (subTabClass) {
//     document.querySelectorAll(`.${subTabClass}`).forEach(tab => {
//       tab.style.display = 'block';
//     });
//   }
// }

// //NAVBAR SWITCHTAB
// function switchTab(clickedTab, type) {
//   document
//     .querySelectorAll(".nav-tab")
//     .forEach((tab) => tab.classList.remove("active"));
//   clickedTab.classList.add("active");
// }


// //COURSE CLASSES SWITCH TAB
// function switchTab2(clickedTab, type) {
//   document
//     .querySelectorAll(".tab")
//     .forEach((tab) => tab.classList.remove("active"));
//   clickedTab.classList.add("active");
// }

// //DROPDOWN
// document.querySelectorAll('.nav-tab.dropdown').forEach(tab => {
//   tab.addEventListener('click', (e) => {
//     e.stopPropagation();
//     const dropdown = tab.nextElementSibling;
//     document.querySelectorAll('.dropdown-content').forEach(dc => {
//       if (dc !== dropdown) dc.classList.remove('show');
//     });
//     dropdown.classList.toggle('show');

//     const tabType = tab.getAttribute('data-tab');
//     if (tabType) {
//       switchTab(tab, tabType);
//     }
//   });
// });
// document.addEventListener('click', (e) => {
//   if (!e.target.closest('.nav-tab.dropdown') && !e.target.closest('.dropdown-content')) {
//     document.querySelectorAll('.dropdown-content').forEach(dc => dc.classList.remove('show'));
//   }
// });

// window.switchTab = switchTab;
// window.switchTab2 = switchTab2;
// window.toggleSubTabs = toggleSubTabs;

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

window