import type { Characteristic, CharacteristicValue, Service } from 'homebridge';

import { SwitchConfig } from './config.js';
import { Group } from './group.js';

/**
 * Represents a switch of a group that manages its own service.
 */
export class Switch {

    /**
     * Initializes a new Switch instance.
     * @param group The parent group.
     * @param config The configuration of the switch.
     */
    constructor(
        public readonly group: Group,
        public readonly config: SwitchConfig,
    ) {

        // Makes sure the timeout is configured properly
        if (config.timeout && typeof config.timeout !== 'number') {
            group.platform.log.warn(`Switch ${config.name} in group ${group.config.name} has an invalid timeout configured, please fix the configuration and restart Homebridge.`);
            return;
        }

        // Makes sure that the "nextOnSwitchName" properties are valid
        if (config.nextOnSwitchName) {

            if (config.nextOnSwitchName === config.name) {
                group.platform.log.warn(`Switch ${config.name} in group ${group.config.name} references itself via nextOnSwitchName, please fix the configuration and restart Homebridge.`);
                return;
            }

            if (!group.config.switches.some(s => s.name === config.nextOnSwitchName)) {
                group.platform.log.warn(`Switch ${config.name} in group ${group.config.name} has an invalid nextOnSwitchName property, please fix the configuration and restart Homebridge.`);
                return;
            }
        }

        let service: Service | undefined;

        // If the user wants to display the group as a power strip, the "Outlet" service has to be used instead of the "Switch" service
        if (group.config.displayAsPowerStrip) {
            service = group.accessory.getServiceById(group.platform.api.hap.Service.Outlet, `${config.name}-outlet`);
            if (!service) {
                service = group.accessory.addService(group.platform.api.hap.Service.Outlet, config.name, `${config.name}-outlet`);
                service.setCharacteristic(group.platform.api.hap.Characteristic.Name, config.name);
                service.setCharacteristic(group.platform.api.hap.Characteristic.ConfiguredName, config.name);
            } else {

                // Removes the service from the cache as it is now used by this switch
                group.cachedServices.delete(`${config.name}-outlet`);
            }
        } else {
            service = group.accessory.getServiceById(group.platform.api.hap.Service.Switch, `${config.name}-switch`);
            if (!service) {
                service = group.accessory.addService(group.platform.api.hap.Service.Switch, config.name, `${config.name}-switch`);
                service.setCharacteristic(group.platform.api.hap.Characteristic.Name, config.name);
                service.setCharacteristic(group.platform.api.hap.Characteristic.ConfiguredName, config.name);
            } else {

                // Removes the service from the cache as it is now used by this switch
                group.cachedServices.delete(`${config.name}-switch`);
            }
        }

        this.service = service;

        // Finally, the handlers are being configured
        this.onCharacteristic = this.service.getCharacteristic(group.platform.api.hap.Characteristic.On);
        this.onCharacteristic.onSet(this.onSet.bind(this));
    }

    /**
     * Contains the service of the switch.
     */
    public readonly service!: Service;

    /**
     * Contains the "On" characteristic of the switch.
     */
    public readonly onCharacteristic!: Characteristic;

    /**
     * Is called when the value of the "On" characteristic changes.
     * @param value The new value.
     */
    private onSet(value: CharacteristicValue): void {
        if (this.onCharacteristic.value === value) {
            return;
        }

        this.group.platform.log.info(`Value of switch ${this.config.name} in group ${this.group.config.name} changed to ${value}`);

        // Checks if there are already switches which are on
        const otherOnSwitches = this.group.switches.filter(s => s !== this && s.onCharacteristic.value);
        for (const otherOnSwitch of otherOnSwitches) {
            otherOnSwitch.onCharacteristic.updateValue(false);
        }

        // Clears the previous timeout
        this.group.clearTimeout();

        this.onCharacteristic.value = value;

        // When switching on, the timeout for switching off is set
        if (value) {

            // If this switch is the default, to prevent a loop (default switch is switched off after timeout, then switched on as it is the default), the timeout is not set
            if (!this.config.isDefaultOn) {
                this.group.setTimeout(this);
            }
            return;
        }

        // If the switch is turned off and a next on switch is defined, it is switched on
        if (this.config.nextOnSwitchName) {
            const nextOnSwitch = this.group.switches.find(s => s !== this && s.config.name === this.config.nextOnSwitchName);
            if (nextOnSwitch) {
                this.group.platform.log.info(`Next switch ${this.config.nextOnSwitchName} of switch ${this.config.name} in group ${this.group.config.name} activated`);
                setTimeout(() => nextOnSwitch.onCharacteristic.setValue(true), 50);
                return;
            }
        }

        // In any other case, it is ensured that the default on switch is activated
        this.group.ensureDefaultOn();
    }
}
