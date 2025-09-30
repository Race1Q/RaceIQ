// Runtime API base injection helper.
// This allows deploying the same built assets across environments.
// Configure by either:
// 1. Setting a <meta name="api-base" content="https://your-api.example.com"> in index.html (injected during deploy), or
// 2. Replacing the __API_BASE_PLACEHOLDER__ token in this file as part of CI/CD.

(function () {
	if (window.__API_BASE__) return; // already set

	var meta = document.querySelector('meta[name="api-base"]');
	var fromMeta = meta && meta.getAttribute('content');
	// Token replacement pattern (e.g., using sed or build pipeline)
	var placeholder = '__API_BASE_PLACEHOLDER__';

	var chosen = fromMeta && fromMeta !== placeholder ? fromMeta : undefined;
	if (!chosen && placeholder && /^https?:\/\//.test(placeholder)) {
		chosen = placeholder; // CI replaced it
	}

	if (chosen) {
		// Normalize: trim trailing slash
		chosen = chosen.replace(/\/$/, '');
		window.__API_BASE__ = chosen;
		// eslint-disable-next-line no-console
		console.log('[api-base] Runtime API base set to', chosen);
	} else {
		// eslint-disable-next-line no-console
		console.warn('[api-base] No runtime API base provided; relying on relative /api (dev proxy only).');
	}
})();

