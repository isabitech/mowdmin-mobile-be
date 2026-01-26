# Profile Management API Documentation

## Overview
The profile management system allows users to create, read, update, and delete their profile information. Profiles are linked to user accounts and support photo uploads.

## Base URL
```
http://localhost:3000/api/auth
```

## Profile Endpoints

### 1. Get User Profile
**Endpoint:** `GET /profile/:userId`

**Description:** Retrieve profile information for a specific user.

**Parameters:**
- `userId` (UUID): Required. The unique identifier of the user.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "profile-uuid",
    "userId": "user-uuid",
    "displayName": "John Doe",
    "photoUrl": "http://localhost:3000/uploads/photo-123456789.jpg",
    "phone_number": "+1234567890",
    "bio": "Software developer passionate about building amazing apps",
    "location": "New York, USA",
    "birthdate": "1990-01-15T00:00:00.000Z",
    "createdAt": "2025-11-16T10:30:00.000Z",
    "updatedAt": "2025-11-16T10:35:00.000Z",
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "emailVerified": true
    }
  }
}
```

**Error Responses:**
- `400`: Invalid user ID format
- `404`: Profile not found

---

### 2. Create/Update User Profile
**Endpoint:** `PUT /profile/:userId`

**Description:** Create a new profile or update existing profile information. Supports file upload for profile photos.

**Parameters:**
- `userId` (UUID): Required. The unique identifier of the user.

**Request Body (Form Data):**
```json
{
  "displayName": "John Doe",
  "bio": "Software developer passionate about building amazing apps",
  "location": "New York, USA",
  "phone_number": "+1234567890",
  "birthdate": "1990-01-15",
  "photo": "file upload (optional)"
}
```

**Field Validation:**
- `displayName`: Optional, 2-100 characters
- `bio`: Optional, max 500 characters
- `location`: Optional, max 100 characters
- `phone_number`: Optional, valid international phone format
- `birthdate`: Optional, ISO date format (YYYY-MM-DD), age 13-120
- `photo`: Optional, image file only, max 5MB

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile saved successfully",
  "data": {
    "id": "profile-uuid",
    "userId": "user-uuid",
    "displayName": "John Doe",
    "photoUrl": "http://localhost:3000/uploads/photo-123456789.jpg",
    "phone_number": "+1234567890",
    "bio": "Software developer passionate about building amazing apps",
    "location": "New York, USA",
    "birthdate": "1990-01-15T00:00:00.000Z",
    "createdAt": "2025-11-16T10:30:00.000Z",
    "updatedAt": "2025-11-16T10:35:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Validation errors, invalid user ID
- `413`: File too large (>5MB)
- `415`: Invalid file type (not an image)

---

### 3. Delete User Profile
**Endpoint:** `DELETE /profile/:userId`

**Description:** Delete a user's profile information.

**Parameters:**
- `userId` (UUID): Required. The unique identifier of the user.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile deleted successfully",
  "data": null
}
```

**Error Responses:**
- `400`: Invalid user ID format
- `404`: Profile not found

---

## Enhanced Login Response

When a user logs in, their profile information is now included in the response if available:

**Login Response with Profile:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "language": "EN",
      "emailVerified": true,
      "emailVerifiedAt": "2025-11-16T10:35:00.000Z",
      "profile": {
        "id": "profile-uuid",
        "displayName": "John Doe",
        "photoUrl": "http://localhost:3000/uploads/photo-123456789.jpg",
        "bio": "Software developer",
        "location": "New York, USA",
        "phone_number": "+1234567890",
        "birthdate": "1990-01-15T00:00:00.000Z"
      }
    },
    "token": "jwt-token-here"
  }
}
```

## File Upload Specifications

### Photo Upload
- **Accepted formats**: JPEG, PNG, GIF, WebP
- **Maximum size**: 5MB
- **Storage location**: `/uploads/` directory
- **Naming convention**: `photo-{timestamp}-{random}.{extension}`
- **URL format**: `http://localhost:3000/uploads/{filename}`

### Upload Security
- File type validation using MIME type checking
- File size limits enforced
- Unique filename generation to prevent conflicts
- Secure file storage in designated uploads directory

## Integration Examples

### Frontend Integration (JavaScript)

#### Get User Profile
```javascript
const getUserProfile = async (userId) => {
  try {
    const response = await fetch(`/api/auth/profile/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Profile:', result.data);
      return result.data;
    } else {
      console.error('Error:', result.message);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
};
```

#### Update Profile with Photo
```javascript
const updateProfileWithPhoto = async (userId, profileData, photoFile) => {
  try {
    const formData = new FormData();
    
    // Add profile fields
    if (profileData.displayName) formData.append('displayName', profileData.displayName);
    if (profileData.bio) formData.append('bio', profileData.bio);
    if (profileData.location) formData.append('location', profileData.location);
    if (profileData.phone_number) formData.append('phone_number', profileData.phone_number);
    if (profileData.birthdate) formData.append('birthdate', profileData.birthdate);
    
    // Add photo file if provided
    if (photoFile) formData.append('photo', photoFile);
    
    const response = await fetch(`/api/auth/profile/${userId}`, {
      method: 'PUT',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Profile updated:', result.data);
      return result.data;
    } else {
      console.error('Update failed:', result.message);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
};
```

#### Update Profile without Photo
```javascript
const updateProfile = async (userId, profileData) => {
  try {
    const response = await fetch(`/api/auth/profile/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Profile updated:', result.data);
      return result.data;
    } else {
      console.error('Update failed:', result.message);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
};
```

### Testing with cURL

#### Get Profile
```bash
curl -X GET http://localhost:3000/api/auth/profile/{userId} \
  -H "Authorization: Bearer {token}"
```

#### Update Profile (JSON)
```bash
curl -X PUT http://localhost:3000/api/auth/profile/{userId} \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "John Doe",
    "bio": "Updated bio",
    "location": "San Francisco, CA",
    "phone_number": "+1234567890",
    "birthdate": "1990-01-15"
  }'
```

#### Update Profile with Photo
```bash
curl -X PUT http://localhost:3000/api/auth/profile/{userId} \
  -F "displayName=John Doe" \
  -F "bio=Profile with photo" \
  -F "photo=@path/to/photo.jpg"
```

#### Delete Profile
```bash
curl -X DELETE http://localhost:3000/api/auth/profile/{userId}
```

## Error Handling

### Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "displayName",
      "message": "Display name must be between 2 and 100 characters"
    },
    {
      "field": "birthdate",
      "message": "Age must be between 13 and 120 years"
    }
  ]
}
```

### File Upload Errors
```json
{
  "success": false,
  "message": "Only image files are allowed"
}
```

## Database Schema

### Profile Table Structure
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id),
  displayName VARCHAR(100),
  photoUrl VARCHAR(255),
  phone_number VARCHAR(20),
  bio TEXT,
  location VARCHAR(100),
  birthdate DATE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Considerations

1. **File Upload Security**: Only image files allowed, size limits enforced
2. **Input Validation**: All profile data is validated before saving
3. **UUID Validation**: User IDs must be valid UUIDs
4. **Data Sanitization**: Text inputs are trimmed and length-limited
5. **Age Validation**: Birthdate must result in reasonable age (13-120)

## Best Practices

1. **Progressive Enhancement**: Profile creation is optional after user registration
2. **Graceful Degradation**: App works without profile information
3. **Image Optimization**: Consider implementing image resizing for better performance
4. **Privacy Controls**: Consider adding privacy settings for profile visibility
5. **Data Backup**: Ensure profile photos are included in backup strategies