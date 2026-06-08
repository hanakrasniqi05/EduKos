# EduKos API Documentation

This document describes the current EduKos HTTP API, authentication flow,
role authorization, SQL and MongoDB responsibilities, RTC communication, and
common request examples.

## 1. Service URLs

| Service | Local | Docker |
| --- | --- | --- |
| .NET API | `http://localhost:5056` | `http://localhost:5088` |
| API base path | `/api` | `/api` |
| OpenAPI JSON | `/openapi/v1.json` | `/openapi/v1.json` |
| Scalar UI | `/scalar/v1` | `/scalar/v1` |
| Socket.IO RTC | `http://localhost:5060` | `http://localhost:5060` |
| RTC health | `http://localhost:5060/health` | `http://localhost:5060/health` |

Examples in this document use:

```text
http://localhost:5056/api
```

## 2. Authentication

Protected endpoints use JWT Bearer authentication:

```http
Authorization: Bearer ACCESS_TOKEN
```

The access token contains the user identifier and role claims. The frontend
also stores the roles returned by login and uses them to protect routes and
hide actions that do not belong to the current role.

### Roles

| Role | Purpose |
| --- | --- |
| `Admin` | System administration, users, roles, imports, exports, logs and global analytics |
| `Nxenes` | Student dashboard, applications, saved institutions and school conversations |
| `Shkolla` | Institution dashboard, institution content, applications and institution conversations |

Seeded development accounts:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@edukos.com` | `Admin123!` |
| Nxenes | `nxenes@edukos.com` | `Nxenes123!` |
| Shkolla | `shkolla@edukos.com` | `Shkolla123!` |

### Token lifecycle

1. Register or login returns an access token and refresh token.
2. Send the access token in the `Authorization` header.
3. When the access token expires, call `/auth/refresh`.
4. Refreshing rotates the token pair.
5. Logout or revoke sets `RevokedAt` on the stored refresh token.
6. Expired, revoked, unknown or user-mismatched refresh tokens are rejected.

Default configuration:

```text
Access token: 60 minutes
Refresh token: 7 days
```

### Authentication endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | Register a `Nxenes` or `Shkolla` account |
| `POST` | `/auth/login` | Public | Authenticate and return tokens |
| `POST` | `/auth/refresh` | Public | Rotate a valid refresh token |
| `POST` | `/auth/logout` | Authenticated | Revoke the supplied refresh token |
| `POST` | `/auth/revoke-refresh-token` | Authenticated | Explicitly revoke a refresh token |
| `GET` | `/auth/me` | Authenticated | Return the current user and database roles |
| `PUT` | `/auth/me` | Authenticated | Update first name, last name and phone |

Register a student:

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "Student123!",
  "confirmPassword": "Student123!",
  "firstName": "Arta",
  "lastName": "Berisha",
  "phoneNumber": "+38344111222",
  "role": "Nxenes"
}
```

Register an institution:

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "school@example.com",
  "password": "School123!",
  "confirmPassword": "School123!",
  "firstName": "School",
  "lastName": "Owner",
  "role": "Shkolla",
  "institutionName": "Shkolla Test",
  "institutionTypeId": 2,
  "city": "Prishtine",
  "website": "https://example.com"
}
```

Login:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "nxenes@edukos.com",
  "password": "Nxenes123!"
}
```

Response:

```json
{
  "userId": "2",
  "email": "nxenes@edukos.com",
  "accessToken": "JWT_ACCESS_TOKEN",
  "refreshToken": "REFRESH_TOKEN",
  "accessTokenExpiresAt": "2026-06-08T20:00:00Z",
  "refreshTokenExpiresAt": "2026-06-15T19:00:00Z",
  "roles": ["Nxenes"],
  "institutionExists": false,
  "institutionIsApproved": null,
  "institutionIsDeleted": false
}
```

Refresh or logout body:

```json
{
  "refreshToken": "REFRESH_TOKEN"
}
```

## 3. Response status codes

| Code | Meaning |
| --- | --- |
| `200` | Request completed |
| `201` | Resource created |
| `204` | Request completed without a response body |
| `400` | Invalid request or business rule violation |
| `401` | Missing, invalid or expired authentication |
| `403` | Authenticated user does not have the required role or ownership |
| `404` | Resource was not found |
| `409` | Duplicate resource, such as an existing email |
| `500` | Unexpected server error |

