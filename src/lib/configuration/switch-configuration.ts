
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
}
