export function createCourseCard(course) {
  const card = document.createElement('div');
  card.className = 'course-card';

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
      <img class="star-icon" src="assets/${course.starred ? '../assets/icons/favourite.svg' : '../assets/icons/fav-off.svg'}" alt="Star">
    </div>

    <div class="course-actions">
      <img src="../assets/icons/preview.svg" alt="View" title="View">
      <img src="../assets/icons/manage course.svg" alt="Calendar" title="Calendar" class="big-icon">
      <img src="../assets/icons/grade submissions.svg" alt="Clone" title="Clone" class="big-icon">
      <img src="../assets/icons/reports.svg" alt="Report" title="Report">
    </div>
  `;

  return card;
}
