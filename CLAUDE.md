# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Library Management System (Sistema de Gestión de Biblioteca Maridiaz)** built with Laravel (backend) and React with TypeScript (frontend) using Inertia.js. The system manages books, readers, loans, returns, and generates reports for a school library with separate sections for primary and secondary education.

## Tech Stack

- **Backend**: Laravel (PHP 8.2+)
- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Full-Stack Framework**: Inertia.js 2.0
- **Build Tool**: Vite 6
- **UI Components**: Radix UI + Shadcn UI patterns
- **Database**: MySQL
- **Authentication**: Laravel's built-in auth with Spatie Laravel Permission for roles
- **PDF Generation**: DomPDF (barryvdh/laravel-dompdf)
- **Excel Export**: Maatwebsite Excel

## Development Commands

### Running the Application

```bash
# Development mode - runs server, queue worker, and Vite concurrently
composer dev

# Alternative: run services separately
php artisan serve          # Backend server (http://localhost:8000)
npm run dev               # Frontend development with Vite
php artisan queue:listen  # Queue worker for background jobs
```

### Building Assets

```bash
npm run build              # Production build
npm run build:ssr         # Build with SSR support
composer dev:ssr          # Run development mode with SSR
```

### Code Quality

```bash
npm run lint              # Run ESLint with auto-fix
npm run format            # Format code with Prettier
npm run format:check      # Check formatting without changes
npm run types             # TypeScript type checking
./vendor/bin/pint         # PHP code formatting (Laravel Pint)
```

### Testing

```bash
composer test             # Run PHPUnit tests
./vendor/bin/phpunit      # Direct PHPUnit execution
```

### Database

```bash
php artisan migrate                    # Run migrations
php artisan migrate:fresh --seed       # Fresh migration with seeders
php artisan db:seed                    # Run seeders only
```

## Architecture Overview

### User Roles & Permissions

The system uses **Spatie Laravel Permission** with three main roles:

1. **Administrador**: Full system access, manages users, grades, and system settings
2. **BibliotecarioPrimaria**: Manages primary section library (books, loans, reports)
3. **BibliotecarioBachillerato**: Manages secondary section library (books, loans, reports)

**Key Middleware**:
- `role:RoleName` - Restricts access to specific roles (supports multiple: `role:Administrador|BibliotecarioPrimaria`)
- `not.admin` - Blocks administrators (used for librarian-only features like reports)
- `active.user` - Ensures user account is active

### Core Domain Models

**Book Management**:
- `Libro` (Book) - Main book entity with ISBN/ISSN, title, author, publisher, Dewey classification
  - Auto-creates first `Ejemplar` on creation via model boot event
  - Validates ISBN (13 digits for books) and ISSN (8 digits for magazines)
  - Related to: `Seccion`, `Autor`, `Editorial`, `TemaDewey`, `Estanteria`
- `Ejemplar` (Copy) - Physical copies of books with individual tracking
  - States: `DISPONIBLE`, `PRESTADO`, `PERDIDO`, `DAÑADO`
  - Acquisition types: `COMPRA`, `DONACION`, `INTERCAMBIO`, `OTROS`
- `Autor`, `Editorial`, `Estanteria` - Supporting entities

**Classification System**:
- Uses Dewey Decimal Classification via `CategoriaDewey` → `SubcategoriaDewey` → `TemaDewey` hierarchy
- `SignaturaTopograficaController` generates topographic signatures (Cutter numbers)

**Readers & Loans**:
- `Lector` (Reader) - Students/readers organized by `Grado` (grade level)
  - Has unique code, status (active/inactive), and section (Primaria/Bachillerato)
- `Prestamo` (Loan) - Tracks book loans
  - States: `ACTIVO`, `DEVUELTO`, `VENCIDO`
  - Auto-updates `Ejemplar` state on creation via model boot event
  - Validates reader is active and copy is available before creating
- `Grado` - Grade levels (e.g., "1° Primaria", "4° Bachillerato")

**User Management**:
- `User` - System users with roles, managed only by Administrador
- Custom validation and state management via model boot events

### Frontend Architecture

**File Structure**:
- `resources/js/pages/` - Inertia page components (mapped 1:1 to routes)
- `resources/js/components/` - Reusable React components
- `resources/js/components/ui/` - Shadcn UI components

**Key Patterns**:
- Uses Inertia.js for SPA-like navigation without API endpoints
- TypeScript path alias: `@/*` maps to `resources/js/*`
- Ziggy for type-safe route generation from Laravel routes
- Form handling via Inertia forms with automatic CSRF handling

