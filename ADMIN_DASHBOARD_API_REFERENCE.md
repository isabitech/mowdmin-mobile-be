# Mowdmin Mobile BE — Admin Dashboard API Reference

> **Base URL:** `https://<host>/api/v1`
>
> **Response Format (all endpoints unless noted):**
> ```json
> {
>   "status": "success",
>   "message": "...",
>   "data": { ... }
> }
> ```
> **Error Format:**
> ```json
> {
>   "status": "error",
>   "message": "..."
> }
> ```
> **Validation Error Format:**
> ```json
> {
>   "status": "error",
>   "message": "Validation failed",
>   "errors": [{ "field": "...", "message": "..." }]
> }
> ```

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Profile](#2-profile)
3. [Events](#3-events)
4. [Event Registration](#4-event-registration)
5. [Media](#5-media)
6. [Media Categories](#6-media-categories)
7. [Media Bookmarks](#7-media-bookmarks)
8. [Prayers](#8-prayers)
9. [Prayer Requests](#9-prayer-requests)
10. [Prayer Likes](#10-prayer-likes)
11. [Prayer Comments](#11-prayer-comments)
12. [Groups](#12-groups)
13. [Orders](#13-orders)
14. [Order Items](#14-order-items)
15. [Products](#15-products)
16. [Payments](#16-payments)
17. [Donations](#17-donations)
18. [Campaigns](#18-campaigns)
19. [Notifications](#19-notifications)
20. [Memberships](#20-memberships)
21. [Ministries](#21-ministries)
22. [Bible Stories](#22-bible-stories)
23. [Bible Verses](#23-bible-verses)
24. [Info](#24-info)
25. [Health Check](#25-health-check)

---

## Authentication Header

All protected endpoints require:

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <jwt_token>` |
| `Content-Type`  | `application/json`  |

**Admin endpoints** additionally require the authenticated user to have `isAdmin: true`.

---

## 1. Authentication

Base path: `/api/v1/auth`

### 1.1 Register

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/auth/register` |
| **Auth** | None |
| **Rate Limit** | None |

**Request Body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `name` | string | Yes | min 2 chars |
| `email` | string | Yes | valid email, must be unique |
| `password` | string | Yes | min 6 chars, must include uppercase, lowercase, number, special char |

**Success Response (201):**
```json
{
  "status": "success",
  "message": "User Registered Successfully. Check your email for verification OTP.",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "emailVerified": false,
      "isAdmin": false,
      "createdAt": "...",
      "updatedAt": "..."
    },
    "accessToken": "jwt...",
    "refreshToken": "jwt..."
  }
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | Validation errors (name/email/password) |
| 409 | Email already exists |

---

### 1.2 Login

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/auth/login` |
| **Auth** | None |
| **Rate Limit** | `authLimiter` |

**Request Body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `email` | string | Yes | valid email |
| `password` | string | Yes | required |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Login Successful",
  "data": {
    "user": { "_id": "...", "name": "...", "email": "...", "isAdmin": false },
    "accessToken": "jwt...",
    "refreshToken": "jwt..."
  }
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | Validation errors |
| 401 | Invalid credentials |
| 403 | Email not verified |

---

### 1.3 Logout

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/auth/logout` |
| **Auth** | `protectUser` |

**Request Body:** None (uses token from Authorization header)

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Logged Out Successfully"
}
```

---

### 1.4 Refresh Token

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/auth/refresh` |
| **Auth** | None |
| **Rate Limit** | `authLimiter` |

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `refreshToken` | string | Yes |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Token Refreshed Successfully",
  "data": {
    "accessToken": "jwt...",
    "refreshToken": "jwt..."
  }
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 401 | Invalid or expired refresh token |

---

### 1.5 Forgot Password

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/auth/forgot-password` |
| **Auth** | None |
| **Rate Limit** | `passwordResetLimiter` |

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `email` | string | Yes |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "OTP sent to your email"
}
```

---

### 1.6 Reset Password

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/auth/reset-password` |
| **Auth** | None |
| **Rate Limit** | `otpLimiter` |

**Request Body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `email` | string | Yes | valid email |
| `otp` | string | Yes | exactly 4 digits |
| `newPassword` | string | Yes | min 6 chars, complexity required |
| `confirmPassword` | string | Yes | must match `newPassword` |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Password Reset Successfully"
}
```

---

### 1.7 Change Password

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/auth/change-password` |
| **Auth** | `protectUser` |

**Request Body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `email` | string | Yes | valid email |
| `currentPassword` | string | Yes | required |
| `newPassword` | string | Yes | min 6 chars, complexity required |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Password Changed Successfully"
}
```

---

### 1.8 Verify Email / Verify OTP

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/auth/verify-otp` or `/auth/verify-email` |
| **Auth** | None |
| **Rate Limit** | `otpLimiter` |

**Request Body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `email` | string | Yes | valid email |
| `otp` | string | Yes | exactly 4 digits |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Email Verified Successfully"
}
```

---

### 1.9 Resend OTP

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/auth/resend-otp` |
| **Auth** | None |
| **Rate Limit** | `passwordResetLimiter` |

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `email` | string | Yes |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "OTP sent to email"
}
```

---

### 1.10 Google Auth

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/auth/google` |
| **Auth** | None |
| **Rate Limit** | `authLimiter` |

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `idToken` | string | Yes |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Google Auth Success",
  "data": {
    "user": { ... },
    "accessToken": "jwt...",
    "refreshToken": "jwt..."
  }
}
```

---

### 1.11 Apple Auth

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/auth/apple` |
| **Auth** | None |
| **Rate Limit** | `authLimiter` |

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `idToken` | string | Yes |
| `name` | string | No |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Apple Auth Success",
  "data": {
    "user": { ... },
    "accessToken": "jwt...",
    "refreshToken": "jwt..."
  }
}
```

---

### 1.12 Get Auth Profile

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/auth/profile` |
| **Auth** | `protectUser` |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Profile fetched successfully",
  "data": {
    "_id": "...",
    "name": "...",
    "email": "...",
    "isAdmin": false,
    "emailVerified": true,
    "createdAt": "..."
  }
}
```

---

### 1.13 Create/Update Auth Profile

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/auth/profile` |
| **Auth** | `protectUser` |
| **Content-Type** | `multipart/form-data` (if uploading photo) |

**Request Body (form-data):**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `displayName` | string | No | 2-100 chars |
| `bio` | string | No | max 500 chars |
| `location` | string | No | max 100 chars |
| `phone_number` | string | No | valid phone format |
| `birthdate` | string | No | ISO 8601 date, age 13-120 |
| `photo` | file | No | image, max 5MB |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Profile updated",
  "data": { ... }
}
```

---

### 1.14 Delete Auth Profile

| | |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/auth/profile` |
| **Auth** | `protectUser` |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Profile deleted",
  "data": {}
}
```

---

### 1.15 Admin: Get All Users

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/auth/admin/users` |
| **Auth** | `protectUser` + `protectAdmin` |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "All users fetched",
  "data": [
    {
      "_id": "...",
      "name": "...",
      "email": "...",
      "isAdmin": false,
      "emailVerified": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

### 1.16 Admin: Get User By ID

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/auth/admin/users/:userId` |
| **Auth** | `protectUser` + `protectAdmin` |

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `userId` | string | User ObjectId |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "User fetched",
  "data": { "_id": "...", "name": "...", "email": "...", ... }
}
```

| Status | Message |
|--------|---------|
| 404 | User not found |

---

### 1.17 Admin: Update User

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/auth/admin/users/:userId` |
| **Auth** | `protectUser` + `protectAdmin` |

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `userId` | string | User ObjectId |

**Request Body:** Any user fields to update (e.g., `name`, `email`).

**Success Response (200):**
```json
{
  "status": "success",
  "message": "User updated",
  "data": { ... }
}
```

---

### 1.18 Admin: Toggle Admin Status

| | |
|---|---|
| **Method** | `PATCH` |
| **Path** | `/auth/admin/users/:userId/promote` |
| **Auth** | `protectUser` + `protectAdmin` |

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `userId` | string | User ObjectId |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Admin status toggled",
  "data": { "_id": "...", "isAdmin": true }
}
```

---

### 1.19 Admin: Trigger OTP for User

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/auth/admin/users/:userId/otp` |
| **Auth** | `protectUser` + `protectAdmin` |

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `userId` | string | User ObjectId |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "OTP triggered for user"
}
```

---

## 2. Profile

Base path: `/api/v1/profile`

### 2.1 Get Profile

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/profile` |
| **Auth** | `protectUser` |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "...",
    "userId": "...",
    "displayName": "John",
    "photoUrl": "https://...",
    "bio": "Hello world",
    "location": "NYC",
    "phone_number": "+1234567890",
    "birthdate": "1990-01-15T00:00:00.000Z",
    "language": "EN",
    "notificationPreferences": {},
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

| Status | Message |
|--------|---------|
| 404 | Profile not found |

---

### 2.2 Update Profile

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/profile` |
| **Auth** | `protectUser` |
| **Content-Type** | `multipart/form-data` |

**Request Body (form-data):**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `displayName` | string | No | 2-100 chars |
| `bio` | string | No | max 500 chars |
| `location` | string | No | max 100 chars |
| `phoneNumber` or `phone_number` | string | No | valid phone |
| `birthdate` | string | No | ISO 8601 date |
| `photo` | file | No | image, max 5MB |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": { ... }
}
```

---

## 3. Events

Base path: `/api/v1/event` (alias: `/api/v1/events`)

### 3.1 Create Event

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/event/create` or `/event/` |
| **Auth** | `protectUser` + `protectAdmin` |
| **Content-Type** | `multipart/form-data` |

**Request Body (form-data):**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `title` | string | Yes | required |
| `date` | string | Yes | ISO 8601 (`YYYY-MM-DD`) |
| `time` | string | Yes | `HH:mm` format |
| `location` | string | Yes | required |
| `description` | string | No | string |
| `type` | string | Yes | one of: `Crusade`, `Baptism`, `Communion`, `Concert`, `Seminar`, `Online`, `Tour`, `Convention`, `Conference`, `Symposium` |
| `image` | file | No | image, max 5MB |

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Event Created Successfully",
  "data": {
    "_id": "...",
    "title": "Sunday Service",
    "date": "2025-03-15T00:00:00.000Z",
    "time": "10:00",
    "location": "Main Hall",
    "description": "...",
    "image": "https://res.cloudinary.com/...",
    "type": "Crusade",
    "registrations": [],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### 3.2 Get All Events

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/event/` |
| **Auth** | `protectUser` |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Events Fetched Successfully",
  "data": [ { ... }, { ... } ]
}
```

---

### 3.3 Get Single Event

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/event/:id` |
| **Auth** | `protectUser` |

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | string | Event ObjectId |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Event Fetched Successfully",
  "data": { "_id": "...", "title": "...", ... }
}
```

| Status | Message |
|--------|---------|
| 404 | Event Not Found |

---

### 3.4 Update Event

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/event/:id` |
| **Auth** | `protectUser` + `protectAdmin` |
| **Content-Type** | `multipart/form-data` |

**Path Parameters:**

| Param | Type |
|-------|------|
| `id` | string |

**Request Body:** Same fields as create, all optional.

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Event Updated Successfully",
  "data": { ... }
}
```

---

### 3.5 Delete Event

| | |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/event/:id` |
| **Auth** | `protectUser` + `protectAdmin` |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Event Deleted Successfully",
  "data": {}
}
```

---

## 4. Event Registration

Base path: `/api/v1/event-registration`

### 4.1 Register for Event

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/event-registration/register` |
| **Auth** | `protectUser` |

**Request Body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `eventId` | string | Yes | valid Event ObjectId |
| `status` | string | No | `registered` or `attended` (default: `registered`) |

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Registered Successfully",
  "data": {
    "_id": "...",
    "eventId": "...",
    "userId": "...",
    "status": "registered",
    "createdAt": "..."
  }
}
```

| Status | Message |
|--------|---------|
| 409 | User already registered for this event |

---

### 4.2 Unregister from Event

| | |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/event-registration/unregister/:eventId` |
| **Auth** | `protectUser` |

**Path Parameters:**

| Param | Type |
|-------|------|
| `eventId` | string |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Unregistered Successfully",
  "data": {}
}
```

---

### 4.3 Get All Registrations (Admin)

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/event-registration/` |
| **Auth** | `protectUser` + `protectAdmin` |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "All Registrations Fetched",
  "data": [ { ... } ]
}
```

---

### 4.4 Get Registrations by Event

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/event-registration/event/:eventId` |
| **Auth** | `protectUser` |

**Path Parameters:**

| Param | Type |
|-------|------|
| `eventId` | string |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Registrations Fetched",
  "data": [ { ... } ]
}
```

---

### 4.5 Get My Registrations

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/event-registration/user` |
| **Auth** | `protectUser` |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "User Registrations",
  "data": [ { ... } ]
}
```

---

### 4.6 Get Registration by ID

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/event-registration/:id` |
| **Auth** | `protectUser` |

| Status | Message |
|--------|---------|
| 404 | Registration not found |

---

### 4.7 Update Registration

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/event-registration/:id` |
| **Auth** | `protectUser` |

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `status` | string | No |

---

### 4.8 Delete Registration (Admin)

| | |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/event-registration/:id` |
| **Auth** | `protectUser` + `protectAdmin` |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Registration Deleted",
  "data": {}
}
```

---

## 5. Media

Base path: `/api/v1/media` (alias: `/api/v1/videos`)

### 5.1 Create Media (Admin)

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/media/create` |
| **Auth** | `protectUser` + `protectAdmin` |
| **Content-Type** | `multipart/form-data` |

**Request Body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `title` | string | Yes | 2-255 chars |
| `description` | string | No | |
| `category_id` | string | Yes | valid MediaCategory ObjectId |
| `type` | string | Yes | `audio`, `video`, or `text` |
| `media_url` | string | No | valid URI |
| `author` | string | No | |
| `duration` | string | No | |
| `is_downloadable` | boolean | No | default: `true` |
| `language` | string | No | |
| `thumbnail` | file | No | image file, max 5MB |
| `youtubeLiveLink` | string | No | valid URI |
| `isLive` | boolean | No | default: `false` |

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Media Created Successfully",
  "data": {
    "_id": "...",
    "title": "Morning Sermon",
    "type": "video",
    "media_url": "https://...",
    "thumbnail": "https://res.cloudinary.com/...",
    "category_id": "...",
    "createdAt": "..."
  }
}
```

---

### 5.2 Get All Media

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/media/` |
| **Auth** | `protectUser` |

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | No | Page number for pagination |
| `limit` | number | No | Items per page |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Media Retrieved Successfully",
  "data": [ { ... } ]
}
```

---

### 5.3 Get Single Media

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/media/:id` |
| **Auth** | `protectUser` |

| Status | Message |
|--------|---------|
| 404 | Media Not Found |

---

### 5.4 Update Media (Admin)

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/media/:id` |
| **Auth** | `protectUser` + `protectAdmin` |
| **Content-Type** | `multipart/form-data` |

**Request Body:** Same as create, all fields optional.

---

### 5.5 Delete Media (Admin)

| | |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/media/:id` |
| **Auth** | `protectUser` + `protectAdmin` |

---

## 6. Media Categories

Base path: `/api/v1/media-category`

> All endpoints require **Admin** access.

### 6.1 Create Category

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/media-category/create` |
| **Auth** | `protectUser` + `protectAdmin` |

**Request Body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `name` | string | Yes | 2-255 chars, unique |
| `description` | string | No | |

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Media Category Created Successfully",
  "data": {
    "_id": "...",
    "name": "Sermons",
    "description": "Weekly sermons"
  }
}
```

---

### 6.2 Get All Categories

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/media-category/` |
| **Auth** | `protectUser` + `protectAdmin` |

---

### 6.3 Get Single Category

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/media-category/:id` |
| **Auth** | `protectUser` + `protectAdmin` |

---

### 6.4 Update Category

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/media-category/:id` |
| **Auth** | `protectUser` + `protectAdmin` |

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `name` | string | No |
| `description` | string | No |

---

### 6.5 Delete Category

| | |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/media-category/:id` |
| **Auth** | `protectUser` + `protectAdmin` |

---

## 7. Media Bookmarks

Base path: `/api/v1/media-bookmark`

### 7.1 Create Bookmark

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/media-bookmark/create` |
| **Auth** | `protectUser` |

**Request Body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `mediaId` | string | Yes | valid Media ObjectId |
| `note` | string | No | |

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Media Bookmark Created Successfully",
  "data": {
    "_id": "...",
    "userId": "...",
    "mediaId": "...",
    "note": "..."
  }
}
```

---

### 7.2 Get All Bookmarks

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/media-bookmark/` |
| **Auth** | `protectUser` |

---

### 7.3 Get Bookmarks by User

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/media-bookmark/user/:userId` |
| **Auth** | `protectUser` |

---

### 7.4 Get Single Bookmark

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/media-bookmark/:id` |
| **Auth** | `protectUser` |

---

### 7.5 Update Bookmark

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/media-bookmark/:id` |
| **Auth** | `protectUser` |

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `mediaId` | string | No |
| `note` | string | No |

---

### 7.6 Delete Bookmark

| | |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/media-bookmark/:id` |
| **Auth** | `protectUser` |

---

## 8. Prayers

Base path: `/api/v1/prayer`

### 8.1 Create Prayer (Admin)

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/prayer/create` |
| **Auth** | `protectUser` + `protectAdmin` |

**Request Body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `prayer_request_id` | string | Yes | valid PrayerRequest ObjectId |
| `title` | string | Yes | |
| `description` | string | Yes | |
| `images` | string[] | No | array of URLs |
| `isPublic` | boolean | No | default: `true` |

> Note: `userId` is auto-injected from the authenticated user.

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Prayer Created Successfully",
  "data": {
    "_id": "...",
    "userId": "...",
    "title": "...",
    "description": "...",
    "isPublic": true,
    "likeCount": 0,
    "commentCount": 0
  }
}
```

---

### 8.2 Get All Prayers

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/prayer/` |
| **Auth** | `protectUser` |

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | No | Page number |
| `limit` | number | No | Items per page |

> Admins see all prayers. Non-admins see only public prayers + their own.

---

### 8.3 Get My Prayers

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/prayer/user` |
| **Auth** | `protectUser` |

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | No | Page number |
| `limit` | number | No | Items per page |

---

### 8.4 Get Single Prayer

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/prayer/:id` |
| **Auth** | `protectUser` |

| Status | Message |
|--------|---------|
| 400 | Invalid Prayer ID format |
| 404 | Prayer Not Found |

---

### 8.5 Update Prayer (Admin)

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/prayer/:id` |
| **Auth** | `protectUser` + `protectAdmin` |

**Request Body:** Any prayer fields to update.

---

### 8.6 Delete Prayer (Admin)

| | |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/prayer/:id` |
| **Auth** | `protectUser` + `protectAdmin` |

---

### 8.7 Attach Prayer Request to Prayer Wall (Admin)

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/prayer/attach-request/:requestId` |
| **Auth** | `protectUser` + `protectAdmin` |

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `requestId` | string | PrayerRequest ObjectId |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Prayer published from request",
  "data": { ... }
}
```

---

## 9. Prayer Requests

Base path: `/api/v1/prayer-request`

### 9.1 Create Prayer Request

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/prayer-request/create` |
| **Auth** | `protectUser` |

**Request Body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `title` | string | Yes | 2-255 chars |
| `description` | string | Yes | |
| `images` | string[] | No | array of valid URIs |
| `isPublic` | boolean | No | default: `false` |

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Prayer Request Created Successfully",
  "data": {
    "_id": "...",
    "userId": "...",
    "title": "...",
    "description": "...",
    "isPublic": false
  }
}
```

---

### 9.2 Get All Prayer Requests (Admin)

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/prayer-request/` |
| **Auth** | `protectUser` + `protectAdmin` |

---

### 9.3 Get My Prayer Requests

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/prayer-request/user` |
| **Auth** | `protectUser` |

---

### 9.4 Get Single Prayer Request

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/prayer-request/:id` |
| **Auth** | `protectUser` |

---

### 9.5 Update Prayer Request

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/prayer-request/:id` |
| **Auth** | `protectUser` + `checkOwnership('PrayerRequest')` |

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `title` | string | No |
| `description` | string | No |
| `images` | string[] | No |
| `isPublic` | boolean | No |

---

### 9.6 Delete Prayer Request

| | |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/prayer-request/:id` |
| **Auth** | `protectUser` + `checkOwnership('PrayerRequest')` |

> Owner or admin can delete.

---

## 10. Prayer Likes

Base path: `/api/v1/prayer-like`

### 10.1 Like Prayer (Toggle)

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/prayer-like/:id/like` |
| **Auth** | `protectUser` |

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | string | Prayer ObjectId |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Prayer Liked",
  "data": { "liked": true }
}
```

---

### 10.2 Get My Likes

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/prayer-like/my-likes` |
| **Auth** | `protectUser` |

**Query Parameters:**

| Param | Type | Default |
|-------|------|---------|
| `limit` | number | 20 |
| `offset` | number | 0 |

---

### 10.3 Unlike Prayer

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/prayer-like/:id/unlike` |
| **Auth** | `protectUser` |

---

## 11. Prayer Comments

Base path: `/api/v1/prayer-comment`

### 11.1 Add Comment

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/prayer-comment/:id/comment` |
| **Auth** | `protectUser` |

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | string | Prayer ObjectId |

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `comment` | string | Yes |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Comment Added",
  "data": {
    "_id": "...",
    "prayerId": "...",
    "userId": "...",
    "comment": "Amen!"
  }
}
```

---

### 11.2 Get Comments by Prayer

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/prayer-comment/:id/comments` |
| **Auth** | `protectUser` |

**Query Parameters:**

| Param | Type | Default |
|-------|------|---------|
| `limit` | number | 10 |
| `offset` | number | 0 |

---

### 11.3 Delete Comment

| | |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/prayer-comment/comment/:commentId` |
| **Auth** | `protectUser` |

> Only comment owner can delete.

| Status | Message |
|--------|---------|
| 403 | Unauthorized to delete this comment |
| 404 | Comment not found |

---

## 12. Groups

Base path: `/api/v1/groups`

### 12.1 Create Group

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/groups/create` |
| **Auth** | `protectUser` |

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `name` | string | Yes |
| `description` | string | No |
| `image` | string | No |
| `isPrivate` | boolean | No |

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Group created successfully",
  "data": {
    "_id": "...",
    "name": "Youth Ministry",
    "description": "...",
    "creatorId": "...",
    "isPrivate": false,
    "memberCount": 1
  }
}
```

---

### 12.2 Get My Groups

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/groups/me` |
| **Auth** | `protectUser` |

---

### 12.3 Discover Groups

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/groups/discover` |
| **Auth** | `protectUser` |

> Returns groups the user is not a member of (excluding private groups).

---

### 12.4 Get Group Details

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/groups/:id` |
| **Auth** | `protectUser` |

---

### 12.5 Join Group

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/groups/:id/join` |
| **Auth** | `protectUser` |

| Status | Message |
|--------|---------|
| 400 | Already a member |

---

### 12.6 Leave Group

| | |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/groups/:id/leave` |
| **Auth** | `protectUser` |

---

### 12.7 Get Group Messages

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/groups/:id/messages` |
| **Auth** | `protectUser` |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 50 | Max messages |
| `before` | string | - | Cursor: messages before this timestamp |

---

### 12.8 Send Message

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/groups/:id/messages` |
| **Auth** | `protectUser` |

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `content` | string | Yes |

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Message sent",
  "data": {
    "_id": "...",
    "groupId": "...",
    "senderId": "...",
    "content": "Hello everyone!",
    "type": "text"
  }
}
```

| Status | Message |
|--------|---------|
| 403 | You are not a member of this group |

---

### 12.9 Admin Delete Group

| | |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/groups/:id/admin-delete` |
| **Auth** | `protectUser` + `protectAdmin` |

---

## 13. Orders

Base path: `/api/v1/orders`

### 13.1 Create Order

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/orders/create` |
| **Auth** | `protectUser` |

**Request Body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `items` | array | Yes | min 1 item |
| `items[].productId` | string | Yes | valid Product ObjectId |
| `items[].quantity` | number | Yes | integer, min 1 |
| `totalAmount` | number | Yes | min 0 |

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Order Created Successfully",
  "data": {
    "_id": "...",
    "userId": "...",
    "totalAmount": "25.00",
    "status": "pending",
    "items": ["..."],
    "createdAt": "..."
  }
}
```

---

### 13.2 Get All Orders (Admin)

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/orders/` |
| **Auth** | `protectUser` + `protectAdmin` |

---

### 13.3 Get My Orders

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/orders/user` |
| **Auth** | `protectUser` |

---

### 13.4 Get Single Order

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/orders/:id` |
| **Auth** | `protectUser` + `checkOwnership('Order')` |

---

### 13.5 Update Order (Admin)

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/orders/:id` |
| **Auth** | `protectUser` + `protectAdmin` |

**Request Body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `totalAmount` | number | No | min 0 |
| `status` | string | No | `pending`, `paid`, `cancelled`, `shipped`, `completed` |
| `paymentMethod` | string | No | |
| `shippingAddress` | string | No | |
| `notes` | string | No | |

---

### 13.6 Delete Order (Admin)

| | |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/orders/:id` |
| **Auth** | `protectUser` + `protectAdmin` |

---

### 13.7 Pay for Order

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/orders/:id/pay` |
| **Auth** | `protectUser` + `checkOwnership('Order')` |

**Request Body:** None (uses order amount).

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Payment initiated",
  "data": {
    "clientSecret": "pi_..._secret_...",
    "paymentIntentId": "pi_...",
    "amount": 2500,
    "currency": "usd"
  }
}
```

---

### 13.8 Cancel Order (Admin)

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/orders/:id/cancel` |
| **Auth** | `protectUser` + `protectAdmin` |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Order Cancelled Successfully",
  "data": { ... }
}
```

---

## 14. Order Items

Base path: `/api/v1/order-item`

### 14.1 Create Order Item (Admin)

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/order-item/create` |
| **Auth** | `protectUser` + `protectAdmin` |

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `orderId` | string | Yes |
| `productId` | string | Yes |
| `quantity` | number | Yes |
| `unit_price` | number | No |
| `subtotal` | number | No |

---

### 14.2 Get All Order Items (Admin)

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/order-item/` |
| **Auth** | `protectUser` + `protectAdmin` |

---

### 14.3 Get Items by Order

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/order-item/order/:orderId` |
| **Auth** | `protectUser` |

---

### 14.4 Get Single Item

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/order-item/:id` |
| **Auth** | `protectUser` |

---

### 14.5 Update Item (Admin)

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/order-item/:id` |
| **Auth** | `protectUser` + `protectAdmin` |

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `quantity` | number | No |
| `unit_price` | number | No |
| `subtotal` | number | No |

---

### 14.6 Delete Item (Admin)

| | |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/order-item/:id` |
| **Auth** | `protectUser` + `protectAdmin` |

---

## 15. Products

Base path: `/api/v1/product`

### 15.1 Create Product (Admin)

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/product/create` |
| **Auth** | `protectUser` + `protectAdmin` |

**Request Body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `name` | string | Yes | 2-255 chars |
| `price` | number | Yes | min 0 |
| `description` | string | No | |
| `categoryId` | string | Yes | category name string |
| `imageUrl` | string | No | valid URI |
| `stock` | number | No | integer, min 0, default: 0 |

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Product Created Successfully",
  "data": {
    "_id": "...",
    "name": "Bible Study Guide",
    "price": "15.99",
    "description": "...",
    "category": "Books",
    "imageUrl": "https://...",
    "stock": 100
  }
}
```

---

### 15.2 Get All Products

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/product/` |
| **Auth** | `protectUser` |

---

### 15.3 Get Products by Category

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/product/category/:categoryId` |
| **Auth** | `protectUser` |

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `categoryId` | string | Category name string (e.g., `Books`) |

---

### 15.4 Get Single Product

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/product/:id` |
| **Auth** | `protectUser` |

---

### 15.5 Update Product (Admin)

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/product/:id` |
| **Auth** | `protectUser` + `protectAdmin` |

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `name` | string | No |
| `price` | number | No |
| `description` | string | No |
| `categoryId` | string | No |
| `category` | string | No |
| `imageUrl` | string | No |
| `stock` | number | No |

---

### 15.6 Delete Product (Admin)

| | |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/product/:id` |
| **Auth** | `protectUser` + `protectAdmin` |

---

## 16. Payments

Base path: `/api/v1/payment`

### 16.1 Stripe Webhook

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/payment/webhooks/stripe` |
| **Auth** | None (verified via Stripe signature) |
| **Content-Type** | `application/json` (raw body) |

> **Note:** This endpoint is mounted _before_ the global JSON body parser. Stripe sends events here with a signature header `stripe-signature`.

**Response:** `200 { received: true }` or `400` on signature failure.

---

### 16.2 Create Payment Intent

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/payment/` |
| **Auth** | `protectUser` |

**Request Body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `amount` | number | Yes | in smallest currency unit (e.g., cents) |
| `type` | string | Yes | `order`, `donation`, or `subscription` |
| `metadata` | object | No | pass-through metadata |

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Payment Intent Created",
  "data": {
    "clientSecret": "pi_..._secret_...",
    "paymentIntentId": "pi_...",
    "transactionRef": "...",
    "amount": 5000,
    "currency": "usd"
  }
}
```

---

### 16.3 Get All Payments (Admin)

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/payment/` |
| **Auth** | `protectUser` + `protectAdmin` |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Payments Fetched Successfully",
  "data": [
    {
      "_id": "...",
      "userId": "...",
      "type": "order",
      "amount": "50.00",
      "currency": "USD",
      "status": "success",
      "transactionRef": "...",
      "paymentIntentId": "pi_...",
      "method": "stripe",
      "createdAt": "..."
    }
  ]
}
```

---

### 16.4 Get Single Payment

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/payment/:id` |
| **Auth** | `protectUser` |

---

### 16.5 Update Payment Status (Admin)

| | |
|---|---|
| **Method** | `PATCH` |
| **Path** | `/payment/:id/status` |
| **Auth** | `protectUser` + `protectAdmin` |

**Request Body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `status` | string | Yes | `pending`, `success`, `failed`, `refunded` |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Payment Status Updated Successfully",
  "data": { ... }
}
```

---

## 17. Donations

Base path: `/api/v1/donation`

### 17.1 Create Donation

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/donation/` |
| **Auth** | `protectUser` |

**Request Body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `campaign` | string | Yes | Campaign ObjectId |
| `amount` | number | Yes | min 0.01 |
| `currency` | string | No | 3-letter code, default: `USD` |

> `userId` and `transactionRef` are auto-generated.

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Donation Created Successfully",
  "data": {
    "_id": "...",
    "userId": "...",
    "campaign": "...",
    "amount": "100.00",
    "currency": "USD",
    "transactionRef": "DON-...",
    "status": "pending"
  }
}
```

---

### 17.2 Get All Donations (Admin)

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/donation/` |
| **Auth** | `protectUser` + `protectAdmin` |

---

### 17.3 Get Single Donation

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/donation/:id` |
| **Auth** | `protectUser` |

---

### 17.4 Pay for Donation

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/donation/:id/pay` |
| **Auth** | `protectUser` |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Payment initiated for donation",
  "data": {
    "clientSecret": "pi_..._secret_...",
    "paymentIntentId": "pi_...",
    "amount": 10000,
    "currency": "usd"
  }
}
```

---

### 17.5 Update Donation Status (Admin)

| | |
|---|---|
| **Method** | `PATCH` |
| **Path** | `/donation/:id/status` |
| **Auth** | `protectUser` + `protectAdmin` |

**Request Body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `status` | string | Yes | `pending`, `success`, `failed`, `refunded` |

---

### 17.6 Get Donations by Campaign

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/donation/campaign/:campaignId` |
| **Auth** | `protectUser` |

---

## 18. Campaigns

Base path: `/api/v1/campaigns`

### 18.1 Get All Campaigns (Public)

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/campaigns/` |
| **Auth** | None |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "All Campaigns Fetched",
  "data": [
    {
      "_id": "...",
      "title": "Building Fund",
      "description": "...",
      "goalAmount": 50000,
      "totalRaised": 12500,
      "isActive": true,
      "createdAt": "..."
    }
  ]
}
```

---

### 18.2 Get Single Campaign (Public)

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/campaigns/:id` |
| **Auth** | None |

---

### 18.3 Create Campaign (Admin)

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/campaigns/` |
| **Auth** | `protectUser` + `protectAdmin` |

**Request Body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `title` | string | Yes | trimmed |
| `description` | string | No | trimmed |
| `goalAmount` | number | Yes | min 0 |
| `isActive` | boolean | No | default: `true` |

---

### 18.4 Update Campaign (Admin)

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/campaigns/:id` |
| **Auth** | `protectUser` + `protectAdmin` |

**Request Body:** Same as create, all optional.

---

### 18.5 Delete Campaign (Admin)

| | |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/campaigns/:id` |
| **Auth** | `protectUser` + `protectAdmin` |

---

## 19. Notifications

Base path: `/api/v1/notifications`

### 19.1 Create Notification

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/notifications/create` |
| **Auth** | `protectUser` |

**Request Body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `title` | string | Yes | 2-255 chars |
| `message` | string | Yes | min 1 char |
| `type` | string | No | `info`, `alert`, `transaction`, `system` (default: `info`) |
| `metadata` | object | No | any key-value pairs |

> `userId` is auto-injected from the authenticated user.

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Notification Created",
  "data": {
    "_id": "...",
    "userId": "...",
    "title": "Welcome!",
    "message": "Thanks for joining",
    "type": "info",
    "isRead": false,
    "metadata": {}
  }
}
```

---

### 19.2 Get My Notifications

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/notifications/` |
| **Auth** | `protectUser` |

---

### 19.3 Mark Notification as Read

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/notifications/:id/read` |
| **Auth** | `protectUser` |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Notification marked as read",
  "data": { "isRead": true }
}
```

---

## 20. Memberships

Base path: `/api/v1/membership`

### 20.1 Register Membership

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/membership/create` |
| **Auth** | `protectUser` |

**Request Body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `baptismInterest` | boolean | No | default: `false` |
| `communionAlert` | boolean | No | default: `false` |

> `userId` is auto-injected from authenticated user.

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Membership Registered",
  "data": {
    "_id": "...",
    "userId": "...",
    "baptismInterest": true,
    "communionAlert": false,
    "status": "pending"
  }
}
```

---

### 20.2 Get All Memberships

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/membership/` |
| **Auth** | `protectUser` |

---

## 21. Ministries

Base path: `/api/v1/ministries`

### 21.1 Get All Ministries

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/ministries/` |
| **Auth** | `protectUser` |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "All Ministries",
  "data": [
    {
      "_id": "...",
      "name": "Worship Team",
      "description": "...",
      "image": "https://...",
      "leaderId": "...",
      "contactEmail": "worship@church.org"
    }
  ]
}
```

---

### 21.2 Get Single Ministry

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/ministries/:id` |
| **Auth** | `protectUser` |

---

### 21.3 Create Ministry (Admin)

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/ministries/` |
| **Auth** | `protectUser` + `protectAdmin` |

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `name` | string | Yes |
| `description` | string | No |
| `image` | string | No |
| `leaderId` | string | No |
| `contactEmail` | string | No |

---

### 21.4 Update Ministry (Admin)

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/ministries/:id` |
| **Auth** | `protectUser` + `protectAdmin` |

**Request Body:** Same as create, all optional.

---

### 21.5 Delete Ministry (Admin)

| | |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/ministries/:id` |
| **Auth** | `protectUser` + `protectAdmin` |

---

## 22. Bible Stories

Base path: `/api/v1/bible-stories`

### 22.1 Get All Stories

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/bible-stories/` |
| **Auth** | `protectUser` |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "All Bible Stories",
  "data": [
    {
      "_id": "...",
      "title": "David and Goliath",
      "content": "...",
      "author": "...",
      "order": 1,
      "mediaIds": ["..."]
    }
  ]
}
```

---

### 22.2 Create Story (Admin)

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/bible-stories/` |
| **Auth** | `protectUser` + `protectAdmin` |

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `title` | string | Yes |
| `content` | string | Yes |
| `author` | string | No |
| `order` | number | No |
| `mediaIds` | string[] | No |

---

## 23. Bible Verses

Base path: `/api/v1/bible-verses`

### 23.1 Get All Verses

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/bible-verses/` |
| **Auth** | `protectUser` |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "All Bible Verses",
  "data": [
    {
      "_id": "...",
      "passage": "John 3:16",
      "text": "For God so loved the world...",
      "version": "KJV",
      "category": "Love",
      "isDaily": false
    }
  ]
}
```

---

### 23.2 Get Daily Verse

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/bible-verses/daily` |
| **Auth** | `protectUser` |

> Returns one verse where `isDaily: true`, or a random verse.

---

### 23.3 Create Verse (Admin)

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/bible-verses/` |
| **Auth** | `protectUser` + `protectAdmin` |

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `passage` | string | Yes |
| `text` | string | Yes |
| `version` | string | No (default: `KJV`) |
| `category` | string | No |
| `isDaily` | boolean | No |

---

## 24. Info

Base path: `/api/v1/info`

### 24.1 Get Ministry Info

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/info/` |
| **Auth** | None |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Ministry info fetched",
  "data": { ... }
}
```

---

## 25. Health Check

### 25.1 Root Health Check

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/` |
| **Auth** | None |

**Response:**
```json
{ "message": "Mowdmin API is running" }
```

---

### 25.2 Detailed Health Check

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/health` |
| **Auth** | None |

**Success Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:00:00.000Z",
  "environment": "production",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

**Unhealthy Response (503):**
```json
{
  "status": "unhealthy",
  "timestamp": "...",
  "error": "..."
}
```

---

## Appendix A: Data Models Quick Reference

### User
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `name` | string | |
| `email` | string | unique |
| `password` | string | select: false |
| `language` | string | `EN`, `FR`, `DE` |
| `photo` | string | URL |
| `googleId` | string | sparse unique |
| `appleId` | string | sparse unique |
| `emailVerified` | boolean | |
| `isAdmin` | boolean | |
| `createdAt` | Date | |
| `updatedAt` | Date | |

### Profile
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `userId` | ObjectId | unique, ref: User |
| `displayName` | string | |
| `photoUrl` | string | |
| `bio` | string | |
| `location` | string | |
| `phone_number` | string | |
| `birthdate` | Date | |
| `language` | string | `EN`, `FR`, `DE` |
| `notificationPreferences` | object | |

### Event
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `title` | string | required |
| `date` | Date | required |
| `time` | string | required |
| `location` | string | required |
| `description` | string | |
| `image` | string | Cloudinary URL |
| `type` | string | enum (see Events) |
| `registrations` | ObjectId[] | ref: EventRegistration |

### Event Registration
| Field | Type | Notes |
|-------|------|-------|
| `eventId` | ObjectId | ref: Event |
| `userId` | ObjectId | ref: User |
| `status` | string | `registered`, `attended` |

### Media
| Field | Type | Notes |
|-------|------|-------|
| `title` | string | required |
| `description` | string | |
| `category_id` | ObjectId | ref: MediaCategory |
| `type` | string | `audio`, `video`, `text` |
| `media_url` | string | |
| `thumbnail` | string | Cloudinary URL |
| `author` | string | |
| `duration` | string | |
| `is_downloadable` | boolean | default: `true` |
| `language` | string | |
| `youtubeLiveLink` | string | |
| `isLive` | boolean | |

### Media Category
| Field | Type | Notes |
|-------|------|-------|
| `name` | string | required, unique |
| `description` | string | |

### Media Bookmark
| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId | ref: User |
| `mediaId` | ObjectId | ref: Media |
| `note` | string | |

### Prayer
| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId | ref: User |
| `title` | string | required |
| `description` | string | required |
| `images` | string[] | URLs |
| `isPublic` | boolean | default: `true` |
| `likeCount` | number | default: 0 |
| `commentCount` | number | default: 0 |
| `prayerRequestId` | ObjectId | ref: PrayerRequest |

### Prayer Request
| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId | ref: User |
| `title` | string | required |
| `description` | string | |
| `images` | string[] | |
| `isPublic` | boolean | default: `false` |

### Prayer Like
| Field | Type | Notes |
|-------|------|-------|
| `prayerId` | ObjectId | ref: Prayer |
| `userId` | ObjectId | ref: User |
| Unique index: `(prayerId, userId)` | | |

### Prayer Comment
| Field | Type | Notes |
|-------|------|-------|
| `prayerId` | ObjectId | ref: Prayer |
| `userId` | ObjectId | ref: User |
| `comment` | string | required |

### Group
| Field | Type | Notes |
|-------|------|-------|
| `name` | string | required |
| `description` | string | |
| `image` | string | |
| `creatorId` | ObjectId | ref: User |
| `isPrivate` | boolean | default: `false` |

### Group Member
| Field | Type | Notes |
|-------|------|-------|
| `groupId` | ObjectId | ref: Group |
| `userId` | ObjectId | ref: User |
| `role` | string | `Admin`, `Member` |

### Group Message
| Field | Type | Notes |
|-------|------|-------|
| `groupId` | ObjectId | ref: Group |
| `senderId` | ObjectId | ref: User |
| `content` | string | required |
| `type` | string | default: `text` |

### Order
| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId | ref: User |
| `totalAmount` | Decimal128 | required |
| `status` | string | `pending`, `paid`, `cancelled`, `shipped`, `completed` |
| `paymentMethod` | string | |
| `shippingAddress` | string | |
| `notes` | string | |
| `items` | ObjectId[] | ref: OrderItem |

### Order Item
| Field | Type | Notes |
|-------|------|-------|
| `orderId` | ObjectId | ref: Order |
| `productId` | ObjectId | ref: Product |
| `quantity` | number | required, default: 1 |
| `unit_price` | Decimal128 | |
| `subtotal` | Decimal128 | |

### Product
| Field | Type | Notes |
|-------|------|-------|
| `name` | string | required |
| `description` | string | |
| `price` | Decimal128 | required |
| `category` | string | plain string |
| `imageUrl` | string | |
| `stock` | number | default: 0 |

### Payment
| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId | ref: User |
| `type` | string | `order`, `donation`, `subscription` |
| `amount` | Decimal128 | required |
| `currency` | string | default: `USD` |
| `status` | string | `pending`, `success`, `failed`, `refunded` |
| `transactionRef` | string | unique |
| `paymentIntentId` | string | Stripe PI id |
| `webhookEventId` | string | sparse unique |
| `method` | string | default: `stripe` |
| `metadata` | mixed | |
| `expiresAt` | Date | |

### Donation
| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId | ref: User |
| `campaign` | ObjectId | ref: Campaign |
| `amount` | Decimal128 | required |
| `currency` | string | default: `USD` |
| `transactionRef` | string | unique |
| `status` | string | `pending`, `success`, `failed`, `refunded` |

### Campaign
| Field | Type | Notes |
|-------|------|-------|
| `title` | string | required |
| `description` | string | |
| `goalAmount` | number | required, min 0 |
| `totalRaised` | number | default: 0 |
| `isActive` | boolean | default: `true` |

### Notification
| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId | ref: User |
| `title` | string | required |
| `message` | string | required |
| `type` | string | `info`, `alert`, `reminder`, `system`, `transaction`, `like` |
| `metadata` | mixed | |
| `isRead` | boolean | default: `false` |

### Membership
| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId | ref: User |
| `baptismInterest` | boolean | |
| `communionAlert` | boolean | |
| `status` | string | `pending`, `approved`, `active` |

### Ministry
| Field | Type | Notes |
|-------|------|-------|
| `name` | string | required |
| `description` | string | |
| `image` | string | |
| `leaderId` | string | |
| `contactEmail` | string | |

### Bible Story
| Field | Type | Notes |
|-------|------|-------|
| `title` | string | required |
| `content` | string | required |
| `author` | string | |
| `order` | number | default: 0 |
| `mediaIds` | ObjectId[] | ref: Media |

### Bible Verse
| Field | Type | Notes |
|-------|------|-------|
| `passage` | string | required |
| `text` | string | required |
| `version` | string | default: `KJV` |
| `category` | string | |
| `isDaily` | boolean | default: `false` |

---

## Appendix B: Rate Limiters

| Limiter | Applied To | Description |
|---------|-----------|-------------|
| `authLimiter` | Login, refresh, social auth | Standard auth rate limit |
| `otpLimiter` | Verify OTP, reset password | Stricter limit for OTP endpoints |
| `passwordResetLimiter` | Forgot password, resend OTP | Prevents abuse of email-sending endpoints |

---

## Appendix C: File Upload Constraints

| Constraint | Value |
|-----------|-------|
| Max file size | 5 MB |
| Allowed types | Images only (jpeg, png, gif, webp) |
| Storage | Cloudinary |
| Middleware | Multer (memory storage) |

Endpoints accepting file uploads:
- `PUT /auth/profile` — field: `photo`
- `PUT /profile` — field: `photo`
- `POST /event/create`, `PUT /event/:id` — field: `image`
- `POST /media/create`, `PUT /media/:id` — field: `thumbnail`

---

## Appendix D: Common Error Codes

| Status | Meaning |
|--------|---------|
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized — missing or invalid token |
| 403 | Forbidden — insufficient permissions |
| 404 | Resource Not Found |
| 409 | Conflict (e.g., duplicate registration) |
| 422 | Validation Error (express-validator format) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |
| 503 | Service Unavailable (health check) |
