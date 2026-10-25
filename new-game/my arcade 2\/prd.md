# Orbit — Ball Battle

## Product goal

Create a browser arena game where the player upgrades an automatically moving ball, battles bots, and earns random upgrades, ball types, and skins by opening mystery boxes. Higher player levels bring tougher bots.

The current prototype lives in `game.html` and runs as a standalone page with no build step.

## Core gameplay loop

1. Start a run unarmed as the Classic ball with the Mint appearance, no owned or equipped upgrades, 100 HP, and 200 credits for an initial box roll.
2. Watch the ball move automatically, bounce off arena walls, and deal collision damage, use knives only when unlocked and equipped; automatically shoot at the nearest bot only after unlocking Shooting. Movement cannot be controlled by the player.
3. Eliminate bots for credits; complete the round to earn XP.
4. Spend credits to open boxes and receive random rewards.
5. Clear waves, level up, and face stronger bots until health reaches zero.
6. Review the final level, wave, and eliminations, then restart.

## Combat and waves

The player starts unarmed with no upgrades equipped. Body collisions deal 12 base damage, plus 7 per Damage rank and the active type modifier, with a 0.5-second per-bot cooldown. Contact still damages the player. Knives and Shooting must be rolled, which auto-equips them; both may be used together. Bots never shoot. They move automatically in random starting directions, bounce off all four arena borders, and attack with two orbiting knives, dealing `8 + level × 2` damage per hit with a 0.55-second per-bot cooldown.

- Use a compact 400 × 300 arena with a top-down view, visible projectiles, bot health bars, and hit particles.
- Bots also move continuously, reflect their direction at each wall, and remain fully inside the arena. Their movement speed increases with player level.
- The player ball continuously moves diagonally and reflects its direction on each wall impact, staying entirely inside the arena. Speed upgrades and ball types modify its automatic movement speed.
- Start at wave 1 with three bots. Each subsequent wave adds one bot, up to ten per wave.
- A wave ends after every bot is eliminated. Allow a short break before the next wave.
- Restore 20 HP when advancing to a new wave, capped at maximum health.
- End the run at zero HP.

## Progression and difficulty

- Start at level 1 with zero XP.
- XP required for the next level: `60 + (level - 1) × 35`.
- Eliminations award credits only: `15 + level × 3`, plus Bounty bonuses.
- Completing round `r` awards `40 + r × 10 + 5 × r × (r - 1)` XP, multiplied by `1 + 0.15 × equipped Wisdom ranks` and rounded to an integer. Base XP is 50 for wave 1, 70 for wave 2, 100 for wave 3, 140 for wave 4, and 190 for wave 5.
- Leveling up grants 30 credits and restores 25 HP, capped at maximum health.
- Higher levels increase bot health, movement speed, knife damage, knife rotation speed.
- Bot health is determined when a bot spawns; other difficulty values use the current player level.

| Player level | Bot tier |
| --- | --- |
| 1–2 | Rookie |
| 3–5 | Hunter |
| 6–9 | Elite |
| 10+ | Apex |

## Mystery boxes

Boxes are the way to obtain upgrades, ball types, and skins. There is no direct upgrade purchase menu.

- Each box costs 200 credits earned through gameplay.
- The starting 200 credits cover one initial roll.
- Disable opening when the player cannot afford a box, a run is inactive, or another box is opening.
- Deduct the cost once, freeze combat, and show a visible reward reel that cycles through upgrade, ball type, and skin names for about three seconds, slowing down before highlighting the final prize.
- Award exactly one reward per box and display its name and effect. Preview entries do not award items or change the category probabilities.
- Keep the claim button disabled while the reel is spinning. Respect reduced-motion preferences by disabling the reel tick animation.
- Keep combat frozen until the player selects **Back to battle**. Preserve an existing manual pause.
- New types and skins auto-equip immediately and remain available in the loadout menu. Duplicate types or skins award 20 credits instead.
- Levels, XP, credits, wave, eliminations, ownership, and equipped loadout persist across death and browser reloads using local browser storage. Continue restarts the current wave with full health and shield; enemies and projectiles reset.

