# Evergreen
### Real Estate & Land Management Platform

A comprehensive real estate management system designed for land development companies, featuring multi-role dashboards, payment tracking, and project management capabilities.

## Overview

Evergreen is a full-stack web application that streamlines real estate operations from land acquisition to client management. The platform serves multiple user types with role-specific dashboards and functionality, making it ideal for land development companies managing subdivision projects and client transactions.

## Features

### Core Functionality
- **Land Management**: Complete property portfolio management with detailed land records
- **Lot Management**: Individual lot tracking within development projects
- **Client Payment System**: Installment payment tracking with automated scheduling
- **Task Management**: Project assignment and progress tracking for team members
- **Document Management**: Centralized file storage and organization system
- **User Role Management**: Multi-tiered access control for different team roles

### Specialized Tools
- **Residential Form System (RFS)**: Standardized forms for residential planning
- **OCS Calculator**: Office of City Settlement calculation tools
- **Payment Transaction History**: Complete financial audit trails
- **Notification System**: Real-time updates and alerts
- **Public Website**: Marketing showcase for available properties

### User Roles & Access Levels
- **Super Admin**: Complete system access and user management
- **Admin**: Task management and operational oversight
- **Agent**: Land and client management capabilities
- **Intern**: Task execution and basic land operations
- **Client**: Payment tracking and property browsing

## Technology Stack

### Backend
- **Framework**: Laravel 11 (PHP 8.2+)
- **Authentication**: Laravel Sanctum
- **Database**: MySQL with Eloquent ORM
- **Testing**: PHPUnit with Laravel testing suite

### Frontend
- **Framework**: React 18 with Vite
- **UI Library**: Ant Design components
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Animations**: Framer Motion
- **Icons**: Lucide React & Ant Design Icons

### Development Tools
- **Code Quality**: Laravel Pint, ESLint
- **Build System**: Vite for frontend, Laravel Mix integration
- **Development**: Laravel Sail, Artisan commands

## Installation

### Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm
- MySQL 5.7+ or MariaDB

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd evergreen
   ```

2. **Backend Setup**
   ```bash
   # Install PHP dependencies
   composer install
   
   # Copy environment configuration
   cp .env.example .env
   
   # Generate application key
   php artisan key:generate
   
   # Configure database in .env file
   # DB_DATABASE=evergreen
   # DB_USERNAME=your_username
   # DB_PASSWORD=your_password
   
   # Run migrations
   php artisan migrate
   
   # Seed initial data (optional)
   php artisan db:seed
   ```

3. **Frontend Setup**
   ```bash
   # Install Node dependencies
   npm install
   
   # Setup React application
   cd react
   npm install
   cd ..
   ```

4. **Development Server**
   ```bash
   # Start all services concurrently
   composer run dev
   
   # Or run separately:
   # Backend: php artisan serve
   # Frontend: npm run dev (in react directory)
   ```

## Project Structure

```
evergreen/
├── app/                    # Laravel application core
│   ├── Http/Controllers/   # API controllers
│   ├── Models/            # Database models
│   └── ...
├── react/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── layouts/       # Layout components
│   │   └── ...
├── routes/                # Laravel routes
├── database/              # Migrations and seeders
└── public/               # Public assets
```

## Key Components

### Land Management
- Property listing and detailed information
- Geographic data and mapping integration
- Status tracking (available, sold, reserved)
- Image galleries and documentation

### Payment System
- Installment plan creation and management
- Payment recording and verification
- Transaction history and reporting
- Client payment dashboards

### Task Management
- Assignment and delegation system
- Progress tracking and status updates
- File submission and review process
- Role-based task visibility

### File Management
- Hierarchical folder organization
- File upload and download capabilities
- Preview functionality for common formats
- Access control and permissions

## API Documentation

The application provides a RESTful API with the following main endpoints:

- **Authentication**: `/api/login`, `/api/signup`, `/api/logout`
- **Lands**: `/api/lands` (CRUD operations)
- **Lots**: `/api/lots` (CRUD operations)
- **Client Payments**: `/api/client-payments` (Payment management)
- **Tasks**: `/api/admin/tasks` (Task management)
- **Files**: `/api/files`, `/api/folders` (File operations)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

---

**Built with Laravel & React** | **Professional Real Estate Management Solution**