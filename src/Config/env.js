// Backwards-compatible shim.
// The canonical env loader is src/env.js (optional .env + platform env vars).
import "../env.js";

export default process.env;