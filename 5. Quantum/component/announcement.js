let dataAnnounce = [];

export function loadAnnouncements(announceContainer) {
  fetch('json/announcements.json')
    .then(response => response.json())
    .then(data => {
      dataAnnounce = data;
      renderAnnouncements(announceContainer);
      updateAnnouncementBubble(); // Update the bubble after rendering
    })
    .catch(err => console.error('Error fetching announcements:', err));
}

function renderAnnouncements(announceContainer) {
  announceContainer.innerHTML = dataAnnounce
    .map((item, index) => `
      <div class="${item.read ? '' : 'card-bg1'}" data-index="${index}">
        <div class="header-row">
          <p class="ann-name">PA: ${item.annName}</p>
          <img src="../assets/icons/${item.read ? 'tick' : 'untick'}.svg"
               alt="${item.read ? 'checkmark' : 'dnd'}"
               class="toggle-read">
        </div>
        <div class="ann-content">
          <p class="ann-title">${item.title}</p>
          ${item.courseClass ? `<p class="ann-course-class">${item.courseClass}</p>` : ''}
          <p class="files-date">
            <span class="files">
              ${item.files ? `<img src="../assets/icons/attachment.svg" alt="paperclip"> <span>${item.files} files are attached</span>` : ''}
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
      renderAnnouncements(announceContainer);
      updateAnnouncementBubble(); // Update the bubble count after clicking
    });
  });
}

function updateAnnouncementBubble() {
  const announcementBubble = document.getElementById("announcements-bubble");
  const unreadAnnouncements = dataAnnounce.filter(item => item.read).length;
  if (unreadAnnouncements > 0) {
    announcementBubble.textContent = unreadAnnouncements;
  } else {
    announcementBubble.style.display = 'none'; // Hide the bubble if no unread announcements
  }
}
