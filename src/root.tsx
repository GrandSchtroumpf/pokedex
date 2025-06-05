import { component$, isDev } from "@qwik.dev/core";
import {
  QwikRouterProvider,
  RouterOutlet,
} from "@qwik.dev/router";
import { RouterHead } from "./components/router-head/router-head";
import { SpeculativeRulesScript, useSpeculativeRulesProvider } from "./hooks/useSpeculative";

import "./global.css";


export default component$(() => {
  useSpeculativeRulesProvider();
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Don't remove the `<head>` and `<body>` elements.
   */

  return (
    <QwikRouterProvider>
      <head>
        {!isDev && <link rel="manifest" href="/manifest.json" />}
        <RouterHead />
      </head>
      <body>
        <RouterOutlet />
        {/* <ServiceWorkerRegister /> */}
        <SpeculativeRulesScript />
      </body>
    </QwikRouterProvider>
  );
});
