# Oasis Lite (Backend & Infrastructure Sandbox)

Цей проєкт створено як практичний майданчик для вивчення Docker, контейнеризації 
та реалізації асинхронних Web Push сповіщень.

## 🛠 Технологічний стек
* **Backend:** Node.js, Express, TypeScript
* **Database & Cache:** MongoDB (Mongoose), Redis (ioredis)
* **Ops:** Docker, Docker Compose
* **Push:** Web Push API (Service Workers)

## 🧠 Процес розробки та використання ШІ
Проєкт розроблявся із залученням штучного інтелекту як "інтерактивного Senior-колеги". 
Це дозволило:
* Швидко спроектувати Docker-інфраструктуру з нуля.
* Налагодити зв'язок між сервісами (Express, Redis, MongoDB) в єдиній мережі Docker.
* Розібратися з життєвим циклом Service Worker для реалізації Push-сповіщень на системному рівні.

Такий підхід допоміг не просто скопіювати конфіги, а детально розібрати кожен крок: 
від монтування `volumes` до вирішення конфліктів з CORS та кешуванням у Redis.
