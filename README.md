# AfyaCapital Frontend Module

> **ReactJS frontend for AfyaCapital — a healthcare claims financing solution built for the openIMIS Hackathon 2026.**

![React](https://img.shields.io/badge/React-18-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)
![GraphQL](https://img.shields.io/badge/GraphQL-enabled-e10098)
![FHIR](https://img.shields.io/badge/FHIR-R4-orange)
![openIMIS](https://img.shields.io/badge/openIMIS-v25.10-blue)
![Hackathon](https://img.shields.io/badge/openIMIS-Hackathon%202026-success)

---

# Project Overview

AfyaCapital is a healthcare claims financing solution developed as an extension to **openIMIS**.

Healthcare facilities often wait weeks or even months after their claims have been approved before receiving reimbursement from the Social Health Authority (SHA). During this waiting period, hospitals still need to pay staff, purchase medicines, maintain equipment, and continue delivering patient care.

AfyaCapital bridges this financing gap by enabling healthcare providers to access working capital against approved—but not yet reimbursed—claims.

This repository contains the **ReactJS frontend implementation** for the AfyaCapital module. It defines the user interface, layouts, components, and integration approach for embedding financing services into openIMIS.

For the **48-hour hackathon MVP**, the demonstration interface is served through the deployment stack to simplify integration and allow the team to focus on validating the financing workflow and backend logic. The long-term vision is to integrate these React components as a native module within the openIMIS frontend.

---

# Repository Purpose

This repository provides the frontend foundation for AfyaCapital.

Its responsibilities include:

- Designing the financing dashboard experience
- Creating reusable React components
- Managing page layouts and navigation
- Connecting to backend GraphQL services
- Supporting future integration into the openIMIS frontend ecosystem

---

# The Problem

Healthcare providers deliver care today but often wait a long time before receiving reimbursement from SHA.

Even after claims have been successfully approved, facilities still need immediate funds to:

- Pay healthcare workers
- Purchase medicines and medical supplies
- Maintain equipment
- Continue serving patients

Without sufficient working capital, healthcare delivery is affected despite reimbursement already being guaranteed.

---

# Our Solution

AfyaCapital extends the openIMIS ecosystem by introducing an embedded financing experience.

Instead of creating a separate application, healthcare providers access financing opportunities directly from within the claims management workflow.

The intended user experience is simple:

```
Login

↓

View Eligible Claims

↓

Review Financing Offer

↓

Request Advance

↓

Receive Confirmation
```

---

# Planned User Experience

The AfyaCapital interface is designed around a simple financing journey.

### Dashboard

Displays:

- Total Approved Claims
- Available Financing
- Active Advances
- Outstanding Reimbursements
- Facility Risk Score

---

### Eligible Claims

Healthcare providers can view:

- Claim ID
- Claim Status
- Approved Amount
- Financing Amount
- Risk Score

---

### Financing Offer

Each eligible claim presents:

- Approved Amount
- Available Advance
- Advance Percentage
- Expected Settlement
- Financing Status

---

### Financing Request

Healthcare providers can submit financing requests directly from the interface.

For the hackathon MVP, financing approval is simulated.

---

### Loan History

Displays:

- Previous financing requests
- Repayment status
- Outstanding balance
- Financing history

---

# User Journey

```
Healthcare Provider

        │

        ▼

Login

        │

        ▼

AfyaCapital Dashboard

        │

        ▼

Eligible Claims

        │

        ▼

Financing Offer

        │

        ▼

Request Advance

        │

        ▼

Financing Approved (Simulation)
```

---

# Technology Stack

| Component | Technology |
|------------|------------|
| Framework | ReactJS |
| Language | JavaScript |
| Styling | Material UI / openIMIS Components |
| API | GraphQL |
| Authentication | JWT |
| Backend | Django |
| Interoperability | FHIR R4 |

---

# Frontend Architecture

The frontend follows the modular architecture used throughout openIMIS.

The application is designed around reusable components and GraphQL integration to support future native integration into the openIMIS platform.

Example project structure:

```
src/
│
├── components/
├── pages/
├── graphql/
├── services/
├── hooks/
├── layouts/
├── assets/
└── utils/
```

---

# Backend Communication

The frontend communicates with the AfyaCapital backend using GraphQL.

Example operations include:

- Retrieve Eligible Claims
- Retrieve Financing Offers
- Retrieve Facility Risk Score
- Submit Financing Request

Primary endpoint:

```
http://localhost:8000/api/graphql
```

---

# Security & Privacy

AfyaCapital follows the principle of minimum data exposure.

The frontend displays only information required for financing decisions.

Visible information includes:

- Facility Name
- Claim Number
- Approved Amount
- Available Financing
- Risk Score

Patient clinical information remains securely within openIMIS and is never shared with financing partners.

---

# Running the Frontend

Clone the repository:

```bash
git clone https://github.com/YOUR_GITHUB_HANDLE/openimis-fe_js.git
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm start
```

For the hackathon demonstration, the complete user interface is launched through the Docker deployment stack together with the backend services to provide a streamlined end-to-end demonstration.

---

# Future Enhancements

Future versions of the frontend will include:

- Native integration into the openIMIS navigation menu
- Live GraphQL updates
- Notification center
- Financing analytics dashboard
- Responsive mobile interface
- Multiple financing partner offers
- Multi-language support
- Accessibility improvements

---

# Known Limitations

As this project was developed during a **48-hour hackathon**, some implementation decisions were made to maximize delivery of the core financing workflow.

Current limitations include:

- The demonstration interface is served through the deployment environment for the MVP.
- Native integration into the openIMIS React application is planned for future development.
- Financing approvals are simulated.
- External banking integration is mocked.
- Risk scoring uses simplified demonstration logic.

These trade-offs allowed the team to prioritize validation of the financing workflow and backend integration while delivering a complete end-to-end demonstration.

---

# Contributing

Create a feature branch:

```bash
git checkout -b feature/afyacapital-ui
```

Commit your changes:

```bash
git add .
git commit -m "feat: add AfyaCapital frontend components"
```

Push your branch:

```bash
git push origin feature/afyacapital-ui
```

Open a Draft Pull Request against the official **openIMIS frontend repository**.

---

# License

This project was developed for the **openIMIS Hackathon 2026**.

It follows the licensing terms of the openIMIS project.

---

# Team

**Project:** AfyaCapital

**Hackathon:** openIMIS Hackathon 2026

**Mission:** Transform approved healthcare claims into timely working capital—helping healthcare providers maintain operations while waiting for reimbursement, ultimately supporting stronger and more resilient health systems.