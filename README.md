# EdgeKit.js

The core of the Edge-first Stack.

## Installation

```bash
bun add edgekitjs
```

## Usage

In your Cloudflare Worker, call the `bootstrap` function and export it.

```ts
import schema from "db:schema";
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
    return new Response("Hello, World!", { status: 200 });
  },

  async onSchedule() {
    // Add your scheduled tasks here
  },
});

async function getLoadContext(request: Request) {
  let ua = UserAgent.fromRequest(request);
  let ip = IPAddress.fromRequest(request);
  return { ua, ip };
}

declare module "edgekitjs" {
  export interface Bindings {
    // Add your custom bindings here
  }

  type Schema = typeof schema;
  export interface DatabaseSchema extends Schema {}
}
```

Now you can import the functions from `edgekitjs` and use it in any part of your Remix app.

### env()

The `env` function gives you access to the environment variables in a type-safe way.

```ts
import { env } from "edgekitjs";
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
import { kv } from "edgekitjs";
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
import { fs } from "edgekitjs";
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
import { db as edgeDb } from "edgekitjs";
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

### orm()

The `orm` function gives you access to a database object powered by Cloudflare D1 and Drizzle ORM.

```ts
import { orm } from "edgekitjs";
```

> [!WARN]
> This function is memoized, so the next time you call it, it will return the same instance of the Drizzle ORM, the memoization is not taking into account the arguments of the functions.

### cache()

The `cache` function gives you access to a cache object powered by Cloudflare Worker KV.

```ts
import { cache } from "edgekitjs";
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
import { request } from "edgekitjs";

let url = new URL(request().url);
request().headers.get("Authorization");
```

### headers()

The `headers` function gives you access to the current request headers using [@mjackson/headers](https://www.npmjs.com/package/@mjackson/headers).

> [!TIP]
> Check [@mjackson's Headers documentation](https://github.com/mjackson/headers) to know what's possible with this library.

```ts
import { headers } from "edgekitjs";

headers().cacheControl.maxAge;
// And other properties of the library
```

### signal()

The `signal` function gives you access to the current request signal.

```ts
import { signal } from "edgekitjs";
signal().aborted;
```

### ai

The `ai` object gives you access to the AI services powered by Cloudflare AI.

```ts
import { ai } from "edgekitjs";
```

> [!WARNING]
> This function is memoized so the next time you call it, it will return the same instance of the AI object.

> [!IMPORTANT]
> This marked as unstable because it's still in development and the API might change.

#### AI#textToImage

The `ai().textToImage` method is used to generates images from input text. These models can be used to generate and modify images based on text prompts

```ts
let output = await ai().textToImage(model, inputs, options);
```

#### AI#imageToText

The `ai().imageToText` method is used to output a text from a given image. Image captioning or optical character recognition can be considered as the most common applications of image to text

```ts
await ai().imageToText(model, inputs, options);
```

#### AI#translation

The `ai().translation` method is used to convert a sequence of text from one language to another.

```ts
await ai().translation(model, inputs, options);
```

#### AI#summarization

The `ai().summarization` method is used to produce a shorter version of a document while preserving its important information.

```ts
await ai().summarization(model, inputs, options);
```

#### AI#textEmbeddings

The `ai().textEmbeddings` method is used to transform raw data into numerical features that can be processed while preserving the information in the original dataset.

```ts
await ai().textEmbeddings(model, inputs, options);
```

#### AI#textGeneration

The `ai().textGeneration` method is used to generate text based on a given prompt.

```ts
await ai().textGeneration(model, inputs, options);
```

#### AI#objectDetection

The `ai().objectDetection` method is used to detect instances of objects like persons, faces, license plates, or others in an image.

```ts
await ai().objectDetection(model, inputs, options);
```

#### AI#speechRecognition

The `ai().speechRecognition` method is used to convert a speech signal, typically an audio input, to text.

```ts
await ai().speechRecognition(model, inputs, options);
```

#### AI#textClassification

The `ai().textClassification` method is used to classify a text input into labels or classes.

```ts
await ai().textClassification(model, inputs, options);
```

#### AI#imageClassification

The `ai().imageClassification` method is used to classify an image input into labels or classes.

```ts
await ai().imageClassification(model, inputs, options);
```

#### AI#binding

A read-only property that gives you the Cloudflare `Ai` object used by the AI object.

```ts
let service = ai().binding;
```

> [!TIP]
> The service can be used to access the AIService directly in case you need to integrate with it.

### queue

The `queue` object gives you access to a Queue publisher powered by Cloudflare Queue.

```ts
import { queue } from "edgekitjs";
```

> [!WARNING]
> This function is memoized so the next time you call it, it will return the same instance of the queue object.

> [!IMPORTANT]
> This marked as unstable because it's still in development and the API might change.

#### Queue#enqueue

The `queue().enqueue` method is used to enqueue a payload in the queue.

```ts
await queue().enqueue(payload, options);
```

#### Queue#binding

A read-only property that gives you the Cloudflare `Queue` object used by the Queue object.

```ts
let queue = queue().binding;
```

> [!TIP]
> The queue can be used to access the Queue directly in case you need to integrate with it.

### geo

The `geo` object gives you access to the geolocation data powered by Cloudflare CDN.

```ts
import { geo } from "edgekitjs";
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

### rateLimit

The `rateLimit` object gives you access to the rate limiting object powered by Cloudflare Worker KV.

```ts
import { rateLimit } from "edgekitjs";
```

> [!WARNING]
> This function is not memoized so the next time you call it, it will return a new instance of the rate limit object.

> [!IMPORTANT]
> This marked as experimental because it's still in development and the API might change.

#### RateLimit#limit

The `rateLimit().limit` method is used to limit the number of requests per key.

```ts
await rateLimit().limit({ key });
```

#### RateLimit#reset

The `rateLimit().reset` method is used to reset the rate limit for a key.

```ts
await rateLimit().reset({ key });
```

#### RateLimit#writeHttpMetadata

The `rateLimit().writeHttpMetadata` method is used to write the rate limit metadata to the response headers.

```ts
await rateLimit().writeHttpMetadata({ key }, headers);
```

### Errors

The library may throw some errors, they can all be imported so you can handle them.

```ts
import {
  EdgeConfigError,
  EdgeContextError,
  EdgeEnvKeyError,
  EdgeRequestGeoError,
} from "edgekitjs";
```

### Override Bindings

You can override the bindings by creating a `d.ts` file in your project with this content

```ts
import "edgekitjs";

declare module "edgekitjs" {
  interface Bindings {
    // Add your custom bindings here
  }
}
```

If you're using `wrangler types` to generate the types, you can make `Bindings` extends the interface generated by `wrangler types`.

### Override Database Schema

Similarly, you can override the database schema by creating a `d.ts` file in your project with this content

```ts
import "edgekitjs";

import type * as schema from "~/db/schema"; // Your DB schema

declare module "edgekitjs" {
  interface DatabaseSchema extends schema {}
}
```

## Author

- [Sergio Xalambrí](https://sergiodxa.com)
