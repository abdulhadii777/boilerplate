# Multi-Tenant Boilerplate Rules — Laravel 12 + Stancl v3.9 + Inertia React + Spatie Permission

## 1) Architecture Overview

**Central DB:**

* Holds `users` table (authentication).
* Login/registration handled centrally (`/login`, `/register`).

**Tenant DBs:**

* Provisioned per tenant (`tenant_{id}`).
* Hold tenant-specific business data (e.g., products, invoices).
* Contain Spatie Permission tables (`roles`, `permissions`, `model_has_roles`).

**Multi-tenancy Strategy:**

* Stancl v3.9 with path-based finder → tenants accessed at `/t/{tenant}/...`.
* Tenant DB connection resolved at runtime.

**Permissions:**

* Spatie Laravel Permission.
* Roles & permissions created in each tenant DB.
* Central users are assigned roles inside tenant DB.

**Frontend:**

* Inertia.js + React 18 + Vite + TypeScript.
* Central pages: Login, Register.
* Tenant pages: Dashboard, Role Management.

---

## 2) Tech Stack & Packages

**Backend:**

* Laravel 12 (PHP 8.3+).
* `stancl/tenancy:^3.9`.
* `spatie/laravel-permission`.

**Frontend:**

* Inertia.js + React.
* TailwindCSS + shadcn/ui.

**Database:**

* MySQL (central DB + per-tenant DBs).

---

## 3) Step-by-Step Setup

**3.1 New Project**

```bash
composer create-project laravel/laravel laravel-inertia-tenancy "^12.0"
cd laravel-inertia-tenancy
```

**3.2 Install Packages**

```bash
composer require stancl/tenancy:^3.9
php artisan vendor:publish --provider="Stancl\\Tenancy\\TenancyServiceProvider"

composer require inertiajs/inertia-laravel
php artisan inertia:middleware

composer require spatie/laravel-permission
php artisan vendor:publish --provider="Spatie\\Permission\\PermissionServiceProvider" --tag="permission-config"
php artisan vendor:publish --provider="Spatie\\Permission\\PermissionServiceProvider" --tag="permission-migrations"
```

**3.3 Move Spatie migrations to tenant**

* Move files from `/database/migrations` → `/database/migrations/tenant`.
* Add connection:

```php
Schema::connection('tenant')->create('roles', function (Blueprint $table) { ... });
```

**3.4 Configure DB**

```php
'mysql' => [... central ...],
'tenant' => [... dynamic, database null ...],
```

**3.5 Configure tenancy** (`config/tenancy.php`)

```php
'tenant_finder' => Stancl\\Tenancy\\TenantFinder\\PathTenantFinder::class,
'path' => 't/{tenant}',
```

---

## 4) Core Features

**4.1 Central Authentication**

* `users` table in central DB.
* Controllers under `App\\Http\\Controllers\\Central`.

**4.2 Tenant Provisioning**

* Tenant created on registration (`Tenant::create()`).
* Auto-create tenant DB; run `php artisan tenants:migrate`.
* Seed default roles/permissions (owner, admin, member).
* Owner role auto-assigned to registering user.

**4.3 Spatie Roles & Permissions**

* TenantRole, TenantPermission models use `protected $connection = 'tenant'`.
* `User` model uses `HasRoles`.
* Example:

```php
$user->assignRole('owner');
```

**4.4 Middleware**

* `EnsureTenantRole` → user must have role in tenant.

**4.5 Role Grant**

* Owner/Admin grant roles to central users:

```
POST /t/{tenant}/roles/grant { "email":"staff@example.com", "role":"member" }
```

---

## 5) Implementation Details

**5.1 Models**

* User → central connection, uses HasRoles.
* TenantRole → extends Spatie Role, tenant connection.
* TenantPermission → extends Spatie Permission, tenant connection.

**5.2 Events**

* On TenantCreated:

  * Seed roles & permissions.
  * Assign owner role.

**5.3 Middleware**

* On TenancyInitialized: reset Spatie cache.
* Custom middleware `tenant.role` to guard routes.

**5.4 Routes**

* `routes/central.php`: `/login`, `/register`.
* `routes/tenant.php`: `/t/{tenant}/dashboard`, `/t/{tenant}/roles/grant`.

**5.5 Inertia Pages**

* Central: `Login.tsx`, `Register.tsx`.
* Tenant: `Dashboard.tsx`, `RoleGrant.tsx`.

---

## 6) Developer Checklist ✅

🔧 **Setup**

* [ ] Install Laravel 12.
* [ ] Install & configure Stancl v3.9.
* [ ] Install Inertia + React.
* [ ] Install Spatie Permission.

🗄 **Database**

* [ ] Central DB schema: users.
* [ ] Tenant DB schema: Spatie tables.
* [ ] Migrations moved to tenant folder.
* [ ] Test `php artisan tenants:migrate`.

🧑‍💻 **Backend**

* [ ] User model with HasRoles.
* [ ] Tenant Role/Permission models.
* [ ] Registration controller (creates tenant + owner role).
* [ ] Middleware for tenant role checks.
* [ ] RoleGrantController (email + role assignment).
* [ ] Tenancy event listener (seeding + cache reset).

🎨 **Frontend**

* [ ] Inertia setup (`resources/js/app.tsx`).
* [ ] Central pages: Login, Register.
* [ ] Tenant Dashboard page.
* [ ] Tenant RoleGrant page.

🔒 **Security**

* [ ] Protect tenant routes with `auth` + `tenant.role`.
* [ ] Reset Spatie cache per tenancy init.
* [ ] Ensure only owner/admin can grant roles.

🚀 **QA / Testing (Pest)**

* [ ] Register new user → tenant created → owner role assigned.
* [ ] Grant member role to central user → tenant access works.
* [ ] Permission checks inside tenant.
* [ ] Cache isolation confirmed.

---

## 7) Future Enhancements

* 🔗 Invites: tokenized invite links for role grants.
* 🛠 shadcn/ui: build forms & tables for role/permission UI.
* 🛡 Audit logs: record role changes per tenant.
* 🔄 Role management UI: CRUD roles & permissions per tenant.

---
