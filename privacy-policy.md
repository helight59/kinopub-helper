# Privacy Policy — Kinopub Helper

**Effective date:** 2026-02-22

Kinopub Helper (“the Extension”) is a Chrome extension that adds small **quality‑of‑life (QoL)** improvements for the **kino.pub** website.  
**Currently, the Extension implements only one feature:** switching to the **next / previous episode** using **Media Next/Previous** (Media Session handlers + a limited keyboard fallback).

This Privacy Policy explains what data the Extension collects, how it is used, and what it does **not** do.

---

## 1) Summary (plain language)

- **Right now:** the Extension **does not collect or transmit** your browsing history, location, or any other personal data to the developer or third parties.
- The Extension runs **locally** in your browser and, on kino.pub pages, can:
  - switch to the **next / previous episode** (where available),
  - handle Media Session “next/previous track” actions,
  - use a **limited keyboard fallback** for media keys if the website does not handle them.
- The Extension stores **only its settings** (enabled flag, chosen host, enabled/disabled modules) using Chrome extension storage (and may sync them via your Chrome Sync settings).
- **In the future (optional):** we may add **opt‑in** anonymous diagnostics to improve compatibility. If introduced, it will be clearly disclosed, disabled by default, and limited to the minimum necessary data.

---

## 2) Data we collect **currently**

### 2.1 Data we do **not** collect

The Extension currently does **not** collect, store, or transmit:

- browsing history (visited full URLs, page titles, search queries, timestamps);
- location data (GPS, precise location, IP address used for geolocation);
- identifiers (name, email address, account IDs);
- authentication, financial, health, or communication data;
- page content (text, images, form data) beyond what is strictly necessary to operate the player controls;
- keystroke logging (it only checks for specific **media keys**, not typed text).

The Extension also does not use third‑party analytics SDKs.

### 2.2 Extension settings (stored in Chrome storage)

The Extension stores configuration data under the key:

- `kinopubHelper.settings`

This may include:

- whether the Extension is enabled;
- the configured host/domain to run on (default: `kino.pub`);
- per‑module flags (e.g., “series-switcher” enabled/disabled).

**Purpose:** to remember your preferences and determine where the Extension should run.

**Where it is stored:**
- `chrome.storage.sync` (Chrome extension storage).  
  If you have Chrome Sync enabled, Chrome may sync these settings across your devices.

**The Extension itself does not send this data to any developer‑controlled server.**

### 2.3 Temporary in‑memory player snapshot (not stored)

To decide which episode to switch to, the Extension reads **player metadata** exposed by the kino.pub page (e.g., season list / playlist).

- This data is cached **in memory only** for a short time to avoid repeated reads.
- It is **not** written to disk by the Extension and is cleared when the page is reloaded or the extension/service worker is restarted.

---

## 3) Data we may collect **in the future (opt‑in only)**

If we introduce optional diagnostics, it will be:

- **disabled by default**,
- enabled only if you explicitly opt in,
- described in an updated Privacy Policy and in‑product disclosure.

If introduced, it may include **non‑identifying** information such as:
- extension version,
- coarse counters like “episode switch used” (without page content).

We will **not** collect:
- any URLs (paths, query strings),
- page content,
- typed text, form inputs, passwords,
- location info.

---

## 4) How the Extension works (local processing)

To provide its functionality, the Extension:

- injects a content script into allowed tabs to interact with the kino.pub player UI and page navigation;
- injects a small page‑context bridge script to read player metadata exposed on the page (via `window` variables);
- listens for Media Session actions (**nexttrack / previoustrack**) and, if needed, uses a limited keyboard fallback for:
  - `MediaTrackNext`
  - `MediaTrackPrevious`

All processing happens **locally on your device**.

---

## 5) Permissions and why they are needed

The Extension requests these Chrome permissions:

- **storage** — to save your settings (enabled flag, host, module toggles).
- **scripting** — to inject the content script on pages you allowed, so the Extension can provide QoL features on the site.
- **tabs** — to detect tab URL changes/activation and decide whether to inject on the current page.

It also uses host permissions:

- **Host permissions:** `*://kino.pub/*` and `*://*.kino.pub/*` — to run on kino.pub pages.
- **Optional host permissions:** `*://*/*` — used **only** if you change the target host in settings and grant access explicitly (Chrome will show a permission prompt).  
  The Extension does not silently run on all sites; it runs only on hosts you grant.

**Note about `web_accessible_resources`:** the internal bridge script (`bridge.js`) is marked as web‑accessible for technical reasons (so it can be injected into the page context). This does not mean the Extension collects data from all sites; the Extension injects and uses it only on hosts you granted.

---

## 6) Storage and retention

- **Settings:** stored until you change them or remove the Extension. If Chrome Sync is enabled, synced copies follow your Chrome Sync settings.
- **Runtime state:** minimal temporary state may exist in memory during operation and is cleared when the extension is reloaded or Chrome is closed.

---

## 7) Data sharing

- **Current version:** the Extension does not share user data with the developer or third parties.
- **If future diagnostics is enabled:** we will not sell personal data. Any necessary processing/sharing would be described in an updated policy.

---

## 8) Your choices and controls

- You can install/uninstall the Extension at any time via Chrome settings.
- You can enable/disable the Extension and its modules in the Extension settings.
- You can change the target host and explicitly grant/revoke site access via Chrome’s permission prompt and site permissions.

---

## 9) Changes to this policy

If we change what data the Extension collects or how it is used, we will:

- update this Privacy Policy,
- provide clear disclosure (and require opt‑in where applicable).

---

## 10) Contact

If you have questions about this Privacy Policy, contact: **helight59@gmail.com**
