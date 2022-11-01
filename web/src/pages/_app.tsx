import React from "react";
import Script from "next/script";

import App from "../components/App";
import store from "../redux/store";
import { Provider } from "react-redux";
import reportWebVitals from "../reportWebVitals";
import "../styles/index.css";

export default function main() {
  return (
    <React.StrictMode>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-26610G7W1Y"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-26610G7W1Y');
        `}
      </Script>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  );
}
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
