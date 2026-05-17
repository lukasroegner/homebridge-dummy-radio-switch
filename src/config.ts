
/**
 * Represents the homebridge configuration for the plugin.
 */
export interface PlatformConfig {

    /**
     * Gets or sets the groups (i.e. accessories) that should be exposed to HomeKit/via API.
     */
    groups: Array<GroupConfig>;
}

/**
 * Represents a group of switches that acts as a radio button group.
 */
export interface GroupConfig {

    /**
     * Gets or sets the name of the group.
     */
    name: string;

    /**
     * Gets or sets a value that determines whether outlets should be exposed instead of switches.
     */
    displayAsPowerStrip: boolean;

    /**
     * Gets or sets the switches of the group.
     */
    switches: Array<SwitchConfig>;

    /**
     * Gets or sets the timeout for the timer.
     */
    timeout: number;
}

/**
 * Represents a single switch that is part of a radio button group.
 */
export interface SwitchConfig {

    /**
     * Gets or sets the name of the switch.
     */
    name: string;

    /**
     * Gets or sets a value that determines that this switch is the default on for a radio group configuration which always has an enabled option.
     */
    isDefaultOn: boolean;

    /**
     * Gets or sets the name of the switch (in the same group) that should be switched to ON if the current switch is switched OFF.
     * This overwrites the "default on" behavior.
     */
    nextOnSwitchName: string;

    /**
     * Gets or sets the timeout for the timer.
     */
    timeout: number;
}
