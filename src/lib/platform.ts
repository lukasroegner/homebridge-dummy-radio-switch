
import { HomebridgePlatform } from 'homebridge-framework';
import { Configuration } from './configuration/configuration';
import { GroupController } from './controllers/group-controller';

/**
 * Represents the platform of the plugin.
 */
export class Platform extends HomebridgePlatform<Configuration> {

    /**
     * Contains a list of all group controllers.
     */
    private controllers: Array<GroupController> = new Array<GroupController>();

    /**
     * Gets the name of the plugin.
     */
    public get pluginName(): string {
        return 'homebridge-dummy-radio-switch';
    }    
    
    /**
     * Gets the name of the platform which is used in the configuration file.
     */
    public get platformName(): string {
        return 'DummyRadioSwitchPlatform';
    }

    /**
     * Is called when the platform is initialized.
     */
    public initialize() {
        this.logger.info(`Initializing platform...`);

        // Sets the API configuration
	    this.configuration.groups = this.configuration.groups || [];

        // Cycles over all configured groups and creates the corresponding controllers
        for (let groupConfiguration of this.configuration.groups) {
            if (groupConfiguration.name && groupConfiguration.switches) {

                // Checks whether the switches are configured properly
                if (groupConfiguration.switches.some(s => !s.name)) {
                    this.logger.warn(`[${groupConfiguration.name}] Switches are not configured properly.`);
                    continue;
                }
                if (groupConfiguration.switches.filter(s => s.isDefaultOn).length > 1) {
                    this.logger.warn(`[${groupConfiguration.name}] Multiple switches are set as default on. This is not a valid configuration.`);
                    continue;
                }

                // Creates a new controller for the group
                const groupController = new GroupController(this, groupConfiguration);
                this.controllers.push(groupController);
            } else {
                this.logger.warn(`Group name missing in the configuration.`);
            }
        }
    }
}
