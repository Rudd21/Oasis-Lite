import webpush from 'web-push';
import { Task } from '../models/Task';
import { Subscription } from '../models/Subscription';

// Функція для перевірки дедлайнів
export async function checkDeadlines() {
try {
    const now = new Date();
    const triggerWindow = new Date(now.getTime() + 24 * 60 * 60 * 1000); 

    console.log(`[Scheduler] Перевірка... Поточний час сервера: ${now.toISOString()}`);
    console.log(`[Scheduler] Шукаємо дедлайни між тепер і: ${triggerWindow.toISOString()}`);

    // Шукаємо таски
    const urgentTasks = await Task.find({
      status: 'pending',
      notified: false,
      deadline: { $gte: now, $lte: triggerWindow } 
    });

    console.log(`[Scheduler] Знайдено тасок у базі для обробки: ${urgentTasks.length}`);

    if (urgentTasks.length === 0) return;

    const subscriptions = await Subscription.find();
    console.log(`[Scheduler] Кількість активних підписок у базі: ${subscriptions.length}`);

    if (subscriptions.length === 0) {
      console.log('⚠️ Немає активних підписок у базі.');
      return;
    }

    for (const task of urgentTasks) {
      console.log(`[Scheduler] Надсилаємо пуш для таски: "${task.title}" (Дедлайн: ${task.deadline.toISOString()})`);

      const payload = JSON.stringify({
        title: '🚨 Наближається дедлайн!',
        body: `Завдання "${task.title}" потребує уваги!`,
        icon: '/assets/icon.png'
      });

      const sendPromises = subscriptions.map(sub => {
        const pushConfig = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth
          }
        };

        return webpush.sendNotification(pushConfig, payload)
          .then(() => console.log(`[Scheduler] Пуш успішно відправлено на endpoint: ${sub.endpoint.substring(0, 30)}...`))
          .catch(async (err) => {
            console.error('[Scheduler] Помилка відправки пушу:', err.statusCode);
            if (err.statusCode === 410 || err.statusCode === 404) {
              await Subscription.deleteOne({ _id: sub._id });
              console.log('[Scheduler] Видалено застарілу підписку.');
            }
          });
      });

      await Promise.all(sendPromises);

      task.notified = true;
      await task.save();
      console.log(`✅ Таску "${task.title}" позначено як сповіщену.`);
    }

  } catch (error) {
    console.error('Помилка в планувальнику дедлайнів:', error);
  }
}

// Запуск інтервалу перевірки кожні 30 секунд
export function startScheduler() {
  console.log('⏳ Планувальник дедлайнів запущено (інтервал: 30с)...');
  setInterval(checkDeadlines, 30 * 1000);
}