import { createCourseCard } from "../component/courseCard.js";
import { renderFooter } from "../component/footer.js";

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
    image: "/assets/images/imageMask-1.svg",
    starred: true,
    expired: false,
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
    image: "/assets/images/imageMask-2.svg",
    starred: true,
    expired: false,
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
    image: "/assets/images/imageMask.svg",
    starred: true,
    expired: false,
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
    image: "/assets/images/imageMask-3.svg",
    starred: false,
    expired: true,
  },
];

const container = document.getElementById("course-container");
courseData.forEach((course) => container.appendChild(createCourseCard(course)));

const container2 = document.getElementById("footer-container");
container2.appendChild(renderFooter());

function switchTab(clickedTab, type) {
  document
    .querySelectorAll(".nav-tab")
    .forEach((tab) => tab.classList.remove("active"));
  clickedTab.classList.add("active");
}

function switchTab2(clickedTab, type) {
  document
    .querySelectorAll(".tab")
    .forEach((tab) => tab.classList.remove("active"));
  clickedTab.classList.add("active");
}

window.switchTab = switchTab;
window.switchTab2 = switchTab2;