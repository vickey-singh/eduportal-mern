
<div align="center">

<img src="https://img.shields.io/badge/EDUPORTAL-INSTITUTE%20MANAGEMENT-52796F?style=for-the-badge&labelColor=172421" />

# EduPortal

### Smart Institute Management. Simplified.

A comprehensive digital platform to manage institute operations, students, faculty, academics, fees, attendance and administration — all in one place.

<br/>

<a href="https://prernainstituteofexcellence.in">
  <img src="https://img.shields.io/badge/EXPLORE%20LIVE%20WEBSITE-52796F?style=for-the-badge&logo=googlechrome&logoColor=white" />
</a>
&nbsp;
<a href="https://github.com/vickey-singh/eduportal-mern">
  <img src="https://img.shields.io/badge/VIEW%20SOURCE%20CODE-24332F?style=for-the-badge&logo=github&logoColor=white" />
</a>

<br/><br/>

<img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=flat-square&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Node.js-Backend-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/Express.js-API-FFFFFF?style=flat-square&logo=express&logoColor=black" />
<img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb&logoColor=white" />
<img src="https://img.shields.io/badge/Vercel-Deployment-000000?style=flat-square&logo=vercel" />
<img src="https://img.shields.io/badge/Render-Backend%20Hosting-46E3B7?style=flat-square&logo=render&logoColor=black" />

<br/><br/>

**Built for real-world institute operations.**

</div>

---

## ✦ Project Overview

EduPortal is a full-stack **Institute Management System** designed to bring the essential academic and administrative operations of an educational institution into a single digital ecosystem.

Developed using the MERN stack, the platform combines a modern public-facing website with dedicated administrative, teacher and student portals.

From student admissions and fee management to biometric attendance, automated notifications and examination results, EduPortal helps streamline everyday institutional workflows.

<div align="center">

| <div align="center">01</div> | <div align="center">02</div> | <div align="center">03</div> |
|:---:|:---:|:---:|
| **Public Website** | **Admin Dashboard** | **Academic Portals** |
| Institute presence | Centralized control | Student & teacher access |

</div>

## ↗ Live Platform

