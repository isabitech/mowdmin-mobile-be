# Mowdministries Authentication API - Redis OTP System

## Overview
The authentication system now includes Redis-based OTP (One-Time Password) verification for enhanced security. All OTP operations use 4-digit codes with automatic expiration and rate limiting.

## Base URL
```
http://localhost:3000/api/auth
```

## Authentication Endpoints

### 1. User Registration
**Endpoint:** `POST /register`

**Description:** Register a new user. Email verification OTP will be sent automatically.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "language": "EN"
}
```

**Validation Rules:**
- `name`: Required, minimum 2 characters
- `email`: Required, valid email format, must be unique
- `password`: Required, minimum 6 characters, must include uppercase, lowercase, number, and special character
- `language`: Optional, enum values: "EN", "FR", "DE" (default: "EN")

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful! Please check your email for verification code.",
  "data": {
    "user": {
      "id": "uuid-here",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "language": "EN",
      "emailVerified": false,
      "emailVerifiedAt": null,
      "createdAt": "2025-11-16T10:30:00.000Z",
      "updatedAt": "2025-11-16T10:30:00.000Z"
    },
    "token": "jwt-token-here"
  }
}
```

**Error Responses:**
- `400`: Email already in use
- `400`: Validation errors

---

### 2. Email Verification
**Endpoint:** `POST /verify-email`

**Description:** Verify user email with OTP received via email.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "otp": "1234"
}
```

**Validation Rules:**
- `email`: Required, valid email format, must exist in database
- `otp`: Required, exactly 4 digits

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully! Welcome to Mowdministries!",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "emailVerified": true,
      "emailVerifiedAt": "2025-11-16T10:35:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400`: Invalid OTP
- `400`: OTP expired or not found
- `400`: Email already verified
- `404`: Email not found

---

### 3. Resend Email Verification
**Endpoint:** `POST /resend-verification`

**Description:** Resend email verification OTP. Rate limited to prevent abuse.

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Validation Rules:**
- `email`: Required, valid email format, must exist and be unverified

**Success Response (200):**
```json
{
  "success": true,
  "message": "Verification code sent to your email",
  "data": null
}
```

**Error Responses:**
- `400`: Email already verified
- `404`: Email not found
- `429`: Too many resend attempts (rate limited)

---

### 4. User Login
**Endpoint:** `POST /login`

**Description:** Login with email and password. Returns user data including email verification status.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "language": "EN",
      "emailVerified": true,
      "emailVerifiedAt": "2025-11-16T10:35:00.000Z"
    },
    "token": "jwt-token-here"
  }
}
```

**Error Responses:**
- `401`: Invalid email or password

---

### 5. Forgot Password
**Endpoint:** `POST /forgot-password`

**Description:** Request password reset OTP. Rate limited to prevent abuse.

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset code sent to your email",
  "data": null
}
```

**Error Responses:**
- `404`: Email not found
- `429`: Too many reset attempts (rate limited)

---

### 6. Reset Password
**Endpoint:** `POST /reset-password`

**Description:** Reset password using OTP received via email.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "otp": "5678",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}
```

**Validation Rules:**
- `email`: Required, valid email format, must exist
- `otp`: Required, exactly 4 digits
- `newPassword`: Required, same validation as registration
- `confirmPassword`: Required, must match newPassword

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": null
}
```

**Error Responses:**
- `400`: Invalid OTP
- `400`: OTP expired or not found
- `400`: Password validation errors
- `404`: Email not found

---

### 7. Change Password
**Endpoint:** `POST /change-password`

**Description:** Change password for authenticated users (requires current password).

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "currentPassword": "OldSecurePass123!",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null
}
```

## OTP System Features

### Security Features
- **4-digit OTP codes**: Easy to enter, secure enough for temporary use
- **Automatic expiration**: 
  - Email verification: 10 minutes
  - Password reset: 15 minutes
- **Single-use**: OTPs are invalidated after successful verification
- **Rate limiting**: Prevents abuse with configurable limits
- **Redis-based storage**: Fast, reliable, with automatic cleanup
- **Memory fallback**: System works even if Redis is temporarily unavailable

### Rate Limiting
- **Email verification resend**: 3 attempts per hour per email
- **Password reset requests**: 3 attempts per hour per email
- **Automatic reset**: Rate limits reset after the time window expires

### Email Templates
- **Professional HTML design**: Responsive, branded email templates
- **Multi-language support**: Templates adapt to user's preferred language
- **Clear instructions**: User-friendly emails with security reminders
- **Brevo API integration**: Reliable email delivery with tracking

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created (registration)
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid credentials)
- `404`: Not Found (email not found)
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

## Integration Examples

### Frontend Integration Example (JavaScript)
```javascript
// Register user
const registerUser = async (userData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
};

// Verify email with OTP
const verifyEmail = async (email, otp) => {
  const response = await fetch('/api/auth/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  return response.json();
};

// Complete registration flow
const completeRegistration = async () => {
  try {
    // Step 1: Register
    const regResult = await registerUser({
      name: "John Doe",
      email: "john@example.com",
      password: "SecurePass123!",
      language: "EN"
    });
    
    if (regResult.success) {
      // Step 2: Prompt user for OTP from email
      const otp = prompt("Enter verification code from email:");
      
      // Step 3: Verify email
      const verifyResult = await verifyEmail(regResult.data.user.email, otp);
      
      if (verifyResult.success) {
        console.log("Registration complete!");
        // User is now registered and verified
      }
    }
  } catch (error) {
    console.error("Registration failed:", error);
  }
};
```

### Testing with cURL
```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!",
    "language": "EN"
  }'

# Verify email (replace 1234 with actual OTP from email)
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "1234"
  }'
```

## Environment Configuration

Required environment variables for OTP system:
```env
# Redis Configuration
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# Brevo Email API
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=your-sender@example.com
BREVO_SENDER_NAME=Your App Name

# JWT Configuration
JWT_SECRET=your-jwt-secret
```

## Notes for Frontend Developers

1. **Email Verification Flow**: Always prompt users to check their email after registration
2. **OTP Input**: Use a 4-digit input field, ideally with automatic focus and validation
3. **Error Handling**: Display user-friendly error messages for expired or invalid OTPs
4. **Resend Functionality**: Provide a resend button with appropriate cooldown period
5. **Rate Limiting**: Inform users about rate limits and when they can try again
6. **Email Status**: Check user.emailVerified status to determine if verification is needed