export function createCourseCard(course) {
    var _a, _b, _c, _d;
    const card = document.createElement('div');
    card.className = 'course-card';
    const getIconHTML = (icon, title, active = true) => {
        const opacity = active ? '1' : '0.4';
        const isBigIcon = title === 'Calendar' || title === 'Clone';
        return `<img 
              src="../assets/icons/${icon}.svg" 
              alt="${title}" 
              title="${title}" 
              style="opacity: ${opacity}" 
              class="${isBigIcon ? 'big-icon' : ''}"
            >`;
    };
    const { title, image, subject, grade, units, lessons, topics, teacher, students, startDate, endDate, icons = {}, starred } = course;
    card.innerHTML = `
    <div class="card-header">
      <img src="${image}" alt="${title}" class="side-img">
      <div class="card-top-content">
        <div class="course-title">${title}</div>
        <div class="course-meta">${subject} | Grade ${grade}</div>
        ${units || lessons || topics ?
        `<div class="course-meta">${units || 0} Units &nbsp; ${lessons || 0} Lessons &nbsp; ${topics || 0} Topics</div>`
        : ''}
        <div class="course-meta">
          <select>
            <option>${teacher || 'No Classes'}</option>
          </select>
        </div>
        <div class="course-meta">${students ? `${students} Students` : ''}</div>
        <div class="course-meta">${startDate && endDate ? `${startDate} - ${endDate}` : ''}</div>
      </div>
      <img 
        class="star-icon" 
        src="${starred ? '../assets/icons/favourite.svg' : '../assets/icons/fav-off.svg'}" 
        alt="Star" 
        style="cursor: pointer;"
      >
    </div>

    <div class="course-actions">
      ${getIconHTML('preview', 'View', (_a = icons.preview) !== null && _a !== void 0 ? _a : true)}
      ${getIconHTML('manage course', 'Calendar', (_b = icons.calendar) !== null && _b !== void 0 ? _b : true)}
      ${getIconHTML('grade submissions', 'Clone', (_c = icons.clone) !== null && _c !== void 0 ? _c : true)}
      ${getIconHTML('reports', 'Report', (_d = icons.report) !== null && _d !== void 0 ? _d : true)}
    </div>
  `;
    const starIcon = card.querySelector('.star-icon');
    starIcon.addEventListener('click', () => {
        course.starred = !course.starred;
        starIcon.src = course.starred
            ? '../assets/icons/favourite.svg'
            : '../assets/icons/fav-off.svg';
    });
    return card;
}
