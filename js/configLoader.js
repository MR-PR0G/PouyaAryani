export async function loadJson(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    return await res.json();
  } catch (err) {
    console.warn(`Could not load JSON from ${path}. Using fallbacks if available.`, err);
    return null;
  }
}

export async function loadHeroConfig() {
  return await loadJson('config/home/hero.json');
}

export async function loadAboutConfig() {
  return await loadJson('config/about/about.json');
}

export async function loadProjectsConfig() {
  const manifest = await loadJson('config/projects/manifest.json');
  if (!manifest || !Array.isArray(manifest)) return null;

  const projectPromises = manifest.map((fileName) =>
    loadJson(`config/projects/${fileName}`)
  );

  const projects = await Promise.all(projectPromises);
  const filtered = projects.filter(Boolean);
  return filtered.length > 0 ? filtered : null;
}

export async function loadSkillsConfig() {
  return await loadJson('config/skills/skills.json');
}

export async function loadAchievementsConfig() {
  const manifest = await loadJson('config/achievements/manifest.json');
  if (!manifest || !Array.isArray(manifest)) return null;

  const achievementPromises = manifest.map((fileName) =>
    loadJson(`config/achievements/${fileName}`)
  );

  const achievements = await Promise.all(achievementPromises);
  const filtered = achievements.filter(Boolean);
  return filtered.length > 0 ? filtered : null;
}

export async function loadContactConfig() {
  return await loadJson('config/contact/contact.json');
}