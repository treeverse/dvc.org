/*!
 * utm-share.js: capture UTM parameters and share them across
 * dvc.org, lakefs.io and their subdomains (docs.lakefs.io, ...).
 *
 * - Same root domain (lakefs.io <-> docs.lakefs.io): shared cookie on .lakefs.io
 * - Different root domains (dvc.org <-> lakefs.io): UTMs appended to links on click
 * - Hidden inputs named utm_* are filled automatically
 * - window.getUtmData() returns the stored data for other scripts
 * - Add ?utm_debug=1 to any URL to log what the script does in the console
 *
 * Usercentrics: nothing is stored and no links are decorated until the visitor
 * consents to the service named in UC_SERVICE. UTMs from the landing URL are
 * kept in memory, so they are saved as soon as consent is given on that page.
 * If consent is withdrawn, the cookie is deleted. Supports CMP v2 (UC_UI)
 * and v3 (__ucCmp).
 *
 * Written with explicit semicolons and block comments only, so it keeps
 * working if a minifier/optimizer strips line breaks.
 */
(function () {
	"use strict";

	/* ---- Config ---- */
	var KEYS = [
		"utm_source",
		"utm_medium",
		"utm_campaign",
		"utm_term",
		"utm_content",
		"utm_id"
	];
	var SISTERS = window.UTM_SHARE_SISTERS || [
		"dvc.org",
		"lakefs.io"
	]; /* override only for testing */
	var COOKIE = "utm_data";
	var MAX_AGE_DAYS = 1;
	var MODE =
		"last"; /* 'last' = newest campaign wins, 'first' = keep the original campaign */
	var UC_SERVICE =
		"UTM Persistence"; /* Usercentrics service name (or service/template ID) that gates the cookie */
	var DEBUG = /[?&]utm_debug=1(&|$)/.test(location.search);

	function log() {
		if (DEBUG) {
			console.log.apply(
				console,
				["[utm-share]"].concat([].slice.call(arguments))
			);
		}
	}

	function onDomain(host, d) {
		return host === d || host.slice(-(d.length + 1)) === "." + d;
	}

	function rootOf(host) {
		for (var i = 0; i < SISTERS.length; i++) {
			if (onDomain(host, SISTERS[i])) return SISTERS[i];
		}
		return null;
	}

	var ROOT = rootOf(location.hostname);

	function readData() {
		var m = document.cookie.match(new RegExp("(?:^|; )" + COOKIE + "=([^;]*)"));
		if (!m) return null;
		try {
			var d = JSON.parse(decodeURIComponent(m[1]));
			if (!d.ts || Date.now() - d.ts > MAX_AGE_DAYS * 864e5) return null;
			return d;
		} catch (e) {
			return null;
		}
	}

	function writeCookie(value, maxAge) {
		var c =
			COOKIE + "=" + value + "; Path=/; Max-Age=" + maxAge + "; SameSite=Lax";
		if (ROOT) c += "; Domain=." + ROOT; /* shared with all subdomains */
		if (location.protocol === "https:") c += "; Secure";
		document.cookie = c;
	}

	function writeData(d) {
		writeCookie(encodeURIComponent(JSON.stringify(d)), MAX_AGE_DAYS * 86400);
	}

	function deleteData() {
		writeCookie("", 0);
	}

	/* ---- 1. Capture UTMs from the landing URL (memory only until consent) ---- */
	var params = new URLSearchParams(location.search);
	var incoming = {};
	var hasIncoming = false;
	KEYS.forEach(function (k) {
		var v = params.get(k);
		if (v) {
			incoming[k] = v.slice(0, 200);
			hasIncoming = true;
		}
	});

	var data = null; /* only set once consent is given */
	var consented =
		null; /* null = unknown, true/false once Usercentrics answers */

	window.getUtmData = function () {
		return data;
	};

	/* ---- 2. Usercentrics consent ---- */
	function applyConsent(given) {
		if (given === consented) return;
		consented = given;
		if (given) {
			var stored = readData();
			if (hasIncoming && (MODE === "last" || !stored)) {
				incoming.ts = Date.now();
				data = incoming;
				writeData(data);
				log("consent given, stored", data);
			} else {
				data = stored;
				log("consent given, existing", data);
			}
			fillForms();
		} else {
			data = null;
			if (document.cookie.indexOf(COOKIE + "=") !== -1) deleteData();
			log("no consent, cookie not stored");
		}
	}

	function matches(name, id) {
		return (
			(name && name.toLowerCase() === UC_SERVICE.toLowerCase()) ||
			id === UC_SERVICE
		);
	}

	function checkConsent() {
		/* CMP v3 */
		if (
			window.__ucCmp &&
			typeof window.__ucCmp.getConsentDetails === "function"
		) {
			window.__ucCmp
				.getConsentDetails()
				.then(function (details) {
					var services = (details && details.services) || {};
					var found = false;
					var given = false;
					Object.keys(services).forEach(function (id) {
						var s = services[id];
						if (matches(s.name, id)) {
							found = true;
							given = !!(s.consent && s.consent.given);
						}
					});
					if (found) applyConsent(given);
					else log('Usercentrics service "' + UC_SERVICE + '" not found');
				})
				["catch"](function (err) {
					log("Usercentrics v3 not ready", err);
				});
			return;
		}
		/* CMP v2 */
		if (
			window.UC_UI &&
			typeof window.UC_UI.getServicesBaseInfo === "function"
		) {
			if (
				typeof window.UC_UI.isInitialized === "function" &&
				!window.UC_UI.isInitialized()
			)
				return;
			var list = window.UC_UI.getServicesBaseInfo() || [];
			for (var i = 0; i < list.length; i++) {
				if (matches(list[i].name, list[i].id)) {
					applyConsent(!!(list[i].consent && list[i].consent.status));
					return;
				}
			}
			log('Usercentrics service "' + UC_SERVICE + '" not found');
		}
	}

	function checkConsentSoon() {
		setTimeout(
			checkConsent,
			50
		); /* let Usercentrics finish updating its state */
	}

	/* UC_UI_INITIALIZED: v2 + v3, UC_CONSENT: v3, UC_UI_CMP_EVENT / ucEvent: v2 */
	["UC_UI_INITIALIZED", "UC_CONSENT", "UC_UI_CMP_EVENT", "ucEvent"].forEach(
		function (ev) {
			window.addEventListener(ev, checkConsentSoon);
		}
	);
	checkConsent(); /* in case Usercentrics was already loaded */

	/* ---- 3. Append UTMs to links pointing at the other root domain ---- */
	function decorate(e) {
		if (!data) return; /* no consent: don't pass UTMs across domains */
		var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
		if (!a) return;
		var url;
		try {
			url = new URL(a.href, location.href);
		} catch (err) {
			return;
		}
		var target = rootOf(url.hostname);
		if (!target || target === ROOT)
			return; /* same root domain: the cookie covers it */
		var changed = false;
		KEYS.forEach(function (k) {
			if (data[k] && !url.searchParams.has(k)) {
				url.searchParams.set(k, data[k]);
				changed = true;
			}
		});
		if (changed) {
			a.href = url.toString();
			log("decorated", a.href);
		}
	}

	["mousedown", "touchstart", "keydown", "click", "auxclick"].forEach(
		function (ev) {
			document.addEventListener(ev, decorate, true);
		}
	);

	/* ---- 4. Fill hidden form fields (<input type="hidden" name="utm_source">) ----
	 * Without consent, only the current page's URL UTMs are used (nothing stored). */
	function fillForms(scope) {
		var src = data || incoming;
		KEYS.forEach(function (k) {
			(scope || document)
				.querySelectorAll('input[name="' + k + '"]')
				.forEach(function (input) {
					if (!input.value) input.value = src[k] || "";
				});
		});
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", function () {
			fillForms();
		});
	} else {
		fillForms();
	}
	/* late-rendered forms */
	document.addEventListener(
		"submit",
		function (e) {
			fillForms(e.target);
		},
		true
	);
})();
