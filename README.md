# EduKos

EduKos is an education and institution discovery platform. The backend is built with .NET Web API, SQL Server, Entity Framework Core, JWT authentication, refresh tokens, role authorization, and a full database model for users, roles, institutions, reviews, saved institutions, recommendations, notifications, files, and settings.

## Backend Work Completed

The backend now includes:

- Entity classes for the full SQL schema.
- `AppDbContext` DbSets and Fluent API configuration.
- EF Core migrations for the complete database schema.
- JWT login.
- Refresh token persistence, refresh, logout, and revoke support.
- Role-based authorization.
- Seeded roles and seeded test users.
- CRUD APIs for users, roles, institutions, institution types, institution details, programs, staff, facilities, announcements, reviews, saved institutions, recommendations, notifications, files, and settings.
- Institution search and filtering by name, city, category/type, program, and approval status.
- Save and unsave institution endpoints.
- Full institution details endpoint with details, programs, staff, facilities, reviews, and announcements.
- Docker support for SQL Server and the API.

## Seeded Roles And Users

The application seeds these roles:

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@edukos.com | Admin123! |
| Nxenes | nxenes@edukos.com | Nxenes123! |
| Shkolla | shkolla@edukos.com | Shkolla123! |

Registration allows normal users to register as `Nxenes` or `Shkolla`. `Admin` is seeded and is not assigned through public registration.

## Main Backend Structure

```text
server/src/EduKos.API
server/src/EduKos.Application
server/src/EduKos.Domain
server/src/EduKos.Infrastructure
```

Important files:

- `server/src/EduKos.Domain/Entities/EducationEntities.cs`
- `server/src/EduKos.Application/DTOs/Education/EducationDtos.cs`
- `server/src/EduKos.Infrastructure/Persistence/AppDbContext.cs`
- `server/src/EduKos.Infrastructure/Seed/RoleSeeder.cs`
- `server/src/EduKos.Infrastructure/Identity/IdentityService.cs`
- `server/src/EduKos.API/Controllers/AuthController.cs`
- `server/src/EduKos.API/Controllers/InstitutionsController.cs`
- `server/src/EduKos.API/Controllers/SavedInstitutionsController.cs`
- `server/src/EduKos.API/Controllers/ReviewsController.cs`

## Run Locally Without Docker

Requirements:

- .NET 10 SDK
- SQL Server LocalDB or SQL Server

Commands:

```powershell
dotnet restore server\server.slnx
dotnet ef database update --project server\src\EduKos.Infrastructure --startup-project server\src\EduKos.API --context AppDbContext
dotnet run --project server\src\EduKos.API --urls http://localhost:5088
```

The API will also apply migrations and seed roles/users on startup.

OpenAPI is available in development mode:

```text
http://localhost:5088/openapi/v1.json
```

Scalar API reference is available at:

```text
http://localhost:5088/scalar/v1
```

## Run With Docker

Requirements:

- Docker Desktop

Start SQL Server and the API:

```powershell
docker compose up --build
```

The API will be available at:

```text
http://localhost:5088
```

SQL Server will be available from the host at:

```text
Server=localhost,14333;Database=EduKos;User Id=sa;Password=EduKos_Dev123!;TrustServerCertificate=True;
```

If the API starts before SQL Server is fully ready, Docker will restart it because `restart: on-failure` is enabled.

Stop containers:

```powershell
docker compose down
```

Remove containers and database volume:

```powershell
docker compose down -v
```

## Authentication Examples

Register:

```http
POST http://localhost:5088/api/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "Test123!",
  "confirmPassword": "Test123!",
  "firstName": "Test",
  "lastName": "Student",
  "phoneNumber": "123456",
  "role": "Nxenes"
}
```

Login:

```http
POST http://localhost:5088/api/auth/login
Content-Type: application/json

{
  "email": "admin@edukos.com",
  "password": "Admin123!"
}
```

Current user:

```http
GET http://localhost:5088/api/auth/me
Authorization: Bearer ACCESS_TOKEN
```

Refresh token:

```http
POST http://localhost:5088/api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "REFRESH_TOKEN"
}
```

Logout or revoke refresh token:

```http
POST http://localhost:5088/api/auth/logout
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "refreshToken": "REFRESH_TOKEN"
}
```

## Useful Institution Endpoints

Search institutions:

```http
GET http://localhost:5088/api/institutions/search?city=Prishtine&category=Fakultete&program=Computer
```

Get institutions by type:

```http
GET http://localhost:5088/api/institutions/by-type/4
```

Get full details:

```http
GET http://localhost:5088/api/institutions/1/full-details
```

Save institution:

```http
POST http://localhost:5088/api/savedinstitutions/save
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "institutionId": 1
}
```

Unsave institution:

```http
DELETE http://localhost:5088/api/savedinstitutions/unsave/1
Authorization: Bearer ACCESS_TOKEN
```

Add review:

```http
POST http://localhost:5088/api/reviews
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "institutionId": 1,
  "teachingQualityRating": 5,
  "facilitiesRating": 4,
  "difficultyRating": 3,
  "staffRating": 5,
  "comment": "Very good institution."
}
```

## Authorization Summary

- `Admin` can manage users, roles, delete protected resources, and access admin endpoints.
- `Shkolla` can create and update institution-related resources.
- `Nxenes` can use user features such as saving institutions and adding reviews.

Use the `Authorization: Bearer ACCESS_TOKEN` header for protected endpoints.
