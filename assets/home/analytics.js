/* Optional behaviour analytics (Amplitude Browser SDK). Inert until a key is set in
   <meta name="cruxcut-amplitude-key" content="...">. Receives the same bounded events as the
   first-party counter via the "cruxcut:track" event, so both systems share one tracking plan. */
(() => {
  const key = document.querySelector('meta[name="cruxcut-amplitude-key"]')?.content?.trim();
  if (!key) return;
  if (navigator.globalPrivacyControl === true || navigator.doNotTrack === "1") return;
  const queue = [];
  let amp = null;
  const NAMES = {pageview: "Web Page Viewed", click: "Web Store Clicked", cta_view: "Web CTA Viewed", scroll: "Web Scroll Depth"};
  const forward = (d) => {
    const props = {page: d.page, source: d.source, campaign: d.campaign, method: d.method, exp: d.exp, arm: d.arm, platform: d.platform, locale: document.documentElement.lang};
    if (d.event === "click") Object.assign(props, {target: d.target, placement: d.placement});
    else if (d.event === "cta_view") props.placement = d.placement;
    else if (d.event === "scroll") props.depth = Number(String(d.placement).slice(1));
    const name = d.event === "click" && d.target === "discord" ? "Web Discord Clicked" : NAMES[d.event];
    if (name) amp.track(name, props);
  };
  window.addEventListener("cruxcut:track", (e) => (amp ? forward(e.detail) : queue.push(e.detail)));
  const s = document.createElement("script");
  s.src = "https://cdn.amplitude.com/libs/analytics-browser-2.11.10-min.js.gz";
  s.async = true;
  s.onload = () => {
    const sdk = window.amplitude;
    if (!sdk) return;
    sdk.init(key, {autocapture: {pageViews: false, sessions: true, formInteractions: false, fileDownloads: false, elementInteractions: false}, trackingOptions: {ipAddress: false}});
    const root = document.documentElement.dataset;
    const id = new sdk.Identify();
    if (root.exp) id.set("web_home_v2_arm", root.exp);
    if (root.platform) id.set("web_platform", root.platform);
    sdk.identify(id);
    amp = sdk;
    queue.splice(0).forEach(forward);
  };
  document.head.appendChild(s);
})();
