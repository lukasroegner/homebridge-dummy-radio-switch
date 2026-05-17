import type { API, DynamicPlatformPlugin, Logging, PlatformAccessory, PlatformConfig } from 'homebridge';

import { Group } from './group.js';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js';
import { GroupConfig } from './config.js';

/**
 * Represents the platform of the plugin, which is used to build the accessories based on the user config.
 */
export class DummyRadioSwitchPlatform implements DynamicPlatformPlugin {

    /**
     * Initializes a new DummyRadioSwitchPlatform instance.
     * @param log The logging interface that can be used by the platform.
     * @param config The configuration provided by the user.
     * @param api The API to interact with Homebridge.
     */
    constructor(
        public readonly log: Logging,
        public readonly config: PlatformConfig,
        public readonly api: API,
    ) {

        this.log.debug(`Finished initializing platform: ${this.config.name}`);

        // When this event is fired it means Homebridge has restored all cached accessories from disk
        this.api.on('didFinishLaunching', () => {
            this.log.debug('Executed didFinishLaunching callback');

            // As cached accessories have been restored, the plugin can start the initialization
            this.initialize();
        });
    }

    /**
     * Contains a map of all accessories by their unique ID that are read from cache.
     */
    public readonly cachedAccessories: Map<string, PlatformAccessory> = new Map();

    /**
     * Contains a list of all initialized groups.
     */
    public readonly groups: Array<Group> = [];

    /**
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     */
    configureAccessory(accessory: PlatformAccessory): void {
        this.log.info(`Loading accessory from cache: ${accessory.displayName}`);

        // All cached accessories are stored in a map to track already registered accessories and those that are no longer in use
        this.cachedAccessories.set(accessory.UUID, accessory);
    }

    /**
     * Initializes all groups with their respective accessories based on the configuration of the user.
     */
    public initialize(): void {

        // Makes sure the groups property is an array
        if (!this.config.groups || !Array.isArray(this.config.groups)) {
            this.log.warn('Groups are not configured properly, please fix the configuration and restart Homebridge.');
            return;
        }

        const groupConfigs = this.config.groups as Array<GroupConfig>;

        // For each configured group, a new object is created that handles accessory and service lifecycle as well as the actual logic
        const usedNames = new Array<string>();
        for (const groupConfig of groupConfigs) {

            if (typeof groupConfig !== 'object') {
                this.log.warn('Groups are not configured properly, please fix the configuration and restart Homebridge.');
                continue;
            }

            // Makes sure groups have a unique name
            if (!groupConfig.name) {
                this.log.warn('At least one group does not have a name. Please fix the configuration and restart Homebridge.');
                continue;
            }

            if (usedNames.indexOf(groupConfig.name) !== -1) {
                this.log.warn(`The name ${groupConfig.name} is used by multiple groups. Please provide unique group names and restart Homebridge.`);
                continue;
            }

            usedNames.push(groupConfig.name);

            this.groups.push(new Group(this, groupConfig));
        }

        // Removes accessories that have been loaded from cache but are no longer referenced by the configuration of the user
        // Groups remove the accessories from the cached accessory map if they use them
        for (const [uuid, accessory] of this.cachedAccessories) {
            this.log.info(`Removing existing accessory with ID ${uuid} from cache: ${accessory.displayName}`);
            this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        }
    }
}
