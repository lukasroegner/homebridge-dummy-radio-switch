
import { GroupConfiguration } from './group-configuration';

/**
 * Represents the homebridge configuration for the plugin.
 */
export interface Configuration {

    /**
     * Gets or sets the groups (i.e. accessories) that should be exposed to HomeKit/via API.
     */
    groups: Array<GroupConfiguration>;
}