**Navigation & Layout**:
- `app-sidebar.tsx` - Main navigation sidebar with role-based menu items
- `app-header.tsx` - Top header with user info and appearance toggle
- Breadcrumbs component for page hierarchy

### Backend Architecture

**Controllers Pattern**:
All controllers follow RESTful pattern with Inertia responses:
- `index()` - List view with pagination/filtering
- `create()` - Show creation form
- `store()` - Handle form submission
- `show($id)` - Show single resource
- `edit($id)` - Show edit form
- `update($id)` - Handle update
- `destroy($id)` - Delete resource

**Special Controllers**:
- `InlineCreateController` - AJAX endpoints for creating related entities inline (authors, publishers, shelves)
- `SignaturaTopograficaController` - API for generating Cutter numbers and validating signatures
- `PrestamoMasivoController` - Bulk loan creation
- `DevolucionController` - Handles returns including bulk returns
- `InformeController` - Generates PDF reports (loans, overdue, lost books)
- `InventarioController` - Excel export of inventory
- `DashboardController` - Statistics and charts for dashboard

**Route Organization**:
- `routes/web.php` - Main application routes with extensive middleware grouping
- `routes/auth.php` - Authentication routes
- `routes/settings.php` - Settings management routes
- CSRF refresh endpoint: `/csrf-refresh` for long-lived sessions

### Database Patterns

**Migration Structure**:
Migrations use descriptive timestamps (e.g., `2025_04_17_000000_create_secciones_table.php`)

**Model Events**:
Models use `boot()` method for:
- Validation before creation (`creating` event)
- Auto-relationships (e.g., Libro creates first Ejemplar)
- State transitions (e.g., Prestamo updates Ejemplar state)

**Common Pattern** - Models throw exceptions for validation errors:
```php
throw new \Exception('Error message');
```

## Common Workflows

### Adding a New Book

1. User creates `Libro` via `LibroController::store()`
2. Model validates ISBN/ISSN format and required fields
3. On successful creation, model automatically creates first `Ejemplar`
4. Signatura topográfica (topographic signature) is generated via `SignaturaTopograficaController`

### Creating a Loan

1. Search for reader by code via `PrestamoController::buscarLector()`
2. Select available `Ejemplar` (must be in `DISPONIBLE` state)
3. Submit to `PrestamoController::store()`
4. Model validates reader is active and ejemplar is available
5. Creates `Prestamo` and updates `Ejemplar` state to `PRESTADO` via model event

### Generating Reports

1. Librarians access `/informes` (blocked for administrators)
2. Select report type and date range
3. View results in browser or download PDF via `InformeController`
4. Available reports: loans made, unreturned books, lost books

## Important Notes

### Role-Based Access

- **Administrators** cannot access `/informes` or `/inventario` (librarian-only features)
- **Librarians** are restricted to their section (Primaria or Bachillerato) via business logic
- Use `@can()` directives in frontend for conditional UI based on permissions

### CSRF Token Handling

- Inertia automatically includes CSRF token in requests
- For long sessions, use `/csrf-refresh` endpoint to get new token
- Token is shared with frontend via Inertia shared data

### TypeScript Path Resolution

- Use `@/` prefix for imports: `import { Button } from '@/components/ui/button'`
- Configured in both `tsconfig.json` and `vite.config.ts`

### Date Handling

- Backend uses MySQL DATE format (Y-m-d)
- Frontend uses `date-fns` for formatting
- Be mindful of timezone issues - models use date casts without time

### Model State Management

- Models validate data in `boot()` events, not in controllers
- Controllers should catch exceptions from model operations
- State transitions (e.g., loan → return) are handled in model methods

### Excel/PDF Generation

- PDF: Use `InformeController` methods with DomPDF
- Excel: Use `InventarioController::exportarExcel()` with Maatwebsite Excel
- Both use Laravel queues for large datasets (though current implementation is synchronous)

## File Naming Conventions

- **Controllers**: PascalCase with `Controller` suffix (e.g., `LibroController.php`)
- **Models**: Singular PascalCase (e.g., `Libro.php`)
- **React Components**: PascalCase (e.g., `AppHeader.tsx`)
- **React Pages**: kebab-case or camelCase based on Laravel route (e.g., `dashboard.tsx`)
- **Migrations**: `YYYY_MM_DD_HHMMSS_description.php`

## Testing Considerations

When writing tests:
- Use factories for model creation
- Test model validation by attempting invalid creates
- Mock Inertia responses for controller tests
- Ensure role-based access is tested for protected routes