| Reward category | Chance | Selection |
| --- | --- | --- |
| Stat upgrade | 50% | Weighted rarity tier, then equal chance within that tier |
| Ball type | 25% | Equal chance among Titan, Comet, and Pulse |
| Skin | 25% | Equal chance among four unlockable skins |

### Upgrades

The box pool contains 280 upgrades across eight rarity tiers within the 50% upgrade category. Roll a rarity tier first, then select uniformly among upgrades in that tier. All stack; explicit caps are shown below. Shooting-related upgrades can be rolled before Shooting and become active when it is unlocked. The panel includes a full collection guide and a list of acquired ranks.

| Upgrade | Effect per rank |
| --- | --- |
| Damage | Add 7 knife and shot damage. |
| Attack speed | Increase knife rotation and firing speed by 20% of base. |
| Speed | Add 22 movement speed. |
| Max health | Add 30 max HP and restore 45 HP. |
| Shooting | Unlock automatic shots; later ranks add 5 shot damage. |
| Extra knives | First rank unlocks two orbiting knives; later ranks add one (maximum 14). |
| Knife reach | Extend knife orbit by 4 units (maximum +40). |
| Sharp blades | Add 6 knife damage. |
| Critical chance | Add 5% critical chance (maximum 75%). |
| Critical power | Add 25% critical damage. |
| Poison | Hits poison bots for 3 seconds: 3 damage/second per rank. |
| Fire blades | Hits burn bots for 2 seconds: 5 damage/second per rank. |
| Frost | Hits slow bots for 2 seconds, 8% per rank (maximum 60%). |
| Lifesteal | Heal for 2% of direct damage per rank (maximum 20%). |
| Regeneration | Recover 0.5 HP per second per rank. |
| Plating | Reduce incoming damage by 6% per rank (maximum 60%). |
| Dodge | Add 4% chance to evade knife hits (maximum 50%). |
| Shield | Gain 20 shield capacity per rank; refills each wave. |
| Thorns | Reflect 3 damage per rank on bot knife hits. |
| Damage aura | Deal 3 damage/second per rank to bots within 65 units. |
| Execution | Deal 15% more damage per rank to bots below 30% health. |
| Bounty | Earn 4 extra credits per kill per rank. |
| Wisdom | Earn 15% more round-completion XP per rank. |
| Salvage | Duplicate refunds increase by 15 credits per rank. |
| Wave medic | Heal 10 additional HP per rank after each wave. |
| Victory heal | Restore 2 HP per kill per rank. |
| Multishot | With Shooting: add one spread projectile (maximum 7 shots). |
| Heavy projectiles | With Shooting: increase projectile radius and add 4 shot damage per rank. |
| Piercing | With Shooting: pass through one extra bot per rank. |
| Explosive shots | With Shooting: impacts deal 5 splash damage per rank within 45 units. |

Direct knife and projectile hits apply criticals, lifesteal, poison, burn, and frost. Damage over time, aura, reflected damage, and splash do not recursively trigger these effects. Shields absorb damage after plating and refill each wave. All upgrades persist until Regen. Bot weapons remain knives only.

### Upgrade rarities

Tiers run from least to most rare in this order: Uncommon, Common, Rare, Ultra Rare, Epic, Legendary, Mythic, Secret. Each has a visible name and distinct color in the reel, reveal, guide, and equipment menu. The expandable Rarity odds panel shows tier probabilities; the guide and reward details show the specific upgrade's chance per box.

Boxes remain 50% upgrade, 25% ball type, 25% skin. Within upgrades, roll the tier first and select uniformly within that tier. Specific upgrade odds per box are `50% × tier probability ÷ upgrade count in tier`. Reel previews do not determine rewards. Ball types and skins retain their existing selection rules.

| Tier | Color | Upgrade-roll chance | Per-box tier chance | Upgrades |
| --- | --- | --- | --- | --- |
| Uncommon | #7ee39b | 40% | 20% | Damage, Speed, Max health, Knife reach, Sharp blades, Wave medic, Salvage, Heavy projectiles |
| Common | #b8c4d8 | 30% | 15% | Attack speed, Critical chance, Critical power, Thorns, Bounty, Wisdom |
| Rare | #72b6ff | 16% | 8% | Regeneration, Poison, Fire blades, Frost, Victory heal |
| Ultra Rare | #46e5ee | 8% | 4% | Plating, Dodge, Piercing, Shield |
| Epic | #c18cff | 4% | 2% | Shooting, Extra knives, Execution |
| Legendary | #ffd166 | 1.5% | 0.75% | Multishot, Lifesteal |
| Mythic | #ff7cad | 0.45% | 0.225% | Damage aura |
| Secret | #ff9466 | 0.05% | 0.025% | Explosive shots |

### Weapon appearance

Equipping or unequipping gear immediately updates the visible weapon and its name in the loadout summary. Classic uses knives, Titan uses broad cleavers, Comet uses slim daggers, and Pulse uses glowing blade shapes. These visual changes preserve the documented combat stats and hit ranges.

- Fire, Poison, Frost, Lifesteal, and Damage aura tint and glow the blades. Multiple effects show combined colored blade markings.
- The selected skin colors knife guards, outlines, and cannon accents.
- Extra knives changes blade count; Knife reach changes their orbit. Sharp blades adds an edge marking.
- Shooting adds a visible cannon; Multishot adds barrels, while Explosive shots and Piercing change muzzle colors. Removing Shooting removes the cannon.
- Each active upgrade adds a socket in its rarity color around the weapon ring, including defensive and economy upgrades. Socket visuals do not add combat effects.

### Equipment selection

- The loadout menu offers dropdowns for owned ball types and skins and a checkbox for each owned upgrade.
- Only owned equipment is selectable. Choices apply immediately during a run, including while manually paused, and are locked during box reveals or after game over.
- Every rolled upgrade auto-equips all owned ranks, including when it was previously unequipped. Repeated rolls increase owned ranks. Players can unequip it afterward.
- Equipping an upgrade activates all owned ranks; unequipping retains ownership but removes its ongoing effects. There is no limit on equipped upgrade types.
- Unequipping Max health clamps current HP to the reduced maximum. Re-equipping does not heal. Shield toggles do not refill shield; it refills on a new wave or increases from an equipped Shield reward.
- Unequipping Shooting clears existing player projectiles. Previously applied poison, burn, and frost timers expire normally; their damage and slow effects depend on currently equipped ranks.
- Rewards such as credits and prior healing are retained when the related upgrade is unequipped. Loadout and ownership persist across death and restart; Regen resets them.

### Ball types

Only one ball type is active at a time. Use the Ball type dropdown to choose any owned type, including Classic. Rolled rewards replace the current selection automatically.

| Type | Effect |
| --- | --- |
| Classic | Starting ball with balanced stats |
| Titan | 55% more damage; 22% slower movement |
| Comet | 30% faster movement; 15% less damage |
| Pulse | 50% faster firing; 20% less damage |

### Skins

Skins change the player's ball color without affecting combat stats. Mint is the starting skin. Boxes can award Solar Gold, Nebula Violet, Arctic Blue, or Rose Quartz. Use the Skin dropdown to choose any owned skin, including Mint. Rolled rewards replace the current selection automatically.

## Controls

| Input | Action |
| --- | --- |
| Automatic | Move continuously and bounce off walls |
| Automatic | Deal collision damage; use knives and shots only after unlocking and equipping them |
| Open box / Back to battle | Roll and claim rewards |
| P or Pause button | Pause or resume |

Keyboard, mouse, and touch inputs do not steer the ball or control its attacks. Losing window focus pauses combat. Pausing or opening a box freezes movement and combat.

## Interface

- Show current HP, maximum HP, wave, and elimination count above the arena.
- Show player level, XP progress, credits, bot tier, active type, skin, and upgrade ranks in the side panel.
- Show box price, category probabilities, duplicate compensation, and the run-only reward policy.
- Provide start, pause/resume, box-opening, reward-claim, and restart controls.
- Use a dark arena with a grid, bright balls, and contrasting enemy knives.
- Fit the game to the viewport height with the panel beside the arena on desktop and below it on narrow screens. Keep the arena visible; scroll long equipment and upgrade lists inside the panel.
- Preserve the arena aspect ratio without stretching or cropping. Constrain box dialogs to the viewport and allow internal scrolling. Compact the title screen on short displays.

## Acceptance criteria

- A new run begins with the documented starting state and enough credits for one box.
- The player ball moves without input, bounces off all four walls, and stays within arena bounds.
- A fresh run has no player knives or cannon. Equipped Knives adds two visible orbiting blades at rank 1, with further ranks adding blades; knife hits have a 0.3-second per-bot cooldown.
- Bots use knives only and never fire projectiles.
- The player fires no projectiles until Shooting is rolled from a box. Once unlocked, shots automatically target the nearest bot.
- Keyboard, mouse, and touch cannot steer the ball.
- Hits, eliminations, and game over work during automatic battles.
- Clearing a wave advances the wave and heals the player without exceeding maximum HP.
- Killing a bot awards no XP. Finishing a round awards XP exactly once, increasing faster with higher wave numbers.
- Earning enough round-completion XP increases the player level, grants the level reward, and raises bot difficulty.
- A box deducts exactly 200 credits and awards one reward according to the documented probabilities.
- Stat upgrades stack, ball types affect gameplay, and skins affect appearance only.
- Duplicate types or skins grant exactly 20 credits.
- No combat or damage occurs while paused or during a box reveal.
- Death, Continue, and reload retain level, XP, credits, wave, eliminations, ownership, and equipment.
- Regen remains locked until all 280 upgrades, 4 ball types, and 655 skins are owned.
- Confirmed Regen clears progression and equipment, restores 200 starting credits, and increments the saved Regen count.

## Current validation status

HTML parsing and referenced element IDs have been checked. Browser gameplay, touch controls, reward outcomes, and difficulty balance still require interactive testing.

## Saved progression and Regen

Progress saves automatically in this browser. Health, active enemies, and projectiles are not saved. Continue restores full health and equipped shield capacity while restarting the current wave. Saving failures show a message; progress then remains available only in the open page.

Unlock all 939 collection entries (at least rank 1 of every upgrade plus all types and skins) to enable Regen. Equipping every item or reaching rank caps is not required. The panel shows collection progress and Regen count. Regen is optional and requires confirmation, then resets level, XP, credits, eliminations, wave, owned gear, and equipped choices. Start again at level 1, wave 1, unarmed with 200 credits. The Regen count persists; no additional stat bonus is granted.

Closing during a box animation leaves the previously saved credits intact. Once the reward is revealed, both its cost and reward are saved together.

## Expanded content library

`content.js` adds exactly 1,000 entries with stable save-compatible IDs: 250 upgrade variants, 650 skins, and 100 bot profiles. Totals are 280 upgrades, 655 skins, four ball types, and 100 named bot profiles. Existing saved gear remains valid. Regen requires all 939 collectible entries; bots are opponents, not collectible rewards.

Upgrade variants combine nine material families with the original 30 effects. Each provides one, two, or three effective ranks of its base effect per equipped rank and shares that effect's rarity tier. Variants stack with the original upgrade, retain the original caps, and remain individually equippable. Category and rarity-tier chances are unchanged; specific item odds adjust to the expanded pools.

New skins have unique names and deterministic colors plus stripes, dots, rings, diamonds, or cross patterns. They appear in mystery boxes and the owned-skin selector and affect cosmetic appearance only.

Bots have unique names, colors, sizes, one to three knives, and health, speed, damage, and knife-rotation multipliers. Profiles unlock for spawning in groups of five every two player levels through level 39. Spawn uniformly among eligible profiles; all bots retain bouncing movement and knife-only attacks. The panel includes a directory with unlock levels and combat stats.

## Bot equipment follows player experience

Players at levels 1–4 face plain gray, unarmed bots. Bots still bounce and deal body-contact damage, so the player can earn XP without weapons. Saved player levels retain the corresponding bot equipment difficulty; Regen returns bots to the unarmed tier.

| Player level | Bot equipment |
| --- | --- |
| 1–4 | No weapons or cosmetic skin |
| 5–11 | Basic knives and profile colors |
| 12–21 | Twin-edge styling and patterned skins |
| 22–34 | Glowing crystal blades and patterned skins |
| 35+ | Glowing plasma blades and patterned skins |

Knife count is zero through level 4, then `min(6, 1 + floor((level - 5) / 5))`. Knife reach grows by equipment tier. Existing bots update their gear immediately on player level-up, and new bots spawn with the current tier. Weapon names and skin details are visible on the bots; the side panel describes the current equipment tier. Bots continue using melee only and never shoot.

This equipment progression overrides the earlier fixed bot blade counts; bot profile health, movement, damage, and rotation differences remain active.

## Small damage rewards

Every 20 actual HP of damage dealt to bots earns 1 credit. Fractional progress accumulates across hits and bots, survives death and reload, and resets on Regen. This applies to collisions, knives, projectiles, poison, burn, aura, thorns, and explosions through the shared damage function. Overkill and hits on already defeated bots earn nothing extra. Splitting damage into rapid hits does not increase the payout. Existing elimination and level-up rewards remain unchanged; boxes still cost 200 credits.

Bot upgrades now require longer XP progression: the first weapon unlocks at level 5 (450 cumulative XP), skins at level 12, crystal weapons at level 22, and plasma at level 35. The difficulty panel shows the next gear milestone and XP remaining. Player leveling requirements, rewards, and saves are unchanged. Bot profile unlocks slow to five additional profiles every two levels, with all profiles available at level 39.

## Ball name

Players can name their ball using a field in the loadout panel. Names support up to 24 characters; blank names display as My Ball. Render names as text above the player's ball and in the loadout summary. Save the name in browser storage and preserve it after death, reload, and Regen. Older saves default to My Ball. Typing in the name field must not activate the P pause shortcut.

## Skin-colored impact stains

Damage to actual health leaves small splatters on the arena floor in the injured ball's skin color, captured at impact time. Bot stains use the bot's equipment skin color, without poison/burn/frost tint overrides. Player stains use the selected skin. Dodges, fully shield-blocked hits, and zero-damage hits leave no stains. Lethal hits produce larger splatters.

Stains last 20 seconds of active gameplay, fading over the final two seconds. They remain underneath combatants across waves and freeze while paused or opening boxes. A new battle or Regen clears the arena stains; they are not saved across reloads. Continuous damage creates at most one regular stain per victim every 0.15 seconds to keep rendering responsive.

## Round-based experience

XP is awarded once at the end of the wave-clear break when the living player advances to the next round. Individual kills grant no XP; damage and elimination credit rewards remain unchanged. Defeat before round completion awards no round XP. Round advancement and the XP reward save together, preventing repeated rewards after a reload. Wisdom affects round XP, including its equipped variants. Level-up rewards and bot equipment milestones are unchanged.

## Batch box opening

Offer Open 1, 5, 10, 15, and 20 at 200 credits per box. Require the full batch cost before opening. Deduct the full amount once, then display a separate numbered reel for every box in a responsive grid. All reels spin, slow down, and reveal their rewards simultaneously in one animation cycle, regardless of batch size.

Each reward card shows its prize, rarity color, effect, and duplicate refund when applicable. All rewards use independent category and rarity rolls. Combat remains frozen and claiming stays disabled until every result is revealed. Save the full cost and all rewards together after the reveal; reloading mid-animation restores the previous saved balance and awards no partial batch. The dialog scrolls internally on smaller screens.

## Automatic reward equipment

Every revealed box reward auto-equips immediately. Upgrade rewards activate all owned ranks, even if previously unequipped. Ball types and skins become the active selection; duplicate types and skins also equip and still grant their credit refund. Batch rewards apply in numbered box order, so the last type and last skin rolled become active; all upgrade rewards stay equipped together. Changes save with the reward and remain manually editable afterward.

Higher waves award progressively more XP using `40 + 10w + 5w(w - 1)` before Wisdom bonuses. The arena HUD shows the exact completion reward for the current wave, including equipped Wisdom. Rewards still require completing the wave; kills award no XP.

## Local server

Run `python3 server.py` and open `http://127.0.0.1:8000` for the title screen. The Python standard-library server serves game assets on loopback only and supports `--port`. This is static hosting, not multiplayer or server-side accounts. Progress remains browser-local and is specific to the URL origin; file-based and HTTP saves are separate.
