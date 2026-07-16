// Слухаємо подію прильоту пуш-повідомлення від сервера
self.addEventListener('push', function(event) {
  let data = { title: 'Нове сповіщення', body: 'У вас є невідкладне завдання!' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      // Якщо прийшов простий текст, а не JSON
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/assets/icon.png', // Іконка додатка
    badge: data.badge || '/assets/badge.png', // Маленька іконка для статус-бару
    vibrate: [100, 50, 100], // Вібрація для телефонів
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      { action: 'explore', title: 'Перейти до завдань' },
      { action: 'close', title: 'Закрити' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Слухаємо клік по сповіщенню
self.addEventListener('notificationclick', function(event) {
  event.notification.close(); // Закриваємо пуш

  if (event.action !== 'close') {
    // Якщо клікнули "Перейти" — відкриваємо наш додаток
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});