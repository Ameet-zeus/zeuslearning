document.addEventListener("DOMContentLoaded", () => {
  // Alerts Data
  const data = [
    {
      title: "License for Introduction to Algebra has been assigned to your school",
      courseClass: "Course: Advanced Mathematics",
      date: "15-Sep-2018 at 07:21 pm",
      read: true,
    },
    {
      title: "License for Introduction to Algebra has been assigned to your school",
      courseClass: "Course: Advanced Mathematics",
      date: "15-Sep-2018 at 07:21 pm",
      read: false,
    },
    {
      title: "License for Introduction to Algebra has been assigned to your school",
      courseClass: "Course: Advanced Mathematics",
      date: "15-Sep-2018 at 07:21 pm",
      read: true,
    },
    {
      title: "License for Introduction to Algebra has been assigned to your school",
      courseClass: "Course: Advanced Mathematics",
      date: "15-Sep-2018 at 07:21 pm",
      read: true,
    },
    {
      title: "License for Introduction to Algebra has been assigned to your school",
      courseClass: "Course: Advanced Mathematics",
      date: "15-Sep-2018 at 07:21 pm",
      read: true,
    },
    {
      title: "License for Introduction to Algebra has been assigned to your school",
      courseClass: "Course: Advanced Mathematics",
      date: "15-Sep-2018 at 07:21 pm",
      read: true,
    },
    {
      title: "License for Introduction to Algebra has been assigned to your school",
      courseClass: "Course: Advanced Mathematics",
      date: "15-Sep-2018 at 07:21 pm",
      read: false,
    },
    {
      title: "License for Introduction to Algebra has been assigned to your school",
      courseClass: "Course: Advanced Mathematics",
      date: "15-Sep-2018 at 07:21 pm",
      read: false,
    },
  ];

  const alertHTML = data
    .map(item => `
      <div ${item.read ? '' : 'class="card-bg1"'}>
        ${item.read
          ? `<img src="../assets/icons/tick.svg" alt="checkmark" class="checkmark-icon">`
          : `<img src="../assets/icons/untick.svg" alt="dnd" class="dnd-icon">`}
        <p class="title">${item.title}</p>
        <p class="course-class">${item.courseClass}</p>
        <p class="date">${item.date}</p>
      </div>
    `)
    .join('');

  const alertsContainer = document.getElementById("alert-dropdown");
  if (alertsContainer) {
    alertsContainer.innerHTML = alertHTML;
  }

  // Announcements Data
  const dataAnnounce = [
    {
      annName: "John Doe",
      title: "New Assignment Posted",
      courseClass: "Course: Advanced Mathematics",
      date: "15-Sep-2018 at 07:21 pm",
      files: 2,
      read: true,
    },
    {
      annName: "Jane Smith",
      title: "Exam Schedule Released",
      courseClass: "Course: Advanced Mathematics",
      date: "16-Sep-2018 at 08:30 am",
      files: 1,
      read: false,
    },
    {
      annName: "Alice Johnson",
      title: "Project Guidelines Updated",
      courseClass: "Course: Advanced Mathematics",
      date: "17-Sep-2018 at 09:45 am",
      files: 3,
      read: true,
    },
    {
      annName: "Alice Johnson",
      title: "Project Guidelines Updated",
      courseClass: "Course: Advanced Mathematics",
      date: "17-Sep-2018 at 09:45 am",
      files: 3,
      read: true,
    },
    {
      annName: "Alice Johnson",
      title: "Project Guidelines Updated",
      courseClass: "Course: Advanced Mathematics",
      date: "17-Sep-2018 at 09:45 am",
      files: 3,
      read: true,
    },
    {
      annName: "Alice Johnson",
      title: "Project Guidelines Updated",
      courseClass: "Course: Advanced Mathematics",
      date: "17-Sep-2018 at 09:45 am",
      files: null,
      read: true,
    },
    {
      annName: "Alice Johnson",
      title: "Project Guidelines Updated",
      courseClass: "Course: Advanced Mathematics",
      date: "17-Sep-2018 at 09:45 am",
      files: 3,
      read: true,
    },
  ];

  const announceHTML = dataAnnounce
    .map(item => `
      <div class="${item.read ? '' : 'card-bg1'}">
        ${item.read
          ? `<img src="../assets/icons/tick.svg" alt="checkmark" class="checkmark-icon">`
          : `<img src="../assets/icons/untick.svg" alt="dnd" class="dnd-icon">`}
        <p class="ann-name"><span>PA:</span>${item.annName}</p>
        <p class="ann-title">${item.title}</p>
        <p class="ann-course-class"><span>${item.courseClass || ''}</span></p>
        <p class="files-date">
          <span class="files">
            ${item.files ? `<img src="assets/paperclip.svg" alt="paperclip"> <span>${item.files} files are attached</span>` : ''}
          </span>
          <span class="date">${item.date}</span>
        </p>
      </div>
    `)
    .join('');

  const announceContainer = document.getElementById("announcement-dropdown");
  if (announceContainer) {
    announceContainer.innerHTML = announceHTML;
  }
});
