import { Router, Request, Response } from "express";
import webpush from 'web-push';
import { Subscription } from "../models/Subscription";


const pushRouter = Router();

const publicKey = process.env.VAPID_PUBLIC_KEY || '';
const privateKey = process.env.VAPID_PRIVATE_KEY || '';
const email = process.env.VAPID_EMAIL || 'mailto:test@example.com';

if(publicKey && privateKey){
    webpush.setVapidDetails(email, publicKey, privateKey);
}else{
    console.warn('VAPID ключі не знайдені в змінних оточення!')
}

pushRouter.get('/public-key', (req: Request, res:Response) => {
    res.json({publicKey});
});

pushRouter.post('/subscribe', async (req:Request, res:Response)=>{
    
    try{
        const subscriptionData = req.body;

        if(!subscriptionData.endpoint || !subscriptionData.keys){
            return res.status(400).json({error:'Некоректні дані підписки'});
        }

        const sub = await Subscription.findOneAndUpdate(
            {endpoint:subscriptionData.endpoint},
            subscriptionData,
            {upsert:true,new:true}
        );

        return res.status(201).json({success: true, data: sub});

    }catch(error){
        console.error("Помилка збереження підписки:", error);
        return res.status(500).json({error:'Внутрішня помилка сервера'})
    }
})

pushRouter.post('/send-test', async(req:Request, res:Response)=>{
    
    try{
    
    const { title, message } = req.body;
    const payload = JSON.stringify({
      title: title || 'Тестовий пуш!',
      body: message || 'Привіт з твого нового Express бекенду!',
      icon: '/assets/icon.png' // шлях до іконки на фронтенді
    });

    const subscriptions = await Subscription.find();
    
    if (subscriptions.length === 0) {
      return res.status(404).json({ message: 'Немає активних підписок' });
    }

    // Відправляємо пуш кожному підписнику паралельно
    const sendPromises = subscriptions.map(sub => {
      // Перетворюємо збережений у базі документ у формат, який розуміє web-push
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth
        }
      };

      return webpush.sendNotification(pushConfig, payload)
        .catch(async (err) => {
          // Якщо пуш-сервер каже, що підписка застаріла або недійсна (код 410 або 404),
          // ми видаляємо її з нашої бази даних, щоб не спамити вхолосту.
          if (err.statusCode === 410 || err.statusCode === 404) {
            await Subscription.deleteOne({ _id: sub._id });
          }
        });
    });

    await Promise.all(sendPromises);

    return res.json({ success: true, sentCount: subscriptions.length });

    }catch(error){
        console.error('Помилка відправки пушу:', error);
        return res.status(500).json({ error: 'Помилка при відправці' });
    }
})

export default pushRouter;