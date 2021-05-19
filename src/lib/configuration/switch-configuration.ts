
/**
 * Represents a single switch that is part of a radio button group.
 */
export interface SwitchConfiguration {

    /**
     * Gets or sets the name of the switch.
     */
    name: string;

    /**
     * Gets or sets a value that determines that this switch is the default on for a radio group configuration which always has an enabled option.
     */
    isDefaultOn: boolean;

    /**
     * Gets or sets the name of the switch (in the same group) that should be switched to ON if the current switch is switched OFF. This overwrites the "default on" behavior.
     */
    nextOnSwitchName: string;
}
