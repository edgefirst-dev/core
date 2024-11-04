# EdgeKit.js

EdgeKit.js is a toolkit to helps you build on top of Cloudflare Development Platform with ease.

## Features

- Global environment access
- Key-Value Store
- Server-side Cache with TTL
- File Storage
- Database
- AI Services
- Background Jobs
- Scheduled Tasks
- Browser Rendering
- Rate Limiting
- And more things!

## Usage

Create a new Edge-first app using EdgeKit.js with the following command:

```bash
npx degit edgefirst-dev/starter-worker my-app
```

This will give you a new Cloudflare Worker project with EdgeKit.js already setup and React Router v7.

## Manual Setup

Install the toolkit:

```bash
bun add edgekitjs
```

In your Cloudflare Worker, call the `bootstrap` function and export it.

```ts
import schema from "db:schema"; // Import your Drizzle schema
import { bootstrap } from "edgekitjs/worker";

export default bootstrap({
  orm: { schema },

  rateLimit: { limit: 1000, period: 60 },

  jobs() {
    // Register your jobs here
    return [];
  },

  tasks() {
    // Schedule your tasks here
    return [];
  }

  async onRequest(request) {
    // Inside this function you can use all the functions provided by EdgeKit.js
    return new Response("Hello, World!", { status: 200 });
  },
});


declare module "edgekitjs" {
  export interface Environment {
    // Add your custom env variables or bindings here
  }

  // Override the default DatabaseSchema with your own
  type Schema = typeof schema;
  export interface DatabaseSchema extends Schema {}
}
```

Now you can import the functions from `edgekitjs` and use it in any part of your Edge-first app.

## Author

- [Sergio Xalambrí](https://sergiodxa.com)
