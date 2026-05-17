import type { PlatformAccessory, Service } from 'homebridge';

import { GroupConfig } from './config.js';
import { DummyRadioSwitchPlatform } from './platform.js';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js';
import { Switch } from './switch.js';

/**
 * Represents a group that manages all accessories and services defined by its configuration.
 */
export class Group {

    /**
     * Initializes a new Group instance.
     * @param platform The parent platform.
     * @param config The configuration of the group.
     */
    constructor(
        public readonly platform: DummyRadioSwitchPlatform,
        public readonly config: GroupConfig,
    ) {

        // Makes sure the timeout is configured properly
        if (config.timeout && typeof config.timeout !== 'number') {
            platform.log.warn(`Group ${config.name} has an invalid timeout configured, please fix the configuration and restart Homebridge.`);
            return;
        }

        // Sets up the accessory
        const uuid = platform.api.hap.uuid.generate(`${config.name}-group`);
        let accessory = platform.cachedAccessories.get(uuid);
        if (!accessory) {
            platform.log.info(`Adding new accessory for group: ${config.name}`);

            accessory = new platform.api.platformAccessory(config.name, uuid);
            platform.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        } else {

            // Removes the accessory from the cache as it is now used by this group
            platform.cachedAccessories.delete(uuid);

            // Adds all cached services to the map, so that the switches can mark cached services are used
            for (const service of accessory.services) {
                if (service.subtype) {
                    this.cachedServices.set(service.subtype, service);
                }
            }
        }

        // Sets the basic accessory information
        accessory.getService(platform.api.hap.Service.AccessoryInformation)!
            .setCharacteristic(platform.api.hap.Characteristic.Manufacturer, 'Switch')
            .setCharacteristic(platform.api.hap.Characteristic.Model, 'Radio Group')
            .setCharacteristic(platform.api.hap.Characteristic.SerialNumber, config.name);

        this.accessory = accessory;

        // Makes sure the switches property is an array
        if (!config.switches || !Array.isArray(config.switches)) {
            platform.log.warn(`Group ${config.name} has an invalid switches array, please fix the configuration and restart Homebridge.`);
            return;
        }

        // For each configured switch, a unique name and at most one default has to be provided
        const usedNames = new Array<string>();
        for (const switchConfig of config.switches) {

            if (typeof switchConfig !== 'object') {
                platform.log.warn(`Group ${config.name} has an switches array, please fix the configuration and restart Homebridge.`);
                return;
            }

            // Makes sure switches have a unique name
            if (!switchConfig.name) {
                platform.log.warn(`Group ${config.name} contains at least one switch without a name. Please fix the configuration and restart Homebridge.`);
                return;
            }

            if (usedNames.indexOf(switchConfig.name) !== -1) {
                platform.log.warn(`Group ${config.name} has multiple switches with the name ${switchConfig.name}. Please provide unique names and restart Homebridge.`);
                return;
            }

            usedNames.push(switchConfig.name);

            this.switches.push(new Switch(this, switchConfig));
        }

        // Validates that at most one switch is marked as default
        if (config.switches.filter(s => s.isDefaultOn).length > 1) {
            platform.log.warn(`Group ${config.name} has multiple switches marked as default. Please fix the configuration and restart Homebridge.`);
            return;
        }

        // Removes services that have been loaded from cache but are no longer referenced by the configuration of the user
        // Switches remove the services from the cached services map if they use them
        for (const [subtype, service] of this.cachedServices) {
            platform.log.info(`Removing existing service with subtype ${subtype} from cache: ${service.displayName}`);
            this.accessory.removeService(service);
        }

        // Initially checks for the default on
        this.ensureDefaultOn();
    }

    /**
     * Contains the handle for group timeout.
     */
    private timeoutHandle: NodeJS.Timeout | null = null;

    /**
     * Contains the accessory of this group.
     */
    public readonly accessory!: PlatformAccessory;

    /**
     * Contains a map of all services by their subtype that are read from cache.
     */
    public readonly cachedServices: Map<string, Service> = new Map();

    /**
     * Contains a list of all initialized switches.
     */
    public readonly switches: Array<Switch> = [];

    /**
     * Ensures that if a default on switch exists, it is turned on if all switches are off.
     */
    public ensureDefaultOn(): void {

        // Gets the default on switch
        const defaultOnSwitch = this.switches.find(s => s.config.isDefaultOn);
        if (!defaultOnSwitch) {
            return;
        }

        // Checks if currently all switches are off
        if (this.switches.some(s => s.onCharacteristic.value)) {
            return;
        }

        // Turns on the default on switch
        this.platform.log.info(`Default on switch ${defaultOnSwitch.config.name} in group ${this.config.name} activated`);
        setTimeout(() => defaultOnSwitch.onCharacteristic.setValue(true), 50);
    }

    /**
     * Clears the current timeout.
     */
    public clearTimeout(): void {
        this.platform.log.debug('Cleared timeout');

        if (this.timeoutHandle) {
            clearTimeout(this.timeoutHandle);
            this.timeoutHandle = null;
        }
    }

    /**
     * Sets up a new timeout for the specified switch.
     * @param switchForTimeout The switch for which the new timeout is set (if configured).
     */
    public setTimeout(switchForTimeout: Switch): void {
        if (!switchForTimeout.config.timeout && !this.config.timeout) {
            return;
        }

        this.platform.log.debug('Set timeout');

        this.timeoutHandle = setTimeout(() => switchForTimeout.onCharacteristic.setValue(false), (switchForTimeout.config.timeout || this.config.timeout) * 1000);
    }
}
