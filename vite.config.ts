import { defineConfig } from "vite";
import { qwikVite } from "@qwik.dev/core/optimizer";
import { qwikRouter } from "@qwik.dev/router/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(() => {
  return {
    plugins: [
      qwikRouter(),
      qwikVite({
        devTools: {
          imageDevTools: false,
        }
      }),
      tsconfigPaths()
    ],
    preview: {
      headers: {
        "Cache-Control": "public, max-age=600",
      },
    },
    // build: {
    //   cssMinify: 'lightningcss' as const,
    // },
    // css: {
    //   transformer: 'lightningcss' as const,
    //   lightningcss: {
    //     drafts: {
    //       nesting: true,
    //       customMedia: true
    //     }
    //   },
    // }
  };
});
