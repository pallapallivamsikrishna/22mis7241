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


---

# Stage 2

## Database Choice: PostgreSQL

### Why PostgreSQL?
- Structured, relational data — notifications have fixed fields
- Supports powerful indexing for fast queries
- ACID compliant — ensures data is never lost
- Handles relationships between students and notifications easily
- Better than MongoDB here because data structure is predictable

---

## Database Schema

```sql
CREATE TABLE students (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    rollNumber  VARCHAR(20) UNIQUE NOT NULL,
    createdAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studentId   INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    type        VARCHAR(50) NOT NULL CHECK (type IN ('Placement', 'Result', 'Event')),
    message     TEXT NOT NULL,
    isRead      BOOLEAN DEFAULT FALSE,
    createdAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Problems as Data Volume Increases

| Problem | Explanation |
|---|---|
| Slow queries | Millions of rows cause full table scans |
| High DB load | Every page load hits the database directly |
| Storage limits | Notifications accumulate without cleanup |
| Sorting cost | ORDER BY on large tables is expensive |

---

## Solutions

| Problem | Solution |
|---|---|
| Slow queries | Add indexes on studentId, isRead, createdAt |
| High DB load | Use Redis caching for frequent queries |
| Storage limits | Archive old notifications after 6 months |
| Sorting cost | Composite index on (studentId, createdAt) |

---

## SQL Queries Based on Stage 1 APIs

### GET /notifications — Fetch all notifications for a student
```sql
SELECT id, type, message, isRead, createdAt
FROM notifications
WHERE studentId = 1042
ORDER BY createdAt DESC
LIMIT 20 OFFSET 0;
```

### GET /notifications?notification_type=Placement — Filter by type
```sql
SELECT id, type, message, isRead, createdAt
FROM notifications
WHERE studentId = 1042
AND type = 'Placement'
ORDER BY createdAt DESC
LIMIT 20 OFFSET 0;
```

### PATCH /notifications/{id}/read — Mark one as read
```sql
UPDATE notifications
SET isRead = true
WHERE id = 'a1b2c3d4'
AND studentId = 1042;
```

### PATCH /notifications/read-all — Mark all as read
```sql
UPDATE notifications
SET isRead = true
WHERE studentId = 1042
AND isRead = false;
```

### Indexes for Performance
```sql
CREATE INDEX idx_notifications_studentId 
ON notifications(studentId);

CREATE INDEX idx_notifications_student_read_date 
ON notifications(studentId, isRead, createdAt DESC);
```

---

# Stage 3

## The Slow Query

```sql
SELECT * FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt ASC;
```

---

## Is This Query Accurate?

The query is **logically correct** — it fetches unread notifications for a student ordered by date.

However it is **NOT efficient** for a database with 50,000 students and 5,000,000 notifications.

---

## Why Is This Query Slow?

| Problem | Explanation |
|---|---|
| No index on studentID | Database scans all 5 million rows to find student 1042 |
| No index on isRead | Cannot quickly filter unread — another full scan |
| No index on createdAt | Sorting 5 million rows after scanning is very expensive |
| SELECT * used | Fetches all columns even if not needed — wastes memory |
| Full table scan | With 5M rows, this can take several seconds |

---

## Computation Cost

| Operation | Cost |
|---|---|
| Full table scan (no index) | O(n) — scans all 5 million rows |
| Filtering without index | O(n) — checks every row |
| Sorting without index | O(n log n) — very expensive on large data |
| **Total** | **Very High — unacceptable for production** |

---

## What Would You Change?

### 1. Add Composite Index

```sql
CREATE INDEX idx_notifications_student_read_date
ON notifications(studentID, isRead, createdAt ASC);
```

This single index handles all three WHERE and ORDER BY conditions together — query becomes O(log n) instead of O(n).

### 2. Replace SELECT * with Specific Columns

```sql
SELECT id, studentID, type, message, isRead, createdAt
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt ASC
LIMIT 20 OFFSET 0;
```

### 3. Add Pagination

Without LIMIT, even an optimized query returns thousands of rows at once — always paginate.

---

## Optimized Query

```sql
SELECT id, type, message, isRead, createdAt
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt ASC
LIMIT 20 OFFSET 0;
```

**Cost after optimization:** O(log n) — extremely fast even with 5 million rows.

---

## Should We Add Indexes on Every Column?

### No — This Is Bad Advice ❌

| Reason | Explanation |
|---|---|
| Extra storage | Each index takes significant disk space |
| Slower writes | Every INSERT/UPDATE must update all indexes |
| Unnecessary overhead | Indexes on unused columns waste resources |
| Query planner confusion | Too many indexes can confuse the DB optimizer |

### Correct Approach ✅

Only add indexes on columns that are:
- Used in WHERE clauses frequently
- Used in ORDER BY clauses
- Used in JOIN conditions

For our notifications table, only these indexes are needed:

```sql
-- Most important: covers the main query pattern
CREATE INDEX idx_notifications_student_read_date
ON notifications(studentID, isRead, createdAt ASC);

-- For filtering by type
CREATE INDEX idx_notifications_type
ON notifications(notificationType);
```

---

## Query: Students Who Got Placement Notification in Last 7 Days

```sql
SELECT DISTINCT studentID
FROM notifications
WHERE notificationType = 'Placement'
AND createdAt >= NOW() - INTERVAL '7 days';
```

### With Student Details:

```sql
SELECT DISTINCT s.id, s.name, s.email, s.rollNumber
FROM students s
JOIN notifications n ON s.id = n.studentID
WHERE n.notificationType = 'Placement'
AND n.createdAt >= NOW() - INTERVAL '7 days'
ORDER BY s.name ASC;
```
