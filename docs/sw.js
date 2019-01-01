/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js");

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "images/icons/icon-128x128.png",
    "revision": "a2dc3a2a8c45f1abfc3527bf7c9df7bd"
  },
  {
    "url": "images/icons/icon-144x144.png",
    "revision": "7a8cb4cd32eb2c5b30f26ec7af264410"
  },
  {
    "url": "images/icons/icon-152x152.png",
    "revision": "6b1570e8ee320dbbbf5d73caf4994d72"
  },
  {
    "url": "images/icons/icon-192x192.png",
    "revision": "29827806a9bd49c5de218451cf4a28f8"
  },
  {
    "url": "images/icons/icon-384x384.png",
    "revision": "4d76b27f3d820c0473f66a63eb1cb579"
  },
  {
    "url": "images/icons/Icon-512.png",
    "revision": "d9a4a13109a849cb354720d009cdf583"
  },
  {
    "url": "images/icons/icon-512x512.png",
    "revision": "79a7e0a330adfe0286539ca8c32e98f9"
  },
  {
    "url": "images/icons/icon-72x72.png",
    "revision": "4167f6123d0bf5c7b8803da419a1422c"
  },
  {
    "url": "images/icons/icon-96x96.png",
    "revision": "9768a05bc16a182330d0dbcf5ad38cce"
  },
  {
    "url": "index.html",
    "revision": "1ae99fbe9890f18d23197480ce700704"
  },
  {
    "url": "manifest.json",
    "revision": "37aaece803529331ddfbb51bade5da0c"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
