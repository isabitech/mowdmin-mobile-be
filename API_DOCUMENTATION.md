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
| POST | `/register` | New Account | `name` (min 2), `email`, `password` (min 6, complex regex) |
| POST | `/login` | User Login | `email`, `password` |
| POST | `/logout` | End Session | No body |
| POST | `/verify-otp` | Email OTP | `email`, `otp` (4 digits) |
| POST | `/resend-otp` | New OTP | `email` |
| POST | `/forgot-password` | Recovery Init | `email` |
| POST | `/reset-password` | Set Password | `email`, `otp` (4 digit), `newPassword`, `confirmPassword` |
| POST | `/change-password` | Update Password | `email`, `currentPassword`, `newPassword` |
| POST | `/google` | Google Sign-In | `idToken` (Google ID token) |
| POST | `/apple` | Apple Sign-In | `identityToken`, `user` (optional) |

### Admin User Management (Admin Only)
| Method | Endpoint | Description | Data Requirements |
| :--- | :--- | :--- | :--- |
| GET | `/admin/users` | List All Users | None |
| PATCH | `/admin/users/:userId/promote` | Toggle Admin | None |
| PUT | `/admin/users/:userId` | Update User | `name` (opt), `role` (opt) |
| POST | `/admin/users/:userId/otp` | Trigger OTP | None |

---

## 2. Profiles (`/profile`)
| Method | Endpoint | Description | Data Requirements |
| :--- | :--- | :--- | :--- |
| GET | `/` | My Profile | Auth Token Required |
| PUT | `/` | Update My Profile| `displayName` (min 2), `bio` (max 500), `location` (max 100), `phone_number` (valid format), `birthdate` (YYYY-MM-DD, age 13-120) |

---

## 3. Events & Registrations (`/events`, `/event-registration`)
| Method | Endpoint | Description | Data Requirements |
| :--- | :--- | :--- | :--- |
| GET | `/events` | List Events | Alias: `/event` also works |
| GET | `/events/:id` | Event Detail | Event ID in Path |
| POST | `/events/create` | New Event | **Admin**. `title`, `date` (ISO), `time` (HH:mm), `location`, `type` (Crusade/Baptism/Communion/Concert), `description` (opt), `image` (opt) |
| PUT | `/events/:id` | Update Event | **Admin**. Same fields as create (all optional) |
| DELETE | `/events/:id` | Delete Event | **Admin**. Event ID in path |
| POST | `/event-registration/register`| Join Event | `eventId`, `ticketCode` (opt), `status` (opt: registered/attended) |
| GET | `/event-registration/user` | My Registry | Returns my registrations |
| GET | `/event-registration/event/:id`| Event List | Returns all users for event |

---

## 4. Media & Content (`/media`, `/media-category`, `/media-bookmark`, `/notifications`)
| Method | Endpoint | Description | Data Requirements |
| :--- | :--- | :--- | :--- |
| GET | `/media` | All Media | List content. Supports `?isLive=true` filter. |
| GET | `/media/:id` | Single Media | Get media details |
| POST | `/media/create` | Add Content | **Admin**. `title` (min 2), `category_id`, `type` (audio/video/text), `media_url`, `isLive`, `youtubeLiveLink`, `thumbnail` |
| PUT | `/media/:id` | Update Media | **Admin**. Same fields as create (all optional) |
| DELETE | `/media/:id` | Delete Media | **Admin**. Remove media |
| GET | `/media-category` | Categories | List content categories |
| POST | `/media-category/create` | Add Category | **Admin**. `name` (min 2), `description` (opt) |
| PUT | `/media-category/:id` | Update Category | **Admin**. `name`, `description` (opt) |
| DELETE | `/media-category/:id` | Delete Category | **Admin**. |
| GET | `/media-bookmark` | All Bookmarks | List my bookmarks |
| POST | `/media-bookmark/create` | Add Bookmark | `mediaId` |
| GET | `/media-bookmark/user/:userId`| User Bookmarks | Get bookmarks by user |
| GET | `/media-bookmark/:id` | Single Bookmark | Get bookmark details |
| PUT | `/media-bookmark/:id` | Update Bookmark | `mediaId` (opt) |
| DELETE | `/media-bookmark/:id` | Remove Bookmark | Delete bookmark |
| GET | `/notifications` | My Inbox | List unread notifications |
| POST | `/notifications/create` | Send Notification | **Admin**. `title`, `message`, `type` (info/alert/transaction/system) |
| PUT | `/notifications/:id/read` | Mark Read | ID in Path |

---

## 5. Spiritual Life (`/prayer`, `/prayer-request`)
| Method | Endpoint | Description | Data Requirements |
| :--- | :--- | :--- | :--- |
| GET | `/prayer-request` | All Requests | List all prayer requests |
| POST | `/prayer-request/create` | Submit Needs| `title` (min 2), `description` |
| GET | `/prayer-request/user` | My Requests | List my submissions |
| GET | `/prayer-request/:id` | Single Request | Get request details |
| PUT | `/prayer-request/:id` | Update Request | `title`, `description` |
| DELETE | `/prayer-request/:id` | Delete Request | Remove request |
| POST | `/prayer/create` | Prayer Point | **Admin**. `prayer_request_id` |
| GET | `/prayer` | Feed | List church prayer points |
| GET | `/prayer/user` | User Prayers | List prayers by current user |
| GET | `/prayer/:id` | Single Prayer | Get prayer point details |
| DELETE | `/prayer/:id` | Delete Prayer | **Admin**. Remove prayer point |

