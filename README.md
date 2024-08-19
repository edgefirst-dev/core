# @edgefirst-dev/core

The core of the Edge-first Stack.

## Installation

```bash
bun add @edgefirst-dev/core
```

## Usage

In your `vite.config.ts` import `getLoadContext` from `@edgefirst-dev/core/vite` and pass it to Remix's Cloudflare plugin.

```ts
import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as cloudflare,
} from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { getLoadContext } from "@edgefirst-dev/core/vite";

export default defineConfig({
  plugins: [
    cloudflare({ getLoadContext }),

    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),

    tsconfigPaths(),
  ],
});
```

Now you can import Edge namespace from `@edgefirst-dev/core` and use it in any part of your Remix app.

```ts
import { Edge } from "@edgefirst-dev/core";

let { items, meta } = await Edge.kv().keys();
let { data, meta } = await Edge.kv().get("prefix:key");
await Edge.kv().set(
  "prefix:key",
  { date: new Date() },
  { ttl: 3600, metadata: { key: "value" } }
);
```