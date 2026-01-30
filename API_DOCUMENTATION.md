# Mowdmin Mobile Backend - Exhaustive API Reference

**Base URL**: `https://mowdmin-mobile-be-qwo0.onrender.com/api/v1`  
**Authentication**: Bearer Token in Header (`Authorization: Bearer <JWT>`)

## Security Features
- **Rate Limiting**: Auth endpoints limited (5 login attempts/15min, 3 OTP attempts/15min)
- **CORS**: Whitelisted origins only (configure via `ALLOWED_ORIGINS` env var)
- **Ownership Validation**: Users can only access their own resources
- **Cryptographic OTP**: 4-digit codes using `crypto.randomInt()`

---

## 1. Authentication (`/auth`)
| Method | Endpoint | Description | Data Requirements |
| :--- | :--- | :--- | :--- |
| POST | `/register` | New Account | `name`, `email`, `password` (min 6, complex) |
| POST | `/login` | User Login | `email`, `password` |
| POST | `/logout` | End Session | No body |
| POST | `/verify-otp` | Email OTP | `email`, `otp` (4 digits) |
| POST | `/resend-otp` | New OTP | `email` |
| POST | `/forgot-password` | Recovery Init | `email` |
| POST | `/reset-password` | Set Password | `email`, `otp`, `newPassword`, `confirmPassword` |
| POST | `/change-password` | Update Password | `email`, `currentPassword`, `newPassword` |
| POST | `/google` | Google Sign-In | `idToken` (Google ID token from client) |
| POST | `/apple` | Apple Sign-In | `identityToken`, `user` (optional, first sign-in only) |
| GET | `/admin/users` | List All Users | **Admin Only**. Returns all registered users |
| PATCH | `/admin/users/:userId/promote` | Toggle Admin | **Admin Only**. Grant/revoke admin privileges |

---

## 2. Profiles (`/profile` & `/auth/profile`)
| Method | Endpoint | Description | Data Requirements |
| :--- | :--- | :--- | :--- |
| GET | `/` | My Profile | Auth Token Required |
| PUT | `/` | Update My Profile| `name`, `bio`, etc. |
| GET | `/auth/profile/:userId` | View User | User ID in Path |
| PUT | `/auth/profile/:userId` | Edit Profile | Multipart: `photo` (file), fields |
| DELETE| `/auth/profile/:userId` | Delete Account| User ID in Path |

---

## 3. Events & Registrations (`/events`, `/event-registration`)
| Method | Endpoint | Description | Data Requirements |
| :--- | :--- | :--- | :--- |
| GET | `/events` | List Events | Alias: `/event` also works |
| GET | `/events/:id` | Event Detail | Event ID in Path |
| POST | `/events/create` | New Event | **Admin Only**. `title`, `date`, `time`, `location`, `type` (Crusade/Baptism etc) |
| PUT | `/events/:id` | Update Event | **Admin Only**. Any field + `image` file |
| DELETE | `/events/:id` | Delete Event | **Admin Only**. Event ID in path |
| POST | `/event-registration/register`| Join Event | `eventId` |
| GET | `/event-registration/user` | My Registry | Returns my registrations |
| GET | `/event-registration/event/:id`| Event List | Returns all users for event |

---

## 4. Media & Content (`/media`, `/notifications`, `/media-bookmark`, `/media-category`)
| Method | Endpoint | Description | Data Requirements |
| :--- | :--- | :--- | :--- |
| GET | `/videos` | All Media | Alias for `/media` |
| POST | `/media/create` | Add Content | **Admin Only**. `title`, `description`, `url`, `categoryId` |
| GET | `/media-category` | Categories | List content categories |
| POST | `/media-bookmark/create` | Bookmark | `mediaId` |
| GET | `/notifications` | My Inbox | Alias for `/notification`. List unread |
| PUT | `/notifications/:id/read` | Mark Read | ID in Path |

---

## 5. Spiritual Life (`/prayer`, `/prayer-request`)
| Method | Endpoint | Description | Data Requirements |
| :--- | :--- | :--- | :--- |
| POST | `/prayer-request/create` | Submit Needs| `title`, `description` (required) |
| GET | `/prayer-request/user` | My Requests | List my submissions |
| POST | `/prayer/create` | Prayer Point | **Admin**. Links to `prayer_request_id` |
| GET | `/prayer` | Feed | List church prayer points |

---

## 6. Commerce (`/product`, `/orders`, `/order-item`, `/payment`)
| Method | Endpoint | Description | Data Requirements |
| :--- | :--- | :--- | :--- |
| GET | `/product` | Store Catalog | Optional category filtering |
| POST | `/product/create` | Add Product | **Admin**. `name`, `price`, `categoryId` |
| POST | `/orders/create` | Checkout | `total_amount`, `shipping_address`, `items` (array) |
| GET | `/orders/user` | My History | **Ownership validated**. List my orders only |
| GET | `/orders/:id` | Order Detail | **Ownership validated**. User can only view their own orders |
| GET | `/orders` | All Orders | **Admin Only**. Returns all orders from all users |
| POST | `/payment/create` | Init Payment | `orderId`, `amount`, `paymentMethod` |
| GET | `/payment/:id` | Payment Detail | **Ownership validated**. User can only view their own payments |
| GET | `/payment/order/:id` | Payments by Order | **Ownership validated**. User must own the order |
| GET | `/payment` | All Payments | **Admin Only**. Returns all payments from all users |
| POST | `/order-item/create`| Direct Item | `orderId`, `productId`, `quantity` |

---

## 7. Giving (`/donation`, `/membership`, `/info`)
| Method | Endpoint | Description | Data Requirements |
| :--- | :--- | :--- | :--- |
| POST | `/donation/create` | Donate | `amount`, `type`, `paymentMethod`, `notes` |
| GET | `/donation` | History | **Admin Only** |
| GET | `/membership` | Tiers | List available growth tracks |
| POST | `/membership/create` | Join Track | Registration for membership |
| GET | `/info` | About Us | Ministry details, socials, and location |

---

## Roadmap & Stubs
The following prefixes are mounted but currently return `501 Not Implemented` for all children:
- `/api/v1/groups/*` (Chat & Community)
- `/api/v1/ministries` (Detailed Department info)
- `/api/v1/bible-stories` (Bible Stories - includes `imageUrl`, `videoUrl`)
- `/api/v1/bible-verses` (Bible Verses)
