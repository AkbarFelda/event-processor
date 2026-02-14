const map = new Map();
function cooldown(key, ms) {
  const now = Date.now();
  const last = map.get(key) || 0;
  if (now - last < ms) return false;
  map.set(key, now);
  return true;
}
module.exports = { cooldown };
