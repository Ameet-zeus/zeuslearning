let alertData = [];

export function loadAlerts(alertContainer) {
  fetch('json/alerts.json')
    .then(response => response.json())
    .then(data => {
      alertData = data;
      renderAlerts(alertContainer);
      updateAlertBubble(); // Update the bubble after rendering
    })
    .catch(err => console.error('Error fetching alerts:', err));
}

function renderAlerts(alertContainer) {
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

  document.querySelectorAll(".toggle-alert-read").forEach(icon => {
    icon.addEventListener("click", (e) => {
      const parent = e.target.closest("div[data-index]");
      const index = parent.getAttribute("data-index");
      alertData[index].read = !alertData[index].read;
      renderAlerts(alertContainer); 
      updateAlertBubble(); // Update the bubble count after clicking
    });
  });
}

function updateAlertBubble() {
  const alertBubble = document.getElementById("alerts-bubble");
  const unreadAlerts = alertData.filter(item => item.read).length;
  if (unreadAlerts > 0) {
    alertBubble.textContent = unreadAlerts;
  } else {
    alertBubble.style.display = 'none'; // Hide the bubble if no unread alerts
  }
}
