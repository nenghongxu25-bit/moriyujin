const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const spinePath = path.join(projectRoot, "assets", "spine", "player", "npc_young.json");
const weaponSlots = new Set(["weapon_melee_slot", "weapon_ranged_slot"]);

const data = JSON.parse(fs.readFileSync(spinePath, "utf8"));
let clearedSetup = 0;
let clearedTimelines = 0;

for (const slot of data.slots || []) {
    if (weaponSlots.has(slot.name) && Object.prototype.hasOwnProperty.call(slot, "attachment")) {
        delete slot.attachment;
        clearedSetup += 1;
    }
}

for (const animation of Object.values(data.animations || {})) {
    if (!animation || !animation.slots) {
        continue;
    }

    for (const slotName of weaponSlots) {
        if (animation.slots[slotName]) {
            delete animation.slots[slotName];
            clearedTimelines += 1;
        }
    }

    if (Object.keys(animation.slots).length === 0) {
        delete animation.slots;
    }
}

fs.writeFileSync(spinePath, JSON.stringify(data));
console.log(`cleaned ${clearedSetup} setup attachments and ${clearedTimelines} weapon attachment timelines`);
