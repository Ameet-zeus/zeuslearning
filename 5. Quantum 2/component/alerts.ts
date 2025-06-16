interface AlertItem {
  title: string;
  course?: string;
  date: string;
  read: boolean;
}

let alertData: AlertItem[] = [];

export function loadAlerts(alertContainer: HTMLElement | null): void {
  if (!alertContainer) return;

  fetch('json/alerts.json')
    .then(response => response.json())
    .then((data: AlertItem[]) => {
      alertData = data;
      renderAlerts(alertContainer);
      updateAlertBubble();
    })
    .catch(err => console.error('Error fetching alerts:', err));
}

function renderAlerts(alertContainer: HTMLElement): void {
  if (!alertContainer) return;

  alertContainer.innerHTML = alertData
    .map((item, index) => `
      <div class="alert-card ${item.read ? '' : 'card-bg1'}" data-index="${index}">
        <div class="header-row">
          <p class="alert-title">${item.title}</p>
          <img src="../assets/icons/${item.read ? 'tick' : 'untick'}.svg"
               alt="${item.read ? 'checkmark' : 'unread'}"
               class="toggle-alert-read">
        </div>
        ${item.course ? `<p class="alert-course">${item.course}</p>` : ''}
        <p class="alert-date">${item.date}</p>
      </div>
    `)
    .join('');

  alertContainer.querySelectorAll<HTMLImageElement>(".toggle-alert-read").forEach(icon => {
    icon.addEventListener("click", (e: Event) => {
      const target = e.target as HTMLElement;
      const card = target.closest("[data-index]") as HTMLElement | null;
      const index = card ? parseInt(card.dataset.index || '', 10) : NaN;
      if (!isNaN(index)) {
        alertData[index].read = !alertData[index].read;
        renderAlerts(alertContainer);
        updateAlertBubble();
      }
    });
  });
}

function updateAlertBubble(): void {
  const alertBubble = document.getElementById("alerts-bubble");
  if (!alertBubble) return;

  const unreadCount = alertData.filter(item => !item.read).length;
  if (unreadCount > 0) {
    alertBubble.textContent = unreadCount.toString();
    alertBubble.style.display = 'block';
  } else {
    alertBubble.style.display = 'none';
  }
}
