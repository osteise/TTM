# TabletopMatch

TabletopMatch is an application under development that aims to help people find others to play board games, miniature games, and card games with.

The first version focuses on player profiles and the ability to find other players. The project is designed with future expansion in mind, including additional social and community features.

## Tech Stack

### Backend

* **C#**
* **ASP.NET Core**
* **.NET**
* **Entity Framework Core**
* **PostgreSQL**
* **Npgsql**
* **REST API**
* **ASP.NET Core Identity**
* **Cookie-based authentication**

### Frontend

* **React**
* **TypeScript**
* **Vite**
* **React Router**
* **CSS**

### Development

* **Docker / Docker Compose** for running PostgreSQL locally
* **Entity Framework Core Migrations** for managing database schema changes
* **Git / GitHub** for version control

## Project Structure

The backend project is located in:

```text
backend/
└── TabletopMatch.Api/
```

The ASP.NET Core application currently contains, among other things:

```text
TabletopMatch.Api/
├── Contracts/     # API request and response models
├── Controllers/   # REST API endpoints
├── Data/          # Entity Framework database context
├── Migrations/    # Entity Framework migrations
├── Models/        # Database entities
├── Services/      # Application and business logic
├── Program.cs
└── appsettings.json
```

The frontend project is located in:

```text
frontend/
└── tabletop-match-web/
```

The frontend source is organized by responsibility:

```text
src/
├── components/   # Reusable UI and route guards
├── context/      # Authentication context and provider
├── hooks/        # Reusable React hooks
├── layouts/      # Shared page layouts
├── pages/        # Route-level page components
├── services/     # API request functions
├── types/        # Shared TypeScript types
├── App.tsx       # Route configuration
└── main.tsx      # Application entry point
```

The project structure will continue to evolve as new functionality is added.

## Prerequisites

To run the project locally, make sure you have the following installed:

