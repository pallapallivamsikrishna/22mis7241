# Stage 1 — REST API Design: Campus Notification System

---

## Core Actions of the Notification System

- Fetch all notifications for a student
- Filter notifications by type (Placement, Result, Event)
- Fetch a single notification by ID
- Mark a specific notification as read
- Mark all notifications as read
- Receive real-time notifications (push-based)

---

## Naming Conventions

- All endpoints use **lowercase**, **plural nouns**
- Resource identifiers placed in the path: `/notifications/{id}`
- Query parameters used for filtering and pagination
- No verbs in endpoint paths (e.g., avoid `/getNotifications`)

---

## API Endpoints

---

### 1. Get All Notifications

Fetches all notifications for the authenticated student, with optional filtering and pagination.

```
GET /notifications
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Query Parameters:**
| Parameter         | Type    | Required | Description                          |
|-------------------|---------|----------|--------------------------------------|
| notification_type | string  | No       | Filter by type: Placement, Result, Event |
| page              | integer | No       | Page number (default: 1)             |
| limit             | integer | No       | Results per page (default: 20)       |

**Example Request:**
```
GET /notifications?notification_type=Placement&page=1&limit=10
```

**Response — 200 OK:**
```json
{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 45,
  "data": [
    {
      "id": "a1b2c3d4",
      "type": "Placement",
      "message": "Google is conducting a hiring drive on 25th April 2026.",
      "isRead": false,
      "createdAt": "2026-04-22T17:51:30Z"
    },
    {
      "id": "e5f6g7h8",
      "type": "Result",
      "message": "Semester 6 results have been published.",
      "isRead": true,
      "createdAt": "2026-04-20T10:00:00Z"
    }
  ]
}
```

---

### 2. Get a Single Notification by ID

Fetches details of one specific notification.

```
GET /notifications/{id}
```

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameter:**
| Parameter | Type   | Description          |
|-----------|--------|----------------------|
| id        | string | Unique notification ID |

**Response — 200 OK:**
```json
{
  "status": "success",
  "data": {
    "id": "a1b2c3d4",
    "type": "Placement",
    "message": "Google is conducting a hiring drive on 25th April 2026.",
    "isRead": false,
    "createdAt": "2026-04-22T17:51:30Z"
  }
}
```

**Response — 404 Not Found:**
```json
{
  "status": "error",
  "message": "Notification not found."
}
```

---

### 3. Mark a Specific Notification as Read

Updates the `isRead` status of a single notification to `true`.

```
PATCH /notifications/{id}/read
```

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameter:**
| Parameter | Type   | Description          |
|-----------|--------|----------------------|
| id        | string | Unique notification ID |

**Request Body:** *(not required — action is implied by endpoint)*

**Response — 200 OK:**
```json
{
  "status": "success",
  "message": "Notification marked as read.",
  "data": {
    "id": "a1b2c3d4",
    "isRead": true
  }
}
```

---

### 4. Mark All Notifications as Read

Marks every notification for the authenticated student as read in one operation.

```
PATCH /notifications/read-all
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response — 200 OK:**
```json
{
  "status": "success",
  "message": "All notifications marked as read."
}
```

---

### 5. Filter Notifications by Type

Filtering is handled via query parameters on the main GET endpoint (see Endpoint 1).

**Example Requests:**
```
GET /notifications?notification_type=Placement
GET /notifications?notification_type=Result
GET /notifications?notification_type=Event
```

This keeps the API clean — no separate filter endpoint needed.

---

## Notification Object Schema

| Field     | Type    | Description                              |
|-----------|---------|------------------------------------------|
| id        | string  | Unique identifier (UUID)                |
| type      | string  | Placement / Result / Event              |
| message   | string  | Notification content                    |
| isRead    | boolean | Whether student has read it             |
| createdAt | string  | ISO 8601 timestamp (UTC)                |

---

## Real-Time Notification Mechanism

For real-time delivery of new notifications without page refresh, two approaches are suitable:

### Option 1 — WebSockets (Recommended)
- Persistent two-way connection between client and server
- Server instantly pushes new notifications to all connected students
- Best for high-frequency real-time updates

**Flow:**
```
Student opens app
    ↓
Client connects to WebSocket server: ws://server/notifications
    ↓
Server sends new notification instantly when triggered
    ↓
Client updates UI without reload
```

### Option 2 — Server-Sent Events (SSE)
- One-way server-to-client streaming over HTTP
- Simpler than WebSockets; suitable for notification-only push
- Works well when client does not need to send data back

**Flow:**
```
Client subscribes: GET /notifications/stream
    ↓
Server keeps connection open
    ↓
Sends events as: data: { "id": "...", "message": "..." }
    ↓
Client receives and displays notification
```

**Recommended:** WebSockets for a full campus notification system due to scalability and flexibility.

---

## HTTP Status Codes Used

| Code | Meaning                  |
|------|--------------------------|
| 200  | Success                  |
| 400  | Bad Request              |
| 401  | Unauthorized             |
| 404  | Resource Not Found       |
| 500  | Internal Server Error    |

---

## Summary of All Endpoints

| Method | Endpoint                    | Description                      |
|--------|-----------------------------|----------------------------------|
| GET    | /notifications              | Fetch all notifications (with filters) |
| GET    | /notifications/{id}         | Fetch single notification        |
| PATCH  | /notifications/{id}/read    | Mark one notification as read    |
| PATCH  | /notifications/read-all     | Mark all notifications as read   |
