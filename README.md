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
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* Git

Verify that .NET is installed:

```bash
dotnet --version
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

## API

The project uses a REST API built with ASP.NET Core.

Example endpoint:

```http
POST /api/profiles
```

Example request using `curl`:

```bash
curl -X POST http://localhost:5252/api/profiles \
  -H "Content-Type: application/json" \
  -d "{\"displayName\":\"Oskar\"}"
```

The API documentation will be expanded as more endpoints are added.

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

The current focus includes:

* Player profiles
* REST API development
* Database structure
* Basic backend architecture

In the future, the goal is to expand the platform with additional features for finding, connecting, and interacting with other tabletop players.