Validation errors are produced automatically for DTO properties decorated with
`Required`, `EmailAddress`, `Range`, and maximum-length rules.

## 4. Institutions

### Public endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/institutions` | List institutions |
| `GET` | `/institutions/{id}` | Get one institution |
| `GET` | `/institutions/by-type/{institutionTypeId}` | Filter by institution type |
| `GET` | `/institutions/search` | Search and filter institutions |
| `GET` | `/institutions/{id}/full-details` | Institution, details, programs, staff, facilities, reviews and announcements |
| `GET` | `/home/stats` | Counts for institutions, programs and users |

Search parameters currently applied:

| Parameter | Type | Description |
| --- | --- | --- |
| `name` | string | Partial institution name |
| `city` | string | Partial city |
| `category` | string | Institution type name |
| `institutionTypeId` | integer | Exact institution type |
| `program` | string | Program name or level |
| `isApproved` | boolean | Approval status |
| `minTuitionFee` | decimal | At least one program at or above this fee |
| `maxTuitionFee` | decimal | At least one program at or below this fee |
| `minRating` | number | Minimum average review rating |

Example:

```http
GET /api/institutions/search?city=Prishtine&category=Fakultete&program=Computer&isApproved=true
```

`language` and `institutionOwnership` exist in the request DTO but are not yet
applied by the current query implementation.

### Institution management

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/institutions/my` | Shkolla | Basic owned institution |
| `GET` | `/institutions/my/full` | Shkolla | Full owned institution |
| `PUT` | `/institutions/my` | Shkolla | Update owned institution |
| `POST` | `/institutions` | Admin, Shkolla | Create institution |
| `PUT` | `/institutions/{id}` | Admin, Shkolla | Update institution |
| `DELETE` | `/institutions/{id}` | Admin | Delete institution |
| `GET` | `/institution/my-profile` | Shkolla, Admin | Dashboard institution profile |
| `PUT` | `/institution/my-profile` | Shkolla, Admin | Update dashboard institution profile |
| `GET` | `/institution/my-profile/details` | Shkolla, Admin | Owned profile with related data |

Most institution-dashboard endpoints resolve the institution through the
authenticated user's `OwnerUserId`. A user without an owned institution
receives `404`.

Institution body:

```json
{
  "institutionTypeId": 4,
  "name": "Kolegji EduKos",
  "description": "Institution description",
  "location": "Prishtine",
  "city": "Prishtine",
  "address": "Rruga Test",
  "website": "https://example.com",
  "email": "info@example.com",
  "phone": "+38338111222",
  "isApproved": true
}
```

## 5. Institution content

These endpoints are intended for the institution dashboard and operate on the
institution owned by the authenticated account.

### Programs

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/institution-programs/my` | Shkolla, Admin |
| `POST` | `/institution-programs` | Shkolla, Admin |
| `PUT` | `/institution-programs/{id}` | Shkolla, Admin |
| `DELETE` | `/institution-programs/{id}` | Shkolla, Admin |

```json
{
  "name": "Shkenca Kompjuterike",
  "level": "Bachelor",
  "description": "Program description",
  "duration": "3 vite",
  "tuitionFee": 1800,
  "ects": 180
}
```

### Staff

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/institution-staff/my` | Shkolla, Admin |
| `POST` | `/institution-staff` | Shkolla, Admin |
| `PUT` | `/institution-staff/{id}` | Shkolla, Admin |
| `DELETE` | `/institution-staff/{id}` | Shkolla, Admin |

```json
{
  "fullName": "Arben Krasniqi",
  "position": "Profesor",
  "photoFileId": null
}
```

### Facilities

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/institution-facilities/my` | Shkolla, Admin |
| `POST` | `/institution-facilities` | Shkolla, Admin |
| `PUT` | `/institution-facilities/{id}` | Shkolla, Admin |
| `DELETE` | `/institution-facilities/{id}` | Shkolla, Admin |

```json
{
  "name": "Laboratori i kompjuterëve",
  "description": "Laborator me 30 kompjuterë."
}
```

### Announcements

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/institution-announcements/my` | Shkolla, Admin |
| `POST` | `/institution-announcements` | Shkolla, Admin |
| `PUT` | `/institution-announcements/{id}` | Shkolla, Admin |
| `DELETE` | `/institution-announcements/{id}` | Shkolla, Admin |

Creating an announcement also produces RTC notifications for students who
saved or applied to the institution.

```json
{
  "title": "Afati i aplikimit",
  "content": "Aplikimet janë të hapura deri më 30 qershor."
}
```

## 6. Applications

Only `Nxenes` can submit applications. `Shkolla` and `Admin` can list and
update application status.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/applications` | Admin, Shkolla | Filter by `institutionId`, `userId`, or `status` |
| `GET` | `/applications/mine` | Nxenes | Current student's applications |
| `GET` | `/applications/{id}` | Authenticated | Authorized application details |
| `POST` | `/applications` | Nxenes | Submit an application |
| `PATCH` | `/applications/{id}/status` | Admin, Shkolla | Set `pending`, `approved`, or `rejected` |

Submit:

```json
{
  "institutionId": 1,
  "fullName": "Arta Berisha",
  "email": "arta@example.com",
  "phone": "+38344111222",
  "educationLevel": "Shkolla e mesme",
  "selectedProgram": "Shkenca Kompjuterike",
  "message": "Dëshiroj të aplikoj.",
  "documentFileId": 4
}
```

The API ignores a client-supplied `userId` and always uses the authenticated
student. New applications use status `pending`.

Update status:

```json
{
  "status": "approved"
}
```

Status changes are persisted in SQL and published through Socket.IO.

## 7. Saved institutions

All endpoints require the `Nxenes` role. Institution and Admin accounts cannot
use the favorite-school functionality.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/savedinstitutions/mine` | Saved relationship records |
| `GET` | `/savedinstitutions/mine/institutions` | Saved institution DTOs |
| `POST` | `/savedinstitutions/save` | Save an institution |
| `DELETE` | `/savedinstitutions/unsave/{institutionId}` | Remove saved institution |

```json
{
  "institutionId": 1
}
```

Saving an already-saved institution is idempotent and returns the existing
record.

The inherited generic CRUD routes also appear in OpenAPI:

```text
GET    /savedinstitutions
GET    /savedinstitutions/{id}
POST   /savedinstitutions
PUT    /savedinstitutions/{id}
DELETE /savedinstitutions/{id}
```

Application code should prefer `/mine`, `/save`, and `/unsave` because those
routes derive the user from the JWT and express the intended student workflow.

## 8. Reviews

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/reviews` | Public |
| `GET` | `/reviews/{id}` | Public |
| `POST` | `/reviews` | Admin, Nxenes, Shkolla |
| `PUT` | `/reviews/{id}` | Admin, Shkolla |
| `DELETE` | `/reviews/{id}` | Admin |

The API uses the authenticated user as `userId` when creating a review.
Ratings must be between 1 and 5.

```json
{
  "institutionId": 1,
  "teachingQualityRating": 5,
  "facilitiesRating": 4,
  "difficultyRating": 3,
  "staffRating": 5,
  "comment": "Përvojë shumë e mirë."
}
```

## 9. Files

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/files/upload` | Authenticated | Upload a PDF |
| `GET` | `/files/mine` | Authenticated | Current user's files |
| `GET` | `/files` | Public | Generic file list |
| `GET` | `/files/{id}` | Public | Generic file record |
| `POST` | `/files` | Admin, Shkolla | Create generic file metadata |
| `PUT` | `/files/{id}` | Admin, Shkolla | Generic file update |
| `DELETE` | `/files/{id}` | Admin | Delete file record |

Upload requirements:

- Request type: `multipart/form-data`
- Field name: `file`
- Extension: `.pdf`
- Maximum size: 10 MB

PowerShell example:

```powershell
curl.exe -X POST "http://localhost:5056/api/files/upload" `
  -H "Authorization: Bearer ACCESS_TOKEN" `
  -F "file=@C:\Documents\application.pdf"
```

Uploaded files are stored under `wwwroot/uploads` and returned through a
public `/uploads/{generatedName}.pdf` URL.

## 10. Users and roles

### Users

All user-management endpoints require `Admin`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/users` | List users and roles |
| `GET` | `/users/{id}` | Get user |
| `POST` | `/users` | Create user |
| `PUT` | `/users/{id}` | Activate or deactivate user |
| `DELETE` | `/users/{id}` | Delete or deactivate user |

Users with related applications, reviews, or saved institutions are
deactivated instead of physically deleted. The seeded system accounts cannot
be deleted or deactivated, and an Admin cannot delete their own account.

Create:

```json
{
  "email": "new.user@example.com",
  "password": "User123!",
  "firstName": "New",
  "lastName": "User",
  "phoneNumber": "+38344123456",
  "isActive": true
}
```

Update:

```json
{
  "isActive": false
}
```

### Roles

All role endpoints require `Admin`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/roles` | List roles |
| `GET` | `/roles/{id}` | Get role |
| `POST` | `/roles` | Create role from `RoleDto` |
| `PUT` | `/roles/{id}` | Rename role |
| `DELETE` | `/roles/{id}` | Delete role |
| `POST` | `/roles/assign` | Assign role through MediatR command |
| `POST` | `/roles/create` | Create role through MediatR command |

Assign role:

```json
{
  "userId": "2",
  "role": "Nxenes"
}
```

## 11. Generic CRUD resources

These controllers inherit the standard CRUD behavior:

| Resource | Base endpoint |
| --- | --- |
| Institution types | `/institutiontypes` |
| Institution details | `/institutiondetails` |
| Recommendations | `/recommendations` |
| SQL notifications | `/notifications` |
| Settings | `/settings` |

Standard behavior:

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/{resource}` | Public |
| `GET` | `/{resource}/{id}` | Public |
| `POST` | `/{resource}` | Admin, Shkolla |
| `PUT` | `/{resource}/{id}` | Admin, Shkolla |
| `DELETE` | `/{resource}/{id}` | Admin |

Expanded resource paths shown by OpenAPI:

```text
/institutiontypes
/institutiontypes/{id}
/institutiondetails
/institutiondetails/{id}
/recommendations
/recommendations/{id}
/notifications
/notifications/{id}
/settings
/settings/{id}
```

Additional SQL notification endpoint:

```http
GET /api/notifications/mine
Authorization: Bearer ACCESS_TOKEN
```

## 12. Data management

All endpoints require `Admin`.

Supported entities:

```text
users
institutions
applications
programs
staff-facilities
```

Supported formats:

```text
csv
excel
json
```

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/data-management/export/{entity}?format={format}` | Download exported data |
| `POST` | `/data-management/import/{entity}?format={format}` | Import data file |

Import uses `multipart/form-data`, field name `file`, with a 20 MB request
limit.

## 13. MongoDB features

MongoDB database:

```text
EduKosNonRelational
```

Collections:

| Collection | Purpose |
| --- | --- |
| `logs` | API warnings and exceptions |
| `notifications` | Lightweight Mongo notification feature |
| `activity_history` | Write audit history, searches and institution views |

The Mongo audit middleware records authenticated `POST`, `PUT`, `PATCH`, and
`DELETE` requests. HTTP responses at status 400 or above are logged. Mongo
write failures are logged by the application but do not replace the primary
API response.

### Mongo endpoints

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/nosql/notifications?limit=30` | Authenticated, own notifications |
| `PATCH` | `/nosql/notifications/{objectId}/read` | Authenticated owner |
| `POST` | `/nosql/notifications` | Admin |
| `GET` | `/nosql/activity/mine?limit=30` | Authenticated |
| `GET` | `/nosql/activity?userId={id}&limit=50` | Admin |
| `GET` | `/nosql/logs?limit=50` | Admin |

Create Mongo notification:

```json
{
  "userId": 2,
  "title": "Njoftim",
  "message": "Mesazhi i njoftimit.",
  "type": "general"
}
```

Limits are clamped to a maximum of 100 records.

### Institution analytics

Public institution searches and full-detail views are stored in
`activity_history`. No IP address or request body is stored.

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/institution-analytics/{institutionId}?days=30` | Admin or owning Shkolla |
| `GET` | `/institution-analytics/searches?days=30` | Admin |

Institution analytics returns:

```json
{
  "institutionId": 1,
  "from": "2026-05-09T00:00:00Z",
  "totalViews": 42,
  "uniqueAuthenticatedUsers": 13,
  "dailyViews": [
    {
      "date": "2026-06-08",
      "views": 5
    }
  ]
}
```

Search analytics returns total searches and the five most common values for
name, city, category, and program. The `days` parameter is clamped between 1
and 365.

## 14. RTC REST API

RTC data is persisted in SQL Server. Socket.IO is used only to deliver events
live after the .NET API validates permissions and saves the data.

Communication rules:

- `Nxenes` can open conversations with institutions.
- `Shkolla` can reply to conversations associated with its institution.
- `Shkolla` can open a conversation with Admin.
- Admin can reply to institution conversations.
- User-to-user chat is not supported.
- Guests cannot use RTC.

### Conversations

| Method | Endpoint | Access |
| --- | --- | --- |
| `POST` | `/rtc/conversations` | Nxenes |
| `POST` | `/rtc/conversations/admin` | Shkolla |
| `GET` | `/rtc/conversations` | Authenticated |
| `GET` | `/rtc/conversations/{conversationId}/messages` | Participant |
| `POST` | `/rtc/conversations/{conversationId}/messages` | Participant |
| `GET` | `/rtc/conversations/{conversationId}/access` | Participant |

Open institution conversation:

```json
{
  "institutionId": 1
}
```

Send message:

```json
{
  "body": "Përshëndetje, kam një pyetje për programin."
}
```

### RTC notifications

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/rtc/notifications` | Authenticated |
| `PATCH` | `/rtc/notifications/{id}/read` | Notification owner |

Notification types:

```text
conversation_message
institution_message
new_application
application_status
institution_registration
institution_announcement
```

## 15. Socket.IO events

Connect to:

```text
http://localhost:5060
```

Pass the JWT access token in Socket.IO authentication:

```ts
const socket = io("http://localhost:5060", {
  auth: {
    token: accessToken,
  },
});
```

Client-to-server events:

| Event | Payload |
| --- | --- |
| `rtc:join_conversation` | `{ conversationId: number }` |
| `rtc:send_message` | `{ conversationId: number, body: string }` |
| `rtc:notification_read` | `{ notificationId: number }` |

Server-to-client events:

| Event | Purpose |
| --- | --- |
| `rtc:receive_message` | New persisted message |
| `rtc:application_status_updated` | Application status changed |
| `rtc:admin_alert` | New Admin-facing alert |
| `rtc:institution_alert` | New institution-facing alert |
| `rtc:notification_created` | New persisted real-time notification |
| `rtc:notification_read` | Notification read state changed |

Each authenticated socket automatically joins:

```text
user:{userId}
```

The server validates conversation access before joining a conversation room or
persisting a message.

## 16. AI recommendation

```http
POST /api/ai-recommendation/best-match
```

This endpoint is public and requires an `OpenAI:ApiKey` configuration value.
At least two institutions must be supplied.

```json
{
  "institutions": [
    {
      "name": "Institution A",
      "city": "Prishtine",
      "description": "Description A",
      "institutionTypeName": "Fakultete"
    },
    {
      "name": "Institution B",
      "city": "Prizren",
      "description": "Description B",
      "institutionTypeName": "Fakultete"
    }
  ],
  "preferences": {
    "city": "Prishtine",
    "budget": "2000 EUR",
    "priority": "Programet",
    "interests": "Teknologji"
  }
}
```

## 17. Postman workflow

1. Create an environment variable named `baseUrl` with value
   `http://localhost:5056/api`.
2. Send `POST {{baseUrl}}/auth/login`.
3. Save `accessToken` and `refreshToken` from the response.
4. Add `Authorization: Bearer {{accessToken}}` to protected requests.
5. When a request returns `401` because the access token expired, call
   `POST {{baseUrl}}/auth/refresh`.
6. Replace both stored tokens with the rotated response values.
7. Call logout when testing is complete.

Postman test script for login:

```js
const body = pm.response.json();
pm.environment.set("accessToken", body.accessToken);
pm.environment.set("refreshToken", body.refreshToken);
```

## 18. Storage responsibilities

| Storage | Data |
| --- | --- |
| SQL Server | Users, roles, refresh tokens, institutions, applications, files, reviews, favorites, RTC conversations, messages and real-time notifications |
| MongoDB | Logs, lightweight Mongo notifications, audit activity, institution searches and profile-view analytics |
| File system | Uploaded PDF files under `wwwroot/uploads` |
| Socket.IO | Live delivery only; it is not the source of truth |

## 19. Security notes

- Do not commit production JWT keys, database passwords or OpenAI keys.
- Use environment variables or user secrets outside local development.
- The backend is the final authorization boundary. Hiding a frontend button is
  not considered sufficient authorization.
- Refresh tokens are persisted and revoked server-side.
- File uploads accept only PDF extensions and are limited to 10 MB.
- Institution analytics does not store IP addresses or request bodies.