| Platform | Deployment |
|:---|:---|
| **Official Institute Website** | [prernainstituteofexcellence.in](https://prernainstituteofexcellence.in) |
| Frontend Application | [eduportal-mern.vercel.app](https://eduportal-mern.vercel.app) |
| Backend API | [eduportal-backend-m5t1.onrender.com](https://eduportal-backend-m5t1.onrender.com) |

---

# ✦ Platform Features

## 01 — Public Website

A responsive digital presence for the institute, with dynamic content managed through the administration panel.

- Modern, responsive homepage.
- Institute information and faculty profiles.
- Achievements and photo gallery.
- Student testimonials.
- Dynamic notices and announcements.
- Pinned notices and marquee announcements.
- Important notice popup.
- Image-supported notices.
- Downloadable documents.
- Contact and enquiry forms.
- Online admission application.

## 02 — Administration Dashboard

A centralized workspace for managing institutional activities.

- Secure administrator authentication.
- Dashboard analytics and overview.
- Student and faculty management.
- Admission management.
- Fee and payment administration.
- Attendance monitoring.
- Examination and result management.
- Notice and announcement management.
- Gallery and achievement management.
- Testimonials and downloads.
- Feedback and enquiry management.
- Website settings.

## 03 — Student Management & Portal

A dedicated system for managing student information and academic records.

- Student registration and admission records.
- Student profile management.
- Course and batch information.
- Student login and portal.
- Fee details and payment history.
- Attendance records.
- Examination results.

## 04 — Teacher Management & Portal

A dedicated teacher-side environment for academic operations.

- Teacher registration and management.
- Teacher profiles.
- Teacher authentication.
- Dedicated teacher portal.
- Examination and marks-related workflows.
- Student result management.

## 05 — Advanced Fee Management

A structured fee management system supporting installment-based payments and student-wise financial records.

| Capability | Description |
|:---|:---|
| Fee Tracking | Student-wise fee records |
| Installments | Installment-based payment management |
| Fee Adjustment | Installment adjustment functionality |
| Fee Waiver | Waiver management |
| Payment Status | Paid, partial and pending |
| Due Calculation | Automatic remaining balance calculation |
| Payment History | Student-wise payment records |
| Receipts | Payment receipt generation |
| Reporting | Fee-related reports and summaries |

## 06 — Biometric Attendance

Integrated with **ZKTeco biometric devices** to simplify attendance processing.

- Biometric attendance synchronization.
- Student attendance tracking.
- Automatic absent marking.
- Daily attendance finalization.
- Attendance records and reporting.
- Scheduled attendance processing.

## 07 — Automated Communication

Integrated with **Brevo Email API** for automated institutional communication.

<details>
<summary><strong>Attendance Email Automation</strong></summary>

- Scheduled attendance finalization.
- Automatic identification of absent students.
- Absent-student email notifications.
- Duplicate notification prevention for the same student and attendance date.
- Email failures handled separately from attendance finalization.

</details>

<details>
<summary><strong>Fee Reminder Automation</strong></summary>

- Automated fee due reminder processing.
- Eligible student identification.
- Reminder-stage processing.
- Reminder logs.
- Duplicate processing prevention.
- Email delivery through Brevo.

</details>

<details>
<summary><strong>Admission Email Notifications</strong></summary>

- Admission-related email notifications.
- Reusable email service integration.

</details>

## 08 — Examination & Result Management

A result management workflow designed to support individual and combined academic performance.

- Individual examination results.
- Subject-wise marks management.
- Combined subject-wise results across examinations.
- Overall result calculation.
- Percentage-based performance calculation.

**Overall Percentage**

\[
\text{Percentage} =
\frac{\text{Total Obtained Marks}}{\text{Total Maximum Marks}}
\times 100
\]

---

# ✦ Automation & Scheduled Workflows

EduPortal uses scheduled background processing to reduce repetitive administrative work.

| Workflow | Function |
|:---|:---|
| Attendance Finalization | Daily scheduled processing |
| Auto Absent Marking | Identifies students marked absent |
| Absent Email | Sends attendance notifications |
| Fee Reminders | Processes eligible fee reminders |
| Duplicate Prevention | Prevents repeated notification processing |

**Scheduling Infrastructure:** cron-job.org  
**Configured Timezone:** Asia/Kolkata

---

# ✦ Technology & Infrastructure

<div align="center">

### Built with the MERN Stack

</div>

| Layer | Technologies |
|:---|:---|
| Frontend | React.js, Vite, JavaScript, HTML5, CSS3 |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| API Communication | REST API, Axios |
| Biometric Integration | ZKTeco |
| Email Service | Brevo Email API |
| Media Management | Cloudinary |
| Scheduled Jobs | cron-job.org |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

---


# ✦ System Architecture

<div align="center">

### EduPortal — Application Architecture

</div>

```text
                  ┌──────────────────────────┐
                  │      USER INTERFACES     │
                  └────────────┬─────────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
       ┌─────▼─────┐     ┌─────▼─────┐     ┌─────▼─────┐
       │   ADMIN   │     │  TEACHER  │     │  STUDENT  │
       │   PORTAL  │     │   PORTAL  │     │   PORTAL  │
       └─────┬─────┘     └─────┬─────┘     └─────┬─────┘
             │                 │                 │
             └─────────────────┼─────────────────┘
                               │
                      ┌────────▼────────┐
                      │  REACT + VITE   │
                      │    FRONTEND     │
                      └────────┬────────┘
                               │
                         REST API
                               │
                      ┌────────▼────────┐
                      │  NODE.JS +      │
                      │  EXPRESS.JS     │
                      │    BACKEND      │
                      └────────┬────────┘
                               │
                      ┌────────▼────────┐
                      │   MONGODB       │
                      │     ATLAS       │
                      └─────────────────┘

        ┌─────────────────────────────────────────┐
        │             EXTERNAL SERVICES            │
        ├─────────────────────────────────────────┤
        │  ZKTeco       → Biometric Attendance    │
        │  Brevo        → Email Notifications     │
        │  Cloudinary   → Media Management        │
        │  cron-job.org → Scheduled Automation   │
        └─────────────────────────────────────────┘
```



---

# ✦ Deployment Architecture

<div align="center">

| Service | Platform |
|:---|:---|
| Frontend | <img src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white" /> |
| Backend | <img src="https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=black" /> |
| Database | <img src="https://img.shields.io/badge/MongoDB%20Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white" /> |
| Email | Brevo |
| Scheduled Tasks | cron-job.org |

</div>

---

# ✦ Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Node.js and npm
- MongoDB Atlas account or MongoDB instance
- Git

### 1. Clone Repository

```bash
git clone https://github.com/vickey-singh/eduportal-mern.git

cd eduportal-mern
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Add other required environment variables according to the backend configuration.

Start the backend:

```bash
npm run dev
```

### 3. Setup Frontend

Open a separate terminal:

```bash
cd client
npm install
npm run dev
```

The application will run using the development configuration defined in the frontend and backend.

---

# ✦ Project Structure

```text
eduportal-mern/
│
├── client/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── utils/
│   ├── package.json
│   └── server.js
│
├── .gitignore
└── README.md
```

*Note: This is a high-level representation of the project structure.*

---

# ✦ Security & Data Protection

- Environment-based configuration for sensitive credentials.
- API-driven frontend and backend communication.
- Protected access for administrative and portal functionality.
- Sensitive API keys and database credentials should remain private.
- Real student records and institutional documents should not be exposed in the public repository.

---

# ✦ About the Developer

<div align="center">

## Vickey Kumar Singh

**Full Stack MERN Developer**

Building practical web applications with a focus on functionality, usability and scalable architecture.

<br/>

<a href="https://github.com/vickey-singh">
  <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" />
</a>
<a href="https://linkedin.com/in/vickey-kumar-singh">
  <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" />
</a>
<a href="https://vickey-singh.netlify.app">
  <img src="https://img.shields.io/badge/Portfolio-52796F?style=for-the-badge&logo=googlechrome&logoColor=white" />
</a>

<br/><br/>

<a href="mailto:vickeykumarsingh.edu@gmail.com">
  vickeykumarsingh.edu@gmail.com
</a>

</div>

---

<div align="center">

### EDU PORTAL

**One Platform. Complete Institute Management.**

Designed & Developed with the MERN Stack.

<br/>

<sub>© EduPortal. All rights reserved.</sub>

</div>