* [.NET SDK](https://dotnet.microsoft.com/)
* [Node.js](https://nodejs.org/) and npm (Node.js 20.19+ or 22.12+)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* Git

Verify that .NET is installed:

```bash
dotnet --version
```

Verify that Node.js and npm are installed:

```bash
node --version
npm --version
```

Verify that Docker is available:

```bash
docker --version
```

## Running the Project Locally

### 1. Clone the repository

```bash
git clone <repository-url>
```

Navigate to the project directory:

```bash
cd TabletopMatch
```

### 2. Start PostgreSQL

From the directory containing `docker-compose.yml`, start the database container:

```bash
docker compose up -d
```

Verify that the container is running:

```bash
docker ps
```

### 3. Apply database migrations

Navigate to the API project:

```bash
cd backend/TabletopMatch.Api
```

Apply the existing Entity Framework migrations:

```bash
dotnet ef database update
```

This will create or update the local database based on the migrations included in the project.

### 4. Start the API

From `backend/TabletopMatch.Api`, run:

```bash
dotnet run
```

Once the application has started, the local address will be displayed in the terminal, for example:

```text
Now listening on: http://localhost:5252
```

The API is now available locally.
 
### 5. Start the frontend

Navigate to `frontend/tabletop-match-web`.

Install the dependencies if you have not already done so:

```bash
npm install
```

Then start the Vite development server:

```bash
npm run dev
```

The frontend will usually be available at:

http://localhost:5173

## Frontend Routing

The frontend uses React Router with a shared application layout and navigation.

| Path | Access | Description |
|---|---|---|
| `/` | Public | Home page |
| `/players` | Public | Lists player profiles |
| `/players/:profileId` | Public | Shows one public player profile |
| `/login` | Public | Account login |
| `/register` | Public | Account registration |
| `/profile` | Required | Shows and edits the authenticated user's profile |
| `/messages` | Required | Shows the authenticated user's conversation inbox |
| `/messages/new/:profileId` | Required | Composes the first message to another player |
| `/messages/:conversationId` | Required | Shows and sends messages in a conversation |
| `*` | Public | Displays the not found page |

The `/profile` and `/messages` routes are protected and redirect unauthenticated users to `/login`. Authenticated users visiting `/login` or `/register` are redirected to `/profile`.

## API

The project uses a REST API built with ASP.NET Core.

### Authentication

User accounts are managed with ASP.NET Core Identity. The application uses an HTTP-only cookie to keep browser users authenticated.

Registering an account also creates exactly one associated player profile.

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Creates an account and player profile |
| `POST` | `/api/auth/login` | Public | Logs in and creates an authentication cookie |
| `POST` | `/api/auth/logout` | Required | Logs out and removes the authentication cookie |
| `GET` | `/api/auth/me` | Required | Returns the current account and profile |

Example registration request:

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "player@example.com",
  "password": "Test123!",
  "displayName": "Test Player",
  "city": "Skövde",
  "bio": "Looking for people to play tabletop games with."
}
```
A player profile cannot be created directly. It is created automatically during account registration.

| Method | Endpoint             | Authentication | Description                              |
| ------ | -------------------- | -------------- | ---------------------------------------- |
| `GET`  | `/api/profiles`      | Public         | Returns all player profiles              |
| `GET`  | `/api/profiles/{id}` | Public         | Returns one player profile               |
| `PUT`  | `/api/profiles/me`   | Required       | Updates the authenticated user's profile |

### Direct Messaging

Direct messaging is implemented in the existing ASP.NET Core API. All messaging endpoints require cookie-based authentication.

A direct conversation contains exactly two participants. The conversation and its first message are saved in the same database transaction, so an empty conversation is not created if sending the message fails.

When the same user pair sends another direct message, the existing conversation is reused instead of creating a duplicate. Conversations without messages are not returned in the conversation list.

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| `POST` | `/api/conversations/direct/messages` | Required | Creates or reuses a direct conversation and sends a message |
| `GET` | `/api/conversations` | Required | Returns the authenticated user's non-empty conversations |
| `GET` | `/api/conversations/{conversationId}/messages` | Required | Returns a paginated message history |
| `POST` | `/api/conversations/{conversationId}/messages` | Required | Sends a message in an existing conversation |
| `GET` | `/api/conversations/unread-count` | Required | Returns the authenticated user's total unread message count |
| `PUT` | `/api/conversations/{conversationId}/read-status` | Required | Advances the authenticated user's read marker |

Example request for sending the first direct message:

```http
POST /api/conversations/direct/messages
Content-Type: application/json

{
  "participantProfileId": 42,
  "content": "Would you like to play this weekend?"
}
```

The recipient is identified by their public player profile ID. Internal Identity user IDs and email addresses are not exposed by the messaging API.

Example request for sending another message in an existing conversation:

```http
POST /api/conversations/2711af8a-857a-4fe0-bd4d-4b78843a8aca/messages
Content-Type: application/json

{
  "content": "How about Saturday afternoon?"
}
```

Messages have a maximum length of 2,000 characters. The sender is always determined from the authenticated user and cannot be supplied by the client.

Message history uses cursor pagination:

```http
GET /api/conversations/{conversationId}/messages?pageSize=50
GET /api/conversations/{conversationId}/messages?beforeMessageId=120&pageSize=50
```

`pageSize` defaults to 50 and must be between 1 and 100. `nextCursor` can be passed as `beforeMessageId` to retrieve the next page of older messages.

Users can only read or send messages in conversations where they are participants.

Message read status is stored per conversation participant in the database, so it persists across page reloads and different devices. Retrieving conversations or message history does not automatically change the read status.

The client explicitly advances the read marker by providing the newest message that the user has read:

```http
PUT /api/conversations/2711af8a-857a-4fe0-bd4d-4b78843a8aca/read-status
Content-Type: application/json

{
  "lastReadMessageId": 123
}
```

The message must belong to the conversation, and the read marker can only move forward. Sending a message automatically advances the sender's read marker to the newly created message.

Conversation responses include an unreadCount. The lightweight /api/conversations/unread-count endpoint returns the total unread count without returning the full inbox.

## Database Migrations

When the data model changes, create a new migration with:

```bash
dotnet ef migrations add MigrationName
```

Then apply it to the database:

```bash
dotnet ef database update
```

For example:

```bash
dotnet ef migrations add AddPlayerProfiles
dotnet ef database update
```

## Development Status

TabletopMatch is currently in an early stage of development.

Currently implemented:

* User account registration
* Cookie-based login and logout
* One player profile per account
* Public player profile listing
* Public pages for individual player profiles
* Editing of the authenticated user's profile
* React authentication state management
* React Router page routing
* Shared and responsive navigation
* Responsive frontend design foundation
* Consistent forms, buttons, and status messages
* Keyboard focus indicators and accessible route states
* Protected routing for the authenticated user's profile
* Not found page for unknown routes
* Authenticated direct conversations between users
* Automatic reuse of existing direct conversations
* Participant-only access to conversations and messages
* Cursor-paginated message history
* Validated messages with a 2,000-character limit
* UTC timestamps and indexed messaging tables
* Atomic creation of direct conversations with the first message
* Conversation lists that exclude empty conversations
* Responsive messaging inbox and conversation views
* Protected routes for conversations and new-message drafts
* First-message draft flow that avoids empty conversations
* Client-side message validation and character counting
* Persistent per-participant message read status
* Forward-only read markers with conversation-level database constraints
* Per-conversation and total unread message counts
* Explicit read-status updates without side effects in GET requests

The next development steps will focus on adding unread message indicators to the frontend navigation and messaging views, followed by further player discovery and matching functionality.