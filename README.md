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

// Use the Bindings from `@edgefirst-dev/core` or extend it with your custom bindings
const app = new Hono<{ Bindings: Bindings }>();
app.use(staticAssets());

app.use(edgeRuntime()); //Add it before your Remix handler

app.use(async (c, next) => {
  let serverBuild = await importServerBuild();
  let handler = remix({
    build: serverBuild,
    mode: import.meta.env.PROD ? "production" : "development",
    getLoadContext(c) {
      return { cloudflare: { env: c.env, ctx: c.executionCtx } };
    },
  });
  return handler(c, next);
});

function importServerBuild(): Promise<ServerBuild> {
  if (process.env.NODE_ENV === "development") {
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

The `env` function gives you access to the environment variables in a type-safe way.

```ts
import { env } from "@edgefirst-dev/core";
```

> [!WARNING]
> This function is memoized so the next time you call it, it will return the same instance of the env object.

#### Env#fetch

The `env().fetch` method is used to get a value from the environment variables.

The function expects the environment variable name. If the environment variable is not set and no fallback is provided, it will throw an `EdgeEnvKeyError`.

```ts
let CLIENT_ID = env().fetch("CLIENT_ID");
```

There's a second optional parameter that can be used as a fallback value if the environment variable is not set.

```ts
let SESSION_SECRET = env().fetch("SESSION_SECRET", "fallback");
```

### kv()

The `kv` function gives you access to a Key-Value store powered by Cloudflare Worker KV.

```ts
import { kv } from "@edgefirst-dev/core";
```

> [!WARNING]
> This function is memoized so the next time you call it, it will return the same instance of the KV object.

#### KV#keys

The `kv().keys` method is used to get a list of keys in the store.

The function returns an object with the keys, a cursor to get the next page, and a boolean to know if there are more keys to fetch.

```ts
// Get a list of keys
let { keys, cursor, done } = await kv().keys();
```

In case `done` is `true` ther `cursor` will be `null`. Otherwise it will be a string that can be used to get the next page of keys.

```ts
let { keys, cursor, done } = await kv().keys({ cursor });
```

Additionally, a prefix can be provided to filter the keys.

```ts
let { keys, cursor, done } = await kv().keys("prefix", { cursor });
```

#### KV#get

The `kv().get` method is used to get a single key from the store.

The function returns an object with the data and metadata of the key.

```ts
let { data, meta } = await kv().get("prefix:key");
```

#### KV#set

The `kv().set` method is used to save a key in the store.

The function expects the key, the value, and an optional object with the TTL and metadata.

```ts
await kv().set("prefix:key", value, { ttl: 3600, metadata: { key: "value" } });
```

#### KV#has

The `kv().has` method is used to check if a key is stored.

The function returns a boolean indicating if the key is stored.

```ts
let hasKey = await kv().has("prefix:key");
```

#### KV#remove

The `kv().remove` method is used to remove a key from the store.

```ts
await kv().remove("prefix:key");
```

#### KV#binding

A read-only property that gives you the `KVNamespace` used by the KV object.

```ts
let namespace = kv().binding;
```

> [!TIP]
> The namespace can be used to access the KVNamespace directly in case you need to integrate with it.

### fs()

The `fs` function gives you an instance of [@mjackson/file-storage](https://www.npmjs.com/package/@mjackson/file-storage) powered by Cloudflare R2.

```ts
import { fs } from "@edgefirst-dev/core";
```

> [!WARNING]
> This function is memoized so the next time you call it, it will return the same instance of the FS object.

> [!TIP]
> Check [@mjackson's File Storage documentation](https://github.com/mjackson/file-storage) to know what's possible with this library.
> The `FS#keys` and `FS#serve` methods are not available in the original library, they are custom methods added by this library and therefore are documented here.

#### FS#keys

The `fs().keys` method is used to get a list of keys in the store.

```ts
let { keys, cursor, done } = await fs().keys();
```

#### FS#serve

The `fs().serve` method is used to get a response object that can be sent to the browser with the file data.

```ts
let response = await fs().serve("key");
```

#### FS#uploadHandler

The `fs().uploadHandler` method is used to create a handler that can be used to upload files to the store.

```ts
import { parseFormData } from "@mjackson/form-data-parser";

let formData = await parseFormData(request, fs().uploadHandler(["avatar"]));
```

The `uploadHandler` method expects an array of keys that will be used to store the files. Optionally, a function can be provided to get the key from the file.

```ts
let formData = await parseFormData(
  request,
  fs().uploadHandler(["avatar"], (file) => {
    return `avatar:${file.name}`;
  })
);
```

#### FS#binding

A read-only property that gives you the `R2Bucket` used by the FS object.

```ts
let bucket = fs().binding;
```

> [!TIP]
> The bucket can be used to access the R2 bucket directly in case you need to integrate with it.

### db()

The `db` function gives you access to a database object powered by Cloudflare D1.

```ts
import { db as edgeDb } from "@edgefirst-dev/core";
```

> [!WARNING]
> This function is memoized so the next time you call it, it will return the same instance of the database.

This object is compatible with D1 interface so it can be used with Drizzle ORM or any other D1 compatible library.

```ts
import { drizzle } from "drizzle-orm/d1";
import * as schema from "~/db/schema";

export const db = drizzle(edgeDb(), { schema });
export { schema };
```

#### DB#binding

A read-only property that gives you the `D1Database` used by the database object.

```ts
let database = db().binding;
```

> [!TIP]
> The database can be used to access the D1 database directly in case you need to integrate with it.

### orm(schema, logger?)

The `orm` function gives you access to a database object powered by Cloudflare D1 and Drizzle ORM.

```ts
import { orm } from "@edgefirst-dev/core";
```

> [!WARN]
> This function is memoized, so the next time you call it, it will return the same instance of the Drizzle ORM, the memoization is not taking into account the arguments of the functions.

You will need to pass the schema object of your database as the first argument.

```ts
import * as schema from "~/db/schema";

let db = orm(schema);
```

And optionally a logger object as the second argument.

```ts
let db = orm(schema, logger);
```

### cache()

The `cache` function gives you access to a cache object powered by Cloudflare Worker KV.

```ts
import { cache } from "@edgefirst-dev/core";
```

Every cached key will be prefixed by `cache:` to avoid conflicts with other keys.

> [!WARNING]
> This function is memoized so the next time you call it, it will return the same instance of the cache object.

#### Cache#fetch

The `cache().fetch` method is used to get a value from the cache or calculate it if it's not there.

The function expects the key, the TTL, and a function that will be called to calculate the value if it's not in the cache.

```ts
let ONE_HOUR_IN_SECONDS = 3600;

let value = await cache().fetch("key", ONE_HOUR_IN_SECONDS, async () => {
  // do something expensive and return the value
});
```

The TTL is optional, it defaults to 60 seconds if not provided.

```ts
await cache().fetch("another-key", async () => {
  // The TTL is optional, it defaults to 60 seconds
});
```

#### Cache#purge

The `cache().purge` method is used to remove a key from the cache.

```ts
cache().purge("key");
```

#### Cache#binding

A read-only property that gives you the `KVNamespace` used by the Cache object.

```ts
let namespace = cache().binding;
```

> [!TIP]
> The namespace can be used to access the KVNamespace directly in case you need to integrate with it.

### request()

The `request` function gives you access to the current request object.

```ts
import { request } from "@edgefirst-dev/core";

let url = new URL(request().url);
request().headers.get("Authorization");
```

### headers()

The `headers` function gives you access to the current request headers using [@mjackson/headers](https://www.npmjs.com/package/@mjackson/headers).

> [!TIP]
> Check [@mjackson's Headers documentation](https://github.com/mjackson/headers) to know what's possible with this library.

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
```

> [!WARNING]
> This function is memoized so the next time you call it, it will return the same instance of the AI object.

> [!IMPORTANT]
> This marked as unstable because it's still in development and the API might change.

#### AI#textToImage

The `unstable_ai().textToImage` method is used to generates images from input text. These models can be used to generate and modify images based on text prompts

```ts
let output = await unstable_ai().textToImage(model, inputs, options);
```

#### AI#imageToText

The `unstable_ai().imageToText` method is used to output a text from a given image. Image captioning or optical character recognition can be considered as the most common applications of image to text

```ts
await unstable_ai().imageToText(model, inputs, options);
```

#### AI#translation

The `unstable_ai().translation` method is used to convert a sequence of text from one language to another.

```ts
await unstable_ai().translation(model, inputs, options);
```

#### AI#summarization

The `unstable_ai().summarization` method is used to produce a shorter version of a document while preserving its important information.

```ts
await unstable_ai().summarization(model, inputs, options);
```

#### AI#textEmbeddings

The `unstable_ai().textEmbeddings` method is used to transform raw data into numerical features that can be processed while preserving the information in the original dataset.

```ts
await unstable_ai().textEmbeddings(model, inputs, options);
```

#### AI#textGeneration

The `unstable_ai().textGeneration` method is used to generate text based on a given prompt.

```ts
await unstable_ai().objectDetection(model, inputs, options);
```

```ts
await unstable_ai().speechRecognition(model, inputs, options);
```

```ts
await unstable_ai().textClassification(model, inputs, options);
```

```ts
await unstable_ai().imageClassification(model, inputs, options);
```

#### AI#objectDetection

The `unstable_ai().objectDetection` method is used to detect instances of objects like persons, faces, license plates, or others in an image.

```ts
await unstable_ai().objectDetection(model, inputs, options);
```

#### AI#speechRecognition

The `unstable_ai().speechRecognition` method is used to convert a speech signal, typically an audio input, to text.

```ts
await unstable_ai().speechRecognition(model, inputs, options);
```

#### AI#textClassification

The `unstable_ai().textClassification` method is used to classify a text input into labels or classes.

```ts
await unstable_ai().textClassification(model, inputs, options);
```

#### AI#imageClassification

The `unstable_ai().imageClassification` method is used to classify an image input into labels or classes.

```ts
await unstable_ai().imageClassification(model, inputs, options);
```

#### AI#binding

A read-only property that gives you the Cloudflare `Ai` object used by the AI object.

```ts
let service = unstable_ai().binding;
```

> [!TIP]
> The service can be used to access the AIService directly in case you need to integrate with it.

### unstable_queue

The `unstable_queue` object gives you access to a Queue publisher powered by Cloudflare Queue.

```ts
import { unstable_queue } from "@edgefirst-dev/core";
```

> [!WARNING]
> This function is memoized so the next time you call it, it will return the same instance of the queue object.

> [!IMPORTANT]
> This marked as unstable because it's still in development and the API might change.

#### Queue#enqueue

The `unstable_queue().enqueue` method is used to enqueue a payload in the queue.

```ts
await unstable_queue().enqueue(payload, options);
```

#### Queue#binding

A read-only property that gives you the Cloudflare `Queue` object used by the Queue object.

```ts
let queue = unstable_queue().binding;
```

> [!TIP]
> The queue can be used to access the Queue directly in case you need to integrate with it.

### unstable_geo

The `unstable_geo` object gives you access to the geolocation data powered by Cloudflare CDN.

```ts
import { unstable_geo } from "@edgefirst-dev/core";
```

This function returns an object with the geolocation data. The object conforms to the interface:

```ts
interface Geo {
  country: Iso3166Alpha2Code | "T1";
  region: string;
  city: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  timezone: string;
  metroCode: string;
  continent: ContinentCode;
  isEurope: boolean;
}
```

> [!TIP]
> The `Iso3166Alpha2Code` and `ContinentCode` are union types provided by Cloudflare Worker types package.

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
