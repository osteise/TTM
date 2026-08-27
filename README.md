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
├── Data/
├── Models/
├── Migrations/
├── Program.cs
└── appsettings.json
```

The project structure will continue to evolve as new functionality is added.

## Prerequisites

To run the project locally, make sure you have the following installed:

* [.NET SDK](https://dotnet.microsoft.com/)
* [Node.js](https://nodejs.org/) and npm
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
 
### 5. Start frontend

To start the frontend locally, navigate to the frontend project directory:

From `frontend/tabletop-match-web`, run:

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
* Editing of the authenticated user's profile
* React authentication state management

The next development steps will focus on improving navigation and interface structure before expanding the player discovery and matching functionality.