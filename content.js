// Stable IDs keep generated collections compatible with saved games.
const ORBIT_CONTENT = {
  expand(specs, skins, rarityGroups) {
    const upgradeEffects = {};
    const originals = specs.slice();
    const families = ['Copper', 'Silver', 'Obsidian', 'Crystal', 'Neon', 'Astral', 'Void', 'Celestial', 'Eternal'];
    for (let i = 0; i < 250; i++) {
      const [effect, name, description] = originals[i % originals.length];
      const id = `upgrade_${i}`;
      const power = 1 + Math.floor(i / originals.length) % 3;
      upgradeEffects[id] = { effect, power };
      specs.push([id, `${families[Math.floor(i / originals.length)]} ${name}`, `${power}× effective ranks of ${name} per equipped rank. ${description}`]);
      const tier = Object.keys(rarityGroups).find(key => rarityGroups[key].includes(effect));
      rarityGroups[tier].push(id);
    }
    const adjectives = ['Amber','Arctic','Aurora','Blazing','Candy','Chrome','Coral','Cosmic','Crimson','Cyber','Dawn','Deep','Electric','Emerald','Frozen','Golden','Hollow','Iridescent','Jade','Lunar','Midnight','Molten','Opal','Prismatic','Royal','Solar'];
    const finishes = ['Spark','Pearl','Storm','Flare','Prism','Bloom','Wave','Comet','Nova','Mist','Glow','Shard','Dream','Eclipse','Pulse','Frost','Ember','Halo','Mirage','Dust','Orbit','Ray','Veil','Gleam','Ripple'];
    for (let i = 0; i < 650; i++) {
      skins[`skin_${i}`] = {
        name: `${adjectives[Math.floor(i / 25)]} ${finishes[i % 25]}`,
        color: `hsl(${(i * 137.508) % 360} ${55 + i % 40}% ${48 + Math.floor(i / 40) % 30}%)`,
        pattern: i % 5
      };
    }
    const factions = ['Rust','Frost','Ember','Venom','Storm','Crystal','Shadow','Plasma','Solar','Void'];
    const classes = ['Scout','Brawler','Spinner','Guard','Duelist','Hunter','Sentinel','Reaper','Champion','Overlord'];
    const bots = Array.from({length:100}, (_, i) => ({
      id: `bot_${i}`, name: `${factions[Math.floor(i / 10)]} ${classes[i % 10]}`,
      minLevel: 1 + Math.floor(i / 5) * 2,
      health: .8 + (i % 10) * .07, speed: .8 + ((i * 3) % 10) * .045,
      damage: .85 + ((i * 7) % 10) * .045,
      rotation: .8 + ((i * 4) % 11) * .05,
      radius: 12 + i % 6, blades: 1 + i % 3,
      color: `hsl(${(i * 137.508) % 360} 80% 68%)`
    }));
    return { upgradeEffects, bots };
  }
};
