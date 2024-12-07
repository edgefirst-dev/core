---
title: Directory Structure
---

# Directory Structure

The directory structure of an Edge-first application is similar to a typical Cloudflare Worker project. Here's an example of a typical directory structure for an Edge-first application:

```
my-app/
├── worker.ts
├── app/
│   ├── assets/
│   ├── clients/
│   ├── components/
│   ├── entities/
│   ├── helpers/
│   ├── jobs/
│   ├── mocks/
│   ├── repositories/
│   ├── resources/
│   ├── services/
│   ├── tasks/
│   ├── views/
|   |   ├── layouts/
├── config/
|   ├── redirects.ts
├── db/
|   ├── helpers/
|   ├── migrations/
|   ├── schema.ts
|   ├── seed.sql
├── scripts/
```

Here's a brief overview of each directory:

- `app/`: Contains the main application code.
  - `assets/`: Contains static assets like images, fonts, and stylesheets.
  - `clients/`: Contains API clients.
  - `components/`: Contains reusable UI components.
  - `entities/`: Contains domain entities.
  - `helpers/`: Contains utility functions.
  - `jobs/`: Contains background jobs.
  - `mocks/`: Contains mock data for testing.
  - `repositories/`: Contains data access logic.
  - `resources/`: Contains configuration files.
  - `services/`: Contains business logic.
  - `tasks/`: Contains scheduled tasks.
  - `views/`: Contains view templates.
    - `layouts/`: Contains layout templates.
- `config/`: Contains configuration files.
  - `redirects.ts`: Contains URL redirect rules.
- `db/`: Contains database-related files.
  - `helpers/`: Contains database helper functions.
  - `migrations/`: Contains database migration scripts.
  - `schema.ts`: Contains the database schema definition.
  - `seed.sql`: Contains seed data for the database.
- `scripts/`: Contains utility scripts.
