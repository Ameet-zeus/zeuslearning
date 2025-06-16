"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCourseCard = createCourseCard;
function createCourseCard(course) {
    var _a, _b, _c, _d;
    var card = document.createElement('div');
    card.className = 'course-card';
    var getIconHTML = function (icon, title, active) {
        if (active === void 0) { active = true; }
        var opacity = active ? '1' : '0.4';
        var isBigIcon = title === 'Calendar' || title === 'Clone';
        return "<img \n              src=\"../assets/icons/".concat(icon, ".svg\" \n              alt=\"").concat(title, "\" \n              title=\"").concat(title, "\" \n              style=\"opacity: ").concat(opacity, "\" \n              class=\"").concat(isBigIcon ? 'big-icon' : '', "\"\n            >");
    };
    var title = course.title, image = course.image, subject = course.subject, grade = course.grade, units = course.units, lessons = course.lessons, topics = course.topics, teacher = course.teacher, students = course.students, startDate = course.startDate, endDate = course.endDate, _e = course.icons, icons = _e === void 0 ? {} : _e, starred = course.starred;
    card.innerHTML = "\n    <div class=\"card-header\">\n      <img src=\"".concat(image, "\" alt=\"").concat(title, "\" class=\"side-img\">\n      <div class=\"card-top-content\">\n        <div class=\"course-title\">").concat(title, "</div>\n        <div class=\"course-meta\">").concat(subject, " | Grade ").concat(grade, "</div>\n        ").concat(units || lessons || topics ?
        "<div class=\"course-meta\">".concat(units || 0, " Units &nbsp; ").concat(lessons || 0, " Lessons &nbsp; ").concat(topics || 0, " Topics</div>")
        : '', "\n        <div class=\"course-meta\">\n          <select>\n            <option>").concat(teacher || 'No Classes', "</option>\n          </select>\n        </div>\n        <div class=\"course-meta\">").concat(students ? "".concat(students, " Students") : '', "</div>\n        <div class=\"course-meta\">").concat(startDate && endDate ? "".concat(startDate, " - ").concat(endDate) : '', "</div>\n      </div>\n      <img \n        class=\"star-icon\" \n        src=\"").concat(starred ? '../assets/icons/favourite.svg' : '../assets/icons/fav-off.svg', "\" \n        alt=\"Star\" \n        style=\"cursor: pointer;\"\n      >\n    </div>\n\n    <div class=\"course-actions\">\n      ").concat(getIconHTML('preview', 'View', (_a = icons.preview) !== null && _a !== void 0 ? _a : true), "\n      ").concat(getIconHTML('manage course', 'Calendar', (_b = icons.calendar) !== null && _b !== void 0 ? _b : true), "\n      ").concat(getIconHTML('grade submissions', 'Clone', (_c = icons.clone) !== null && _c !== void 0 ? _c : true), "\n      ").concat(getIconHTML('reports', 'Report', (_d = icons.report) !== null && _d !== void 0 ? _d : true), "\n    </div>\n  ");
    var starIcon = card.querySelector('.star-icon');
    starIcon.addEventListener('click', function () {
        course.starred = !course.starred;
        starIcon.src = course.starred
            ? '../assets/icons/favourite.svg'
            : '../assets/icons/fav-off.svg';
    });
    return card;
}
