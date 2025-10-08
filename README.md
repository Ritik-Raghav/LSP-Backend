# LocalFinder Backend

[![Node.js](https://img.shields.io/badge/Node.js-18-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-4-lightgrey?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6-green?logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

The **LocalFinder Backend** provides RESTful APIs for the LocalFinder application, handling user authentication, provider data management, ratings, and reviews. Built with **Node.js**, **Express.js**, and **MongoDB**.

---

## 🌟 Features

* **User Authentication**: Sign up, log in, and manage accounts securely.
* **Provider Management**: CRUD operations for service providers.
* **Ratings & Reviews**: Users can rate and review providers.
* **Search & Filters**: Fetch providers by name, category, or location.
* **Image Uploads**: Store provider profile images and service images.
* **Secure Routes**: JWT authentication and middleware for protected routes.

---

## 🛠️ Tech Stack

* **Backend**: Node.js, Express.js
* **Database**: MongoDB with Mongoose ODM
* **Authentication**: JWT, bcrypt
* **File Uploads**: Multer
* **Logging**: Morgan (for request logging)
* **Environment Variables**: `.env` for config and secrets

---

## 📂 Project Structure

```
LSP-Backend/
├─ controllers/        # API controllers
├─ models/             # Mongoose models (User, Provider, Review)
├─ routes/             # Express routes
├─ middleware/         # Auth and error-handling middleware
├─ utils/              # Helper functions
├─ uploads/            # Uploaded images
├─ config/             # Database and other configurations
├─ server.js           # Entry point of the app
├─ package.json
└─ .env.example
```

---

## ⚡ Getting Started (Run Locally)

### 1. Clone the repository

```bash
git clone https://github.com/Ritik-Raghav/LSP-Backend.git
cd LSP-Backend
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Create a `.env` file in the root folder based on `.env.example`:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/localfinder
JWT_SECRET=your_jwt_secret
```

> Adjust MongoDB URI, JWT secret, and other variables as needed.

### 4. Run the server

```bash
npm run dev
# or
yarn dev
```

The server will run on `http://localhost:3000` by default.

### 5. Test API Endpoints

Use **Postman** or **Insomnia** to test API endpoints. Example endpoints:

* `POST /api/auth/register` - User registration
* `POST /api/auth/login` - User login
* `GET /api/providers` - Fetch all providers
* `POST /api/providers` - Create a new provider (authenticated)
* `POST /api/providers/:id/rate` - Rate a provider (authenticated)

---

## 📌 Notes

* Make sure **MongoDB** is running locally or provide a remote database URI.
* Image uploads are stored in the `uploads/` folder. Ensure proper permissions.
* Protected routes require a valid JWT token.

---

## 🚀 Future Improvements

* Implement role-based access (admin, provider, user)
* Add advanced search and geolocation queries
* Improve image storage (e.g., AWS S3)
* Add email notifications and verification

---

## ✉️ Author

**Ritik Raghav**

* GitHub: [https://github.com/Ritik-Raghav](https://github.com/Ritik-Raghav)
* Email: [ritikrghv313@gmail.com](mailto:ritikrghv313@gmail.com)
