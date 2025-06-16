interface AnnouncementItem {
  annName: string;
  title: string;
  courseClass?: string;
  files?: number;
  date: string;
  read: boolean;
}

let dataAnnounce: AnnouncementItem[] = [];

export function loadAnnouncements(announceContainer: HTMLElement | null): void {
  if (!announceContainer) return;

  fetch('json/announcements.json')
    .then(response => response.json())
    .then((data: AnnouncementItem[]) => {
      dataAnnounce = data;
      renderAnnouncements(announceContainer);
      updateAnnouncementBubble();
    })
    .catch(err => console.error('Error fetching announcements:', err));
}

function renderAnnouncements(announceContainer: HTMLElement): void {
  if (!announceContainer) return;

  announceContainer.innerHTML = dataAnnounce
    .map((item, index) => `
      <div class="${item.read ? '' : 'card-bg1'}" data-index="${index}">
        <div class="header-row">
          <p class="ann-name">PA: ${item.annName}</p>
          <img src="../assets/icons/${item.read ? 'tick' : 'untick'}.svg"
               alt="${item.read ? 'checkmark' : 'unread'}"
               class="toggle-read">
        </div>
        <div class="ann-content">
          <p class="ann-title">${item.title}</p>
          ${item.courseClass ? `<p class="ann-course-class">${item.courseClass}</p>` : ''}
          <p class="files-date">
            <span class="files">
              ${item.files ? `<img src="../assets/icons/attachment.svg" alt="attachment"> <span>${item.files} files are attached</span>` : ''}
            </span>
            <span class="date">${item.date}</span>
          </p>
        </div>
      </div>
    `)
    .join('');

  announceContainer.querySelectorAll<HTMLImageElement>(".toggle-read").forEach(icon => {
    icon.addEventListener("click", (e: Event) => {
      const target = e.target as HTMLElement;
      const parent = target.closest("[data-index]") as HTMLElement | null;
      const index = parent ? parseInt(parent.dataset.index || '', 10) : NaN;
      if (!isNaN(index)) {
        dataAnnounce[index].read = !dataAnnounce[index].read;
        renderAnnouncements(announceContainer);
        updateAnnouncementBubble();
      }
    });
  });
}

function updateAnnouncementBubble(): void {
  const announcementBubble = document.getElementById("announcements-bubble");
  if (!announcementBubble) return;

  const unreadCount = dataAnnounce.filter(item => !item.read).length;
  if (unreadCount > 0) {
    announcementBubble.textContent = unreadCount.toString();
    announcementBubble.style.display = 'block';
  } else {
    announcementBubble.style.display = 'none';
  }
}
