import { component$, Slot } from "@builder.io/qwik";
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
  useLocation,
} from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";

import "./global.css";

const Body = component$(() => {
  const { params } = useLocation();
  return (
    <body lang={params.lang || 'en'}>
      <Slot/>
    </body>
  );
})

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Don't remove the `<head>` and `<body>` elements.
   */

  return (
    <QwikCityProvider>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <RouterHead />
      </head>
      <Body>
        <RouterOutlet />
        <ServiceWorkerRegister />
      </Body>
    </QwikCityProvider>
  );
});
