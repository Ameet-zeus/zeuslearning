document.addEventListener("DOMContentLoaded", () => {
  const dataAnnounce = [
    {
      annName: "Wilson Kumar",
      title: "No classes will be held on 21st Nov",
      date: "15-Sep-2018 at 07:21 pm",
      files: 2,
      read: false,
    },
    {
      annName: "Samson White",
      title: "Guest lecture on Geometry on 20th September",
      date: "15-Sep-2018 at 07:21 pm",
      files: 2,
      read: false,
    },
    {
      annName: "Wilson Kumar",
      title: "Additional course materials available on request",
      courseClass: "Course: Mathematics 101",
      date: "15-Sep-2018 at 07:21 pm",
      read: true,
    },
    {
      annName: "Wilson Kumar",
      title: "No classes will be held on 25th Dec",
      date: "15-Sep-2018 at 07:21 pm",
      files: 1,
      read: true,
    },
    {
      annName: "Wilson Kumar",
      title: "Additional course materials available on request",
      courseClass: "Course: Mathematics 101",
      date: "15-Sep-2018 at 07:21 pm",
      read: true,
    },
  ];

  const announceContainer = document.getElementById("announcements-data");

  function renderAnnouncements() {
    announceContainer.innerHTML = dataAnnounce
      .map((item, index) => `
        <div class="${item.read ? '' : 'card-bg1'}" data-index="${index}">
          <img src="../assets/icons/${item.read ? 'tick' : 'untick'}.svg" 
               alt="${item.read ? 'checkmark' : 'dnd'}" 
               class="toggle-read">
          <div class="ann-content">
            <p class="ann-name">PA: ${item.annName}</p>
            <p class="ann-title">${item.title}</p>
            ${item.courseClass ? `<p class="ann-course-class">${item.courseClass}</p>` : ''}
            <p class="files-date">
              <span class="files">
                ${item.files ? `<img src="assets/paperclip.svg" alt="paperclip"> <span>${item.files} files are attached</span>` : ''}
              </span>
              <span class="date">${item.date}</span>
            </p>
          </div>
        </div>
      `)
      .join('');

    document.querySelectorAll(".toggle-read").forEach(icon => {
      icon.addEventListener("click", (e) => {
        const parent = e.target.closest("div[data-index]");
        const index = parent.getAttribute("data-index");
        dataAnnounce[index].read = !dataAnnounce[index].read;
        renderAnnouncements();
      });
    });
  }

  if (announceContainer) {
    renderAnnouncements();
  }
});
