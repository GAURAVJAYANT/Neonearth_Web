const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, 'healingRegistry.json');

class HealingRegistry {
    constructor() {
        this.cache = this.load();
    }

    load() {
        if (fs.existsSync(REGISTRY_PATH)) {
            try {
                return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
            } catch (e) {
                return {};
            }
        }
        return {};
    }

    save() {
        fs.writeFileSync(REGISTRY_PATH, JSON.stringify(this.cache, null, 2));
    }

    getHeal(oldLocator) {
        return this.cache[oldLocator];
    }

    registerHeal(oldLocator, newLocator) {
        this.cache[oldLocator] = newLocator;
        this.save();
    }
}

module.exports = new HealingRegistry();
