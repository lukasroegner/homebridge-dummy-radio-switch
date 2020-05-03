
import { Platform } from '../platform';
import { Homebridge, Characteristic } from 'homebridge-framework';
import { GroupConfiguration } from '../configuration/group-configuration';
import { SwitchConfiguration } from '../configuration/switch-configuration';

/**
 * Represents a controller for a single group. A group consists of multiple switches and acts as a radio button group.
 */
export class GroupController {

    /**
     * Initializes a new GroupController instance.
     * @param platform The plugin platform.
     * @param groupConfiguration The configuration of the group that is represented by this controller.
     */
    constructor(private platform: Platform, private groupConfiguration: GroupConfiguration) {
        platform.logger.info(`[${groupConfiguration.name}] Initializing...`);

        // Creates the accessory
        const accessory = platform.useAccessory(groupConfiguration.name, `${groupConfiguration.name}-group`);
        accessory.setInformation({
            manufacturer: 'Switch',
            model: 'Radio Group',
            serialNumber: groupConfiguration.name,
            firmwareRevision: null,
            hardwareRevision: null
        });

        // Creates all switches of the controller
        for (let switchConfiguration of groupConfiguration.switches) {
            platform.logger.info(`[${groupConfiguration.name}] Adding switch ${switchConfiguration.name}`);

            // Creates the service and characteristic
            const switchService = accessory.useService(Homebridge.Services.Switch, switchConfiguration.name, `${switchConfiguration.name}-switch`);
            const onCharacteristic = switchService.useCharacteristic<boolean>(Homebridge.Characteristics.On);
            this.onCharacteristics.push({
                configuration: switchConfiguration,
                characteristic: onCharacteristic
            });

            // Subscribes for changes of the switch state
            onCharacteristic.valueChanged = newValue => {
                if (onCharacteristic.value !== newValue) {
                    platform.logger.info(`[${groupConfiguration.name}] switch ${switchConfiguration.name} changed to ${newValue}`);
                   
        for (let x of this.onCharacteristics) {
            console.log(x.configuration.name + " " + x.characteristic.value);
        }

                    // Checks if there are already switches which are on
                    const otherOnCharacteristics = this.onCharacteristics.filter(c => c.configuration.name !== switchConfiguration.name && c.characteristic.value);
                    for (let otherOnCharacteristic of otherOnCharacteristics) {
                        otherOnCharacteristic.characteristic.value = false;
                    }

                    // Ensures the default on switch
                    onCharacteristic.value = newValue;
                    this.ensureDefaultOn();
                }
            };
        }

        // Initially checks for the default on
        this.ensureDefaultOn();
    }

    /**
     * Contains the characteristics of all switches and their configurations.
     */
    private onCharacteristics = new Array<{ configuration: SwitchConfiguration, characteristic: Characteristic<boolean> }>();

    /**
     * Ensures that if a default on switch exists, it is turned on if all switches are off.
     */
    private ensureDefaultOn() {

        // Gets the default on characteristic
        const defaultOnCharacteristic = this.onCharacteristics.find(c => c.configuration.isDefaultOn);
        if (!defaultOnCharacteristic) {
            return;
        }

        for (let x of this.onCharacteristics) {
            console.log(x.configuration.name + " " + x.characteristic.value);
        }

        // Checks if currently all switches are off
        if (this.onCharacteristics.some(c => c.characteristic.value)) {
            return;
        }

        // Turns on the default characteristic
        this.platform.logger.info(`[${this.groupConfiguration.name}] default on activated`);
        setTimeout(() => defaultOnCharacteristic.characteristic.value = true, 50);
    }
}
