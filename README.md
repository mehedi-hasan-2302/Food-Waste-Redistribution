# Food Waste Redistribution Platform

![Food Waste Redistribution Banner](https://placehold.co/1200x300/D9E3DF/1A3F36?text=Food+Waste+Redistribution+Platform)

<p align="center">
  <a href="https://github.com/mehedi-hasan-2302/food-waste-redistribution/actions">
    <img src="https://img.shields.io/github/workflow/status/mehedi-hasan-2302/food-waste-redistribution/CI?style=flat-square" alt="CI Status" />
  </a>
  <a href="https://github.com/mehedi-hasan-2302/food-waste-redistribution/issues">
    <img src="https://img.shields.io/github/issues/mehedi-hasan-2302/food-waste-redistribution?style=flat-square" alt="Issues" />
  </a>
  <a href="#license">
    <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License" />
  </a>
</p>

---

## 🚀 Overview

**Food Waste Redistribution** is a modern, full-stack web platform designed to connect food donors, charities, buyers, and volunteers to reduce food waste and promote social good. The platform enables restaurants, businesses, and individuals to list surplus food, which can then be claimed or purchased by charities and buyers, with delivery facilitated by independent or organizational volunteers.

---

## 🔗 Quick Links

- [Live Demo](#) <!-- Add your deployed link here -->
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [API Reference](#api-endpoints-reference)
- [Security](#-security--best-practices)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)
- [Contact](#-contact)

---

## 🌟 Features

- **User Roles:** Donor/Seller, Charity Organization, Buyer, Independent Volunteer, Organization Volunteer, Admin
- **Authentication & Authorization:** Secure signup, login, and role-based access
- **Profile Management:** Role-specific profile completion and editing
- **Food Listings:** Create, update, view, and delete food items (donation or sale)
- **Order & Claim System:** Seamless ordering and claiming process for food items
- **Delivery Coordination:** Assign and track deliveries via volunteers
- **Notifications:** Real-time notifications for orders, claims, deliveries, and admin actions
- **Admin Dashboard:** User management, verification requests, listing moderation, and analytics
- **Responsive UI:** Modern, mobile-friendly interface using React, Tailwind CSS, and Radix UI
- **Cloud Image Uploads:** Secure image handling via Cloudinary

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Zustand, React Router, Tailwind CSS, Radix UI, React Toastify
- **Backend:** Node.js, Express, TypeScript, TypeORM, PostgreSQL, Joi (validation)
- **Cloud & Storage:** Cloudinary (image uploads)
- **Other:** Axios, Lucide Icons, React Icons, Zod (frontend validation)

---

## 📦 Project Structure

```text
Food-Waste-Redistribution/
├── backend/         # Node.js/Express API, PostgreSQL, TypeORM
├── frontend/        # React app, Zustand state, Tailwind CSS
└── README.md        # You're here!
```

---

## 🚦 Getting Started

<sub>Clone the Repository</sub>
```bash
git clone https://github.com/mehedi-hasan-2302/food-waste-redistribution.git
```

<sub>Navigate to the Project Directory</sub>
```bash
cd food-waste-redistribution
```

<sub>Change to Backend Directory</sub>
```bash
cd backend
```
<sub>Copy Environment File</sub>
```bash
cp .env.example .env   # Fill in your DB and Cloudinary credentials
```
<sub>Install Dependencies</sub>
```bash
npm install
```
<sub>Build the Project</sub>
```bash
npm run build
```
<sub>Start the Server</sub>
```bash
npm run dev            # Starts the backend server with hot reload
```
- Configure your PostgreSQL connection and Cloudinary keys in `.env`.

<sub>Change to Frontend Directory</sub>
```bash
cd ../frontend
```
<sub>Copy Environment File</sub>
```bash
cp .env.example .env   # (If needed for API URLs)
```
<sub>Install Dependencies</sub>
```bash
npm install
```
<sub>Start the Frontend</sub>
```bash
npm run dev            # Starts the frontend on http://localhost:5173
```

---

## 🧑‍💻 Usage

- **Sign Up:** Register as a donor, charity, buyer, or volunteer.
- **Complete Profile:** Fill in role-specific details for full access.
- **List Food:** Donors can add surplus food items for donation or sale.
- **Claim/Order:** Charities and buyers can claim or purchase food.
- **Delivery:** Volunteers coordinate and complete deliveries.
- **Admin:** Manage users, verify organizations, and oversee platform activity.


---

## 📚 API Endpoints Reference

Welcome to the **Food Waste Redistribution API Reference**!  
Below are the most important endpoints, grouped by feature.  
You can test these endpoints using [Postman](https://www.postman.com/) or [curl](https://curl.se/).

---

### Authentication

#### Register a New User

```http
POST /api/auth/signup
```
**Body:**
```json
{
  "Username": "Jane Doe",
  "Email": "jane@example.com",
  "PhoneNumber": "01712345678",
  "Password": "StrongPassword123!",
  "Role": "DONOR_SELLER"
}
```

#### Login

```http
POST /api/auth/login
```
**Body:**
```json
{
  "Email": "jane@example.com",
  "Password": "StrongPassword123!"
}
```

#### Verify Email

```http
POST /api/auth/verify-email
```
**Body:**
```json
{
  "Email": "jane@example.com",
  "Code": "123456"
}
```

---

### Profile Management

#### Get Profile

```http
GET /api/profile/get-profile
Authorization: Bearer <token>
```

#### Complete Profile

```http
POST /api/profile/complete
Authorization: Bearer <token>
Content-Type: application/json
```
**Body (Donor Example):**
```json
{
  "BusinessName": "Jane's Bakery"
}
```

---

### Food Listings

#### Create Listing

```http
POST /api/food-listings/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```
**Body:**  
- `title`, `description`, `foodType`, `quantity`, `price`, `image` (file), etc.

#### Get All Listings

```http
GET /api/food-listings/
Authorization: Bearer <token>
```

#### Get My Listings

```http
GET /api/food-listings/my/listings
Authorization: Bearer <token>
```

---

### Orders & Claims

#### Place Order

```http
POST /api/orders/create
Authorization: Bearer <token>
```
**Body:**
```json
{
  "ListingID": 123,
  "DeliveryType": "HOME_DELIVERY",
  "DeliveryAddress": "123 Main St"
}
```

#### Claim Donation

```http
POST /api/claims/create
Authorization: Bearer <token>
```
**Body:**
```json
{
  "ListingID": 456,
  "DeliveryType": "SELF_PICKUP"
}
```

---

### Notifications

#### Get Notifications

```http
GET /api/notifications/get-notifications
Authorization: Bearer <token>
```

#### Mark as Read

```http
PATCH /api/notifications/{notificationId}/read
Authorization: Bearer <token>
```

#### Mark All as Read

```http
PATCH /api/notifications/read-all
Authorization: Bearer <token>
```

---

### Admin

#### Dashboard Stats

```http
GET /api/admin/dashboard-stats
Authorization: Bearer <admin-token>
```

#### Manage Users, Listings, Verifications

- See `/backend/src/routes/adminRoutes.ts` for all endpoints.

---

## 🛡️ Security & Best Practices

- Passwords are hashed and never stored in plain text.
- JWT-based authentication and role-based access control.
- Input validation on both frontend (Zod) and backend (Joi).
- Secure file uploads and storage via Cloudinary.

---

## 🤝 Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements, bug fixes, or new features.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/awesome-feature`)
3. Commit your changes (`git commit -am 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome-feature`)
5. Open a pull request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgements

- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Cloudinary](https://cloudinary.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [TypeORM](https://typeorm.io/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Lucide Icons](https://lucide.dev/)

---

## 📬 Contact

For questions, support, or partnership inquiries, please contact:

- [Mehedi Hasan](mailto:mehedi.h2302@gmail.com)
- [Islam Tamjid](mailto:towhidulislam932@gmail.com)
- [Project Issues](https://github.com/mehedi-hasan-2302/food-waste-redistribution/issues)

---
