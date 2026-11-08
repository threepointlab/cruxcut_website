/* Optional behaviour analytics. Amplitude (meta cruxcut-amplitude-key) receives the same bounded
   events as the first-party counter via "cruxcut:track"; Microsoft Clarity (meta cruxcut-clarity-id)
   adds heatmaps/session replay. Each stays inert without its id; both are skipped under GPC/DNT. */
(() => {
  if (navigator.globalPrivacyControl === true || navigator.doNotTrack === "1") return;
  const meta = (name) => document.querySelector(`meta[name="${name}"]`)?.content?.trim();
  const root = document.documentElement.dataset || {};
  const clarityId = meta("cruxcut-clarity-id");
  if (clarityId && /^[a-z0-9]{6,20}$/i.test(clarityId)) {
    window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
    const c = document.createElement("script");
    c.async = true; c.src = "https://www.clarity.ms/tag/" + clarityId;
    document.head.appendChild(c);
    if (root.exp) window.clarity("set", "home_v2_arm", root.exp);
    if (root.platform) window.clarity("set", "web_platform", root.platform);
  }
  const key = meta("cruxcut-amplitude-key");
  if (!key) return;
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
    const id = new sdk.Identify();
    if (root.exp) id.set("web_home_v2_arm", root.exp);
    if (root.platform) id.set("web_platform", root.platform);
    sdk.identify(id);
    amp = sdk;
    queue.splice(0).forEach(forward);
  };
  document.head.appendChild(s);
})();
