# @edgefirst-dev/core

The core of the Edge-first Stack.

## Installation

```bash
bun add @edgefirst-dev/core
```

## Usage

In your Hono server, add the `edgeRuntime` middleware

```ts
import type { Bindings } from "@edgefirst-dev/core"; // Binding types
import { edgeRuntime } from "@edgefirst-dev/core/hono"; // The middleware
import type { ServerBuild } from "@remix-run/cloudflare";
import { Hono } from "hono";
import { staticAssets } from "remix-hono/cloudflare";
import { remix } from "remix-hono/handler";

const app = new Hono<{ Bindings: Bindings }>();

app.use(async (c, next) => {
  if (process.env.NODE_ENV !== "development" || import.meta.env.PROD) {
    // @ts-expect-error
    return staticAssets()(c, next);
  }
  await next();
});

app.use(edgeRuntime()); //Add it before your Remix handler

app.use(async (c, next) => {
  let handler = remix({ build: await importServerBuild(), mode: "production" });
  return handler(c, next);
});

function importServerBuild(): Promise<ServerBuild> {
  if (process.env.NODE_ENV === "development" || import.meta.env.DEV) {
    // @ts-expect-error - TS doesn't know about virtual:remix/server-build
    return import("virtual:remix/server-build");
  }

  // @ts-expect-error - This file will not exists until we build the app
  return import("../build/server");
}

export default app;
```

Now you can import the functions from `@edgefirst-dev/core` and use it in any part of your Remix app.

### env()

The `env()` function gives you access to the environment variables in a type-safe way.

```ts
import { env } from "@edgefirst-dev/core";

let CLIENT_ID = env().fetch("CLIENT_ID"); // The value is suggested
// You can pass an optional fallback in case the variable is not set
let SESSION_SECRET = env().fetch("SESSION_SECRET", "fallback");
```

### kv()

The `kv` function gives you access to a Key-Value store powered by Cloudflare Worker KV.

```ts
import { kv } from "@edgefirst-dev/core";

// Get a list of keys
let { keys, cursor, done } = await kv().keys();

// Get a single key
let { data, meta } = await kv().get("prefix:key");

// Set a key
await kv().put("prefix:key", value, { ttl: 3600, metadata: { key: "value" } });

// Check if a key is stored
let hasKey = await kv().has("prefix:key");

// Delete a key
await kv().remove("prefix:key");
```

### fs()

The `fs` function gives you an instance of [@mjackson/file-storage](https://github.com/mjackson/file-storage) powered by Cloudflare R2.

```ts
import { fs } from "@edgefirst-dev/core";

let { keys, cursor, done } = await fs().keys();

let file = await fs().get("key");

await fs().set("key", file);

let hasFile = await fs().has("key");

await fs().remove("key");

// A Response object that can be sent to the browser
let response = await fs().serve("key");
```

The `FS#keys` and `FS#serve` methods are not available in the original library, they are custom methods added by this library.

### db()

The `db` function gives you access to a database object powered by Cloudflare D1.

This object is compatible with D1 interface so it can be used with Drizzle ORM or any other D1 compatible library.

```ts
import { db as edgeDb } from "@edgefirst-dev/core";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "~/db/schema";

export const db = drizzle(edgeDb(), { schema });
export { schema };
```

### cache()

The `cache` function gives you access to a cache object powered by Cloudflare Worker KV.

```ts
import { cache } from "@edgefirst-dev/core";

let ONE_HOUR_IN_SECONDS = 3600;

let value = await cache().fetch("key", ONE_HOUR_IN_SECONDS, async () => {
  // do something expensive and return the value
});

await cache().fetch("another-key", async () => {
  // The TTL is optional, it defaults to 60 seconds
});
```

### request()

The `request` function gives you access to the current request object.

```ts
import { request } from "@edgefirst-dev/core";

let url = new URL(request().url);
request().headers.get("Authorization");
```

### headers()

The `headers` function gives you access to the current request headers using [@mjackson/headers](https://github.com/mjackson/headers)

```ts
import { headers } from "@edgefirst-dev/core";

headers().cacheControl.maxAge;
// And other properties of the library
```

### signal()

The `signal` function gives you access to the current request signal.

```ts
import { signal } from "@edgefirst-dev/core";
signal().aborted;
```

### unstable_ai

The `unstable_ai` object gives you access to the AI services powered by Cloudflare AI.

```ts
import { unstable_ai } from "@edgefirst-dev/core";

let output = await unstable_ai().textToImage(model, inputs, options);

await unstable_ai().imageToText(model, inputs, options);
await unstable_ai().translation(model, inputs, options);
await unstable_ai().summarization(model, inputs, options);
await unstable_ai().textEmbeddings(model, inputs, options);
await unstable_ai().textGeneration(model, inputs, options);
await unstable_ai().objectDetection(model, inputs, options);
await unstable_ai().speechRecognition(model, inputs, options);
await unstable_ai().textClassification(model, inputs, options);
await unstable_ai().imageClassification(model, inputs, options);
```

> [!IMPORTANT]
> This marked as unstable because it's still in development and the API might change.

### unstable_queue

The `unstable_queue` object gives you access to a Queue publisher powered by Cloudflare Queue.

```ts
import { unstable_queue } from "@edgefirst-dev/core";
unstable_queue().enqueue(payload, options);
```

### Errors

The library may throw some errors, they can all be imported so you can handle them.

```ts
import {
  EdgeConfigError,
  EdgeContextError,
  EdgeEnvKeyError,
  EdgeRequestGeoError,
} from "@edgefirst-dev/core";
```

### Override Bindings

You can override the bindings by creating a `d.ts` file in your project with this content

```ts
import "@edgefirst-dev/core";

declare module "@edgefirst-dev/core" {
  interface Bindings {
    // Add your custom bindings here
  }
}
```

If you're using `wrangler types` to generate the types, you can make `Bindings` extends the interface generated by `wrangler types`.

## Author

- [Sergio Xalambrí](https://sergiodxa.com)
