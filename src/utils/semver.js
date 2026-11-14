/**
 * Semantic version parsing and comparison utility.
 * Follows SemVer 2.0.0 specification for precedence.
 */

export function parseSemver(v) {
  if (!v) return null;
  const clean = String(v).trim().replace(/^v/, '');
  const match = clean.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/);
  if (!match) {
    const numMatch = clean.match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
    if (!numMatch) return null;
    return {
      major: parseInt(numMatch[1], 10),
      minor: parseInt(numMatch[2] || '0', 10),
      patch: parseInt(numMatch[3] || '0', 10),
      prerelease: null
    };
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || null
  };
}

export function compareSemver(v1, v2) {
  const s1 = parseSemver(v1);
  const s2 = parseSemver(v2);
  if (!s1 && !s2) return 0;
  if (!s1) return -1;
  if (!s2) return 1;

  if (s1.major !== s2.major) return s1.major > s2.major ? 1 : -1;
  if (s1.minor !== s2.minor) return s1.minor > s2.minor ? 1 : -1;
  if (s1.patch !== s2.patch) return s1.patch > s2.patch ? 1 : -1;

  // A normal version has higher precedence than a pre-release version of the same major.minor.patch
  // e.g. 2.23.23 > 2.23.23-beta.1
  if (!s1.prerelease && s2.prerelease) return 1;
  if (s1.prerelease && !s2.prerelease) return -1;
  if (!s1.prerelease && !s2.prerelease) return 0;

  // Both have pre-release identifiers: compare dot-separated parts
  const p1Parts = s1.prerelease.split('.');
  const p2Parts = s2.prerelease.split('.');
  const len = Math.max(p1Parts.length, p2Parts.length);
  for (let i = 0; i < len; i++) {
    const p1 = p1Parts[i];
    const p2 = p2Parts[i];
    if (p1 === undefined) return -1;
    if (p2 === undefined) return 1;
    if (p1 === p2) continue;

    const n1 = parseInt(p1, 10);
    const n2 = parseInt(p2, 10);
    const p1IsNum = !isNaN(n1) && String(n1) === p1;
    const p2IsNum = !isNaN(n2) && String(n2) === p2;

    if (p1IsNum && p2IsNum) {
      return n1 > n2 ? 1 : -1;
    }
    if (p1IsNum && !p2IsNum) return -1;
    if (!p1IsNum && p2IsNum) return 1;

    return p1.localeCompare(p2);
  }
  return 0;
}
