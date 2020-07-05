# homebridge-dummy-radio-switch
Homebridge plugin that exposes a radio button selection with dummy switches. 

Each "radio group" can have several switches, only one switch can be enabled at a time. If a switched is turned ON, all other switches are turned OFF.

## Installation

Please install the plugin with the following command:

```
npm install -g homebridge-dummy-radio-switch
```

## Configuration

```json
{
    "platforms": [
        {
            "platform": "DummyRadioSwitchPlatform",
            "groups": [
                {
                    "name": "<GROUP-NAME>",
                    "switches": [
                        {
                            "name": "<SWITCH-NAME-1>",
                            "isDefaultOn": false
                        },
                        {
                            "name": "<SWITCH-NAME-2>",
                            "isDefaultOn": false
                        },
                        ...
                    ],
                    "timeout": 0
                }
            ]
        }
    ]
}
```

**groups**: Array of all groups of switches that should be exposed to HomeKit. Each group is a separate accessory.

**name**: The name of the group, that is initially used as the display name.

**switches**: Array of all switches of the group.

**name**: The name of the switch.

**isDefaultOn** (optional): A single switch in a group can be defined as the "default on". If a switch in a group has this property set to `true`, the group acts as a radio button group that **always** has one option "selected". This means if all switches are set to OFF, the switch that is marked as "default on" is set to ON.

**timeout** (optional): If a value is set (in seconds), a timer is started when the "selection" changes. When the timer elapses, the "selection" is reset to the button that is marked as `isDefaultOn`. If no `isDefaultOn` button is provided, all are switched off.
