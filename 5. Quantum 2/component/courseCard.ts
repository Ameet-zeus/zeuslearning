interface CourseIcons {
  preview?: boolean;
  calendar?: boolean;
  clone?: boolean;
  report?: boolean;
}

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
  icons?: CourseIcons;
  starred: boolean;
}

export function createCourseCard(course: Course): HTMLDivElement {
  const card = document.createElement('div');
  card.className = 'course-card';

  const getIconHTML = (icon: string, title: string, active: boolean = true): string => {
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

  const {
    title,
    image,
    subject,
    grade,
    units,
    lessons,
    topics,
    teacher,
    students,
    startDate,
    endDate,
    icons = {},
    starred
  } = course;

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
      ${getIconHTML('preview', 'View', icons.preview ?? true)}
      ${getIconHTML('manage course', 'Calendar', icons.calendar ?? true)}
      ${getIconHTML('grade submissions', 'Clone', icons.clone ?? true)}
      ${getIconHTML('reports', 'Report', icons.report ?? true)}
    </div>
  `;

  const starIcon = card.querySelector('.star-icon') as HTMLImageElement;
  starIcon.addEventListener('click', () => {
    course.starred = !course.starred;
    starIcon.src = course.starred
      ? '../assets/icons/favourite.svg'
      : '../assets/icons/fav-off.svg';
  });

  return card;
}
