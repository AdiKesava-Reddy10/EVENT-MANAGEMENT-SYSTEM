# Smart Campus Event Management System - Innovation Module

This project is a full-stack Event Management System built using Spring Boot and ReactJS. It includes standard event management capabilities as well as an Innovation Module with advanced features.

## Innovation Module Features

1. **OTP Verification**: Email-based OTP verification during user registration.
2. **Chatbot Integration**: A frontend rule-based chatbot to assist users with FAQs.
3. **Google Maps Integration**: Event locations are displayed dynamically using Google Maps iframe.
4. **Third-party API Integration**: Real-time weather data displayed for event locations.
5. **Notification System**: Automatic email confirmation sent upon successful event registration.
6. **Advanced UI**: Glass-morphism design, interactive dashboard, and dynamic elements.
7. **Database**: MySQL integration for persistent data storage.
8. **Security**: JWT-based authentication for secure REST API endpoints.
9. **Admin Features**: Full CRUD operations on events and statistical dashboard.

---

## Project Structure

```
EventManagementSystem/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx           # Main entry point with OTP Auth Flow
│   │   ├── Dashboard.jsx     # Dashboard with Chatbot, Maps, Weather, Admin controls
│   │   ├── index.css         # Advanced UI styling
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── src/
│   ├── main/
│   │   ├── java/com/smartcampus/eventsystem/
│   │   │   ├── config/       # Spring configurations
│   │   │   ├── controller/   # REST Controllers (Auth, Events, Registrations)
│   │   │   ├── exception/    # Global Exception Handlers
│   │   │   ├── model/        # JPA Entities (User, Event, Registration)
│   │   │   ├── repository/   # Spring Data JPA Repositories
│   │   │   ├── security/     # JWT Authentication Filters and Utils
│   │   │   └── service/      # Business Logic (EmailService, OTPService, etc.)
│   │   └── resources/
│   │       └── application.properties  # Database and Mail configurations
└── pom.xml                   # Maven dependencies (MySQL, Spring Mail)
```

---

## Setup Instructions

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL Server
- Maven

### Step 1: Database Setup
1. Open your MySQL client and create a database:
   ```sql
   CREATE DATABASE event_management;
   ```
2. Update `src/main/resources/application.properties` with your MySQL credentials (username and password).

### Step 2: Email Configuration
To enable OTP and Notifications, update `application.properties` with your email credentials:
```properties
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
```
*(Note: If using Gmail, you must generate an "App Password" from your Google Account).*

### Step 3: Run Backend
1. Open a terminal in the root directory.
2. Run the Spring Boot application using Maven:
   ```bash
   mvn spring-boot:run
   ```
   The backend server will start on `http://localhost:8082`.

### Step 4: Run Frontend
1. Open another terminal in the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the application in your browser (usually `http://localhost:5173`).

---

## API Endpoints List

### Authentication Endpoints (`/api/auth`)
- `POST /api/auth/signup/request-otp` - Request OTP for a new user registration.
- `POST /api/auth/signup` - Validate OTP and complete user registration.
- `POST /api/auth/login` - Authenticate user and receive JWT.

### Event Endpoints (`/api/events`, `/api/admin/events`)
- `GET /api/events` - Fetch all available events (with optional search filters).
- `GET /api/events/{id}` - Fetch details of a specific event.
- `POST /api/admin/events` - Create a new event (Admin only).
- `PUT /api/admin/events/{id}` - Update an existing event (Admin only).
- `DELETE /api/admin/events/{id}` - Delete an event (Admin only).
- `GET /api/admin/statistics` - Get dashboard statistics (Admin only).

### Registration Endpoints (`/api/registrations`)
- `GET /api/registrations` - Fetch all events registered by the current user.
- `POST /api/registrations/register/{eventId}` - Register for a specific event (Student only). Triggers email.
- `DELETE /api/registrations/{id}` - Cancel an event registration.

---
**Enjoy managing your campus events smartly!**
