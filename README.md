# SimInvest

**SimInvest** is a full-stack investment simulation platform that allows users to manage virtual funds, create accounts, invest in assets with simulated returns, and track their transactions and profits over time.

---

## Key Features

- Create and manage virtual accounts
- Simulate investments with compound interest and duration
- Configure PAC (monthly contribution plans)
- Daily background job to apply monthly contributions
- Secure user authentication using JWT
- Dashboard with charts and real-time summaries
- View transaction history and investment details
- Fully responsive UI built with TailwindCSS

---

## Tech Stack

### Frontend
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Chart.js](https://www.chartjs.org/)

### Backend
- [Spring Boot](https://spring.io/projects/spring-boot)
- [Spring Security](https://spring.io/projects/spring-security)
- [JWT (JSON Web Token)](https://jwt.io/)
- [PostgreSQL](https://www.postgresql.org/)

---

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL 14+

### 1. Backend Setup

```bash
git clone https:/github.com/imbngy/simInvest.git
```

### Database

Use DBeaver to restore the database from the dump in the folder `simInvest/backend/DB_DUMP/`

Then configure the PostgreSQL database settings in the application.properties file;

Run the Spring Boot application;

### 2. Frontend

Navigate to the frontend directory;

Install dependencies:

```bash
cd frontend
npm install
```
Start the application by running

```bash
npm run dev
```

Open the application in your browser at http://localhost:5173.
