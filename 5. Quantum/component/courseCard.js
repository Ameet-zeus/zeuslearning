export function createCourseCard(course) {
  const card = document.createElement('div');
  card.className = 'course-card';

  const getIconHTML = (icon, title, active = true) => {
    const opacity = active ? '1' : '0.4';
    return `<img src="../assets/icons/${icon}.svg" alt="${title}" title="${title}" style="opacity: ${opacity}" class="${title === 'Calendar' || title === 'Clone' ? 'big-icon' : ''}">`;
  };

  card.innerHTML = `
    <div class="card-header">
      <img src="${course.image}" alt="${course.title}" class="side-img">
      <div class="card-top-content">
        <div class="course-title">${course.title}</div>
        <div class="course-meta">${course.subject} | Grade ${course.grade}</div>
        <div class="course-meta">${course.units || 0} Units &nbsp; ${course.lessons || 0} Lessons &nbsp; ${course.topics || 0} Topics</div>
        <div class="course-meta">
          ${course.teacher ? `<select><option>${course.teacher}</option></select>` : '<select><option>No Classes</option></select>'}
        </div>
        <div class="course-meta">${course.students ? course.students + ' Students' : ''}</div>
        <div class="course-meta">${course.startDate && course.endDate ? course.startDate + ' - ' + course.endDate : ''}</div>
      </div>
      <img class="star-icon" src="assets/${course.starred ? '../assets/icons/favourite.svg' : '../assets/icons/fav-off.svg'}" alt="Star" style="cursor: pointer;">
    </div>

    <div class="course-actions">
      ${getIconHTML('preview', 'View', course.icons?.preview)}
      ${getIconHTML('manage course', 'Calendar', course.icons?.calendar)}
      ${getIconHTML('grade submissions', 'Clone', course.icons?.clone)}
      ${getIconHTML('reports', 'Report', course.icons?.report)}
    </div>
  `;

  // Toggle favorite star on click
  const starIcon = card.querySelector('.star-icon');
  starIcon.addEventListener('click', () => {
    course.starred = !course.starred; // toggle state
    starIcon.src = `assets/${course.starred ? '../assets/icons/favourite.svg' : '../assets/icons/fav-off.svg'}`;
  });

  return card;
}
