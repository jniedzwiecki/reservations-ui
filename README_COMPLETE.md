# Concert Hall Reservations - Angular UI

A comprehensive Angular 17+ frontend application for the Concert Hall Reservations system, built with Angular Material and standalone components.

## 🎯 Features

### Customer Features
- **Browse Events**: View all published concerts and events
- **Event Details**: See comprehensive event information with availability
- **Ticket Reservation**: Reserve tickets with confirmation dialog
- **My Tickets**: View and manage ticket reservations with upcoming/past tabs
- **Ticket Management**: View ticket details and cancel reservations
- **User Profile**: View account information and statistics

### Admin/Power User Features
- **Dashboard**: Analytics overview with key metrics and recent events
- **Event Management**: Full CRUD operations for events
- **Event Form**: Create and edit events with validation
- **Event Sales**: View detailed sales analytics per event
- **User Management** (Admin only): Manage users and create power users
- **Status Management**: Update event statuses (Draft, Published, Cancelled, Completed)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend API running at http://localhost:8080

### Installation & Running
```bash
cd /home/jacek/git/reservations-ui
npm install
ng serve
```

Navigate to http://localhost:4200

## 📁 Project Structure

```
src/app/
├── core/                    # Guards, interceptors, services
├── shared/                  # Shared components, models
├── features/                # Feature modules
│   ├── auth/               # Login/Register
│   ├── customer/           # Customer features
│   ├── admin/              # Admin features
│   └── home/               # Landing page
├── layouts/                 # Layout components
└── app.routes.ts           # Routing
```

## 🔐 User Roles

- **CUSTOMER**: Browse events, reserve tickets
- **POWER_USER**: + Create/manage events, view analytics
- **ADMIN**: + Manage users

## 📝 API Integration

Backend: http://localhost:8080/api
- Authentication: /auth/login, /auth/register
- Events: /events (CRUD + analytics)
- Tickets: /tickets (reserve, view, cancel)
- Users: /users (management)

CORS configuration already added to backend.

Built with Angular 17+ and Material Design
