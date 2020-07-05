
import { SwitchConfiguration } from './switch-configuration';

/**
 * Represents a group of switches that acts as a radio button group.
 */
export interface GroupConfiguration {

    /**
     * Gets or sets the name of the group.
     */
    name: string;

    /**
     * Gets or sets the switches of the group.
     */
    switches: Array<SwitchConfiguration>;

    /**
     * Gets or sets the timeout for the timer.
     */
    timeout: number;
}
