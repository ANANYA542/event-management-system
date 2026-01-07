
let notificationContainer = null;

const createNotificationContainer = () => {
  if (!notificationContainer) {
    notificationContainer = document.createElement("div");
    notificationContainer.className = "notification-container";
    document.body.appendChild(notificationContainer);
  }
  return notificationContainer;
};

const showNotification = (message, type = "info") => {
  const container = createNotificationContainer();
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  container.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
};

export const message = {
  success: (msg) => showNotification(msg, "success"),
  error: (msg) => showNotification(msg, "error"),
  warning: (msg) => showNotification(msg, "warning"),
  info: (msg) => showNotification(msg, "info"),
};