---

## 6. Commerce (`/product`, `/orders`, `/order-item`, `/payment`)
| Method | Endpoint | Description | Data Requirements |
| :--- | :--- | :--- | :--- |
| GET | `/product` | Store Catalog | Optional category filtering |
| GET | `/product/:id` | Product Detail | Get single product |
| GET | `/product/category/:categoryId`| By Category | Filter products by category |
| POST | `/product/create` | Add Product | **Admin**. `name` (min 2), `price` (min 0), `categoryId`, `description` (opt), `imageUrl` (opt), `stock` (opt) |
| PUT | `/product/:id` | Update Product | **Admin**. Same fields as create (all optional) |
| DELETE | `/product/:id` | Delete Product | **Admin**. Remove product |
| POST | `/orders/create` | Checkout | `userId`, `items` (`productId`, `quantity` > 0), `totalAmount` (min 0) |
| GET | `/orders/user` | My History | **Ownership validated**. List my orders only |
| GET | `/orders` | All Orders | **Admin Only**. Returns all orders |
| GET | `/orders/:id` | Order Detail | **Ownership validated**. |
| PUT | `/orders/:id` | Update Order | **Admin Only**. `status` (pending/paid/cancelled/shipped/completed), `paymentMethod`, `shippingAddress`, `notes` |
| DELETE | `/orders/:id` | Delete Order | **Admin Only**. Remove order |
| POST | `/orders/:id/cancel` | Cancel Order | **Admin Only**. Force cancel an order |
| POST | `/order-item/create`| Add Item | **Admin**. `orderId`, `productId`, `quantity` (min 1) |
| GET | `/order-item` | All Items | **Admin Only**. List all order items |
| GET | `/order-item/order/:orderId`| Order Items | Items for specific order |
| GET | `/order-item/:id` | Item Detail | Get single order item |
| PUT | `/order-item/:id` | Update Item | **Admin Only**. Edit item |
| DELETE | `/order-item/:id` | Delete Item | **Admin Only**. Remove item |
| POST | `/payment/create` | Init Payment | `orderId`, `amount`, `method`, `status` |
| GET | `/payment` | All Payments | **Admin Only**. Returns all payments |
| GET | `/payment/:id` | Payment Detail | **Ownership validated**. |
| GET | `/payment/order/:orderId` | Payments by Order | **Ownership validated**. |
| PUT | `/payment/:id` | Update Payment | **Admin Only**. `amount`, `method`, `status` |
| DELETE | `/payment/:id` | Delete Payment | **Admin Only**. Remove payment |

---

## 7. Giving (`/donation`, `/membership`, `/info`)
| Method | Endpoint | Description | Data Requirements |
| :--- | :--- | :--- | :--- |
| POST | `/donation/create` | Donate | `userId`, `amount` (min 0.01), `currency` (3 chars), `status`, `campaign`, `transactionRef` |
| GET | `/donation` | History | **Admin Only** |
| GET | `/membership` | Tiers | List available growth tracks |
| POST | `/membership/create` | Join Track | Registration for membership |
| GET | `/info` | About Us | Ministry details, socials, and location |

---

## 8. Community & Groups (`/groups`)
| Method | Endpoint | Description | Data Requirements |
| :--- | :--- | :--- | :--- |
| POST | `/create` | Create Group | `name`, `description`, `type` |
| GET | `/me` | My Groups | List groups I've joined |
| GET | `/discover` | Discover | List public groups |
| GET | `/:id` | Group Detail | Group ID in Path |
| POST | `/:id/join` | Join Group | Group ID in Path |
| GET | `/:id/messages` | Chat History | Group ID in Path |
| POST | `/:id/messages` | Send Message | `content` |
| DELETE | `/:id/admin-delete` | Delete Group | **Admin Only**. Moderation/cleanup |

---

## 9. Ministries (`/ministries`)
| Method | Endpoint | Description | Data Requirements |
| :--- | :--- | :--- | :--- |
| GET | `/` | List All | Detailed Department info |
| GET | `/:id` | Ministry Detail | ID in Path |
| POST | `/` | Create | **Admin**. `name`, `description`, `leader` (Implied required) |
| PUT | `/:id` | Update | **Admin**. `name`, `description`, `leader` (Implied optional) |
| DELETE | `/:id` | Delete | **Admin**. Delete ministry |

---

## 10. Bible Content (`/bible-stories`, `/bible-verses`)
| Method | Endpoint | Description | Data Requirements |
| :--- | :--- | :--- | :--- |
| GET | `/bible-stories` | Stories | List all stories |
| POST | `/bible-stories` | Add Story | **Admin**. `title`, `content`, `imageUrl` (Implied required) |
| GET | `/bible-verses` | Verses | List all verses |
| GET | `/bible-verses/daily`| Daily Verse | Get today's verse |
| POST | `/bible-verses` | Add Verse | **Admin**. `book`, `chapter`, `verse` (Implied required) |
