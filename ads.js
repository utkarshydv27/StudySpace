/*
 * StudySpace Google AdSense Auto Ads loader.
 * Live ads stay disabled until the real publisher ID is configured.
 * Configure with the client shown in your AdSense code: ca-pub-XXXXXXXXXXXXXXXX.
 */
(() => {
  "use strict";
  const publisherId = ""; // Set this to your own ca-pub-... ID after AdSense setup.
  const enableAutoAds = false; // Change to true after the site is added/approved in AdSense.

  if (!enableAutoAds || !/^ca-pub-\d{16}$/.test(publisherId)) {
    document.documentElement.dataset.adsense = "not-configured";
    return;
  }

  if (document.querySelector('script[data-studyspace-adsense="true"]')) return;

  const script = document.createElement("script");
  script.async = true;
  script.dataset.studyspaceAdsense = "true";
  script.crossOrigin = "anonymous";
  script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" +
    encodeURIComponent(publisherId);
  script.onerror = () => {
    document.documentElement.dataset.adsense = "load-error";
  };
  script.onload = () => {
    document.documentElement.dataset.adsense = "loaded";
  };
  document.head.appendChild(script);
})();
