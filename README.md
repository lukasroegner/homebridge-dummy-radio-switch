<p align="center">

<img src="https://github.com/homebridge/branding/raw/latest/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>

<span align="center">

# Homebridge Dummy Radio Switch

</span>

Homebridge plugin that exposes a radio button selection with dummy switches.

Each "radio group" can have several switches, only one switch can be enabled at a time. If a switched is turned ON, all other switches are turned OFF.

## Installation

It is recommended to use Homebridge UI for installing and managing the plugin. To install it manually, use:

```
npm install -g homebridge-dummy-radio-switch
```

## Configuration

It is recommended to use Homebridge UI for configuration of the plugin. To do it manually, stick to the following template:

```json
{
    "platforms": [
        {
            "name": "homebridge-dummy-radio-switch",
            "platform": "DummyRadioSwitchPlatform",
            "groups": [
                {
                    "name": "<GROUP-NAME>",
                    "displayAsPowerStrip": false,
                    "switches": [
                        {
                            "name": "<SWITCH-NAME-1>",
                            "isDefaultOn": false,
                            "timeout": 0,
                            "nextOnSwitchName": null
                        },
                        {
                            "name": "<SWITCH-NAME-2>",
                            "isDefaultOn": false,
                            "timeout": 0,
                            "nextOnSwitchName": null
                        }
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

**displayAsPowerStrip**: If set to `true`, outlets instead of switches are exposed to HomeKit. This provides a more compact UI in the Apple Home app. Defaults to `false`.

**switches**: Array of all switches of the group.

**name**: The name of the switch.

**isDefaultOn** (optional): A single switch in a group can be defined as the "default on". If a switch in a group has this property set to `true`, the group acts as a radio button group that **always** has one option "selected". This means if all switches are set to OFF, the switch that is marked as "default on" is set to ON.

**nextOnSwitchName** (optional): The name of the switch (in the same group) that should be switched to ON if the current switch is switched OFF. This overwrites the "default on" behavior.

**timeout** (optional): If a value is set (in seconds), a timer is started when the "selection" changes. When the timer elapses, the "selection" is reset to the button that is marked as `isDefaultOn`. If no `isDefaultOn` button is provided, all are switched off. You can set a per-group timeout or multiple per-switch timeout values.

## Development

The following sections provide useful information on how to modify the plugin.

### Setup Development Environment

To develop Homebridge plugins you must have Node.js 22 or later installed, and a modern code editor such as [VS Code](https://code.visualstudio.com/). This plugin uses [TypeScript](https://www.typescriptlang.org/) to make development easier and comes with pre-configured settings for [VS Code](https://code.visualstudio.com/) and ESLint. If you are using VS Code install these extensions:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

### Install Development Dependencies

Using a terminal, navigate to the project folder and run this command to install the development dependencies:

```shell
npm install
```

### Build Plugin

TypeScript needs to be compiled into JavaScript before it can run. The following command will compile the contents of the [`src`](./src) directory and put the resulting code into the `dist` folder.

```shell
npm run build
```

### Link To Homebridge

Run this command so your global installation of Homebridge can discover the plugin in your development environment:

```shell
npm link
```

You can now start Homebridge, use the `-D` flag, so you can see debug log messages in your plugin:

```shell
homebridge -D
```

### Watch For Changes and Build Automatically

If you want to have the code compile automatically as you make changes, and restart Homebridge automatically between changes, you first need to add the plugin as a platform in `./test/config.json`:
```
{
    "platforms": [
        {
            "name": "Config",
            "port": 8581,
            "platform": "config"
        },
        {
            "name": "homebridge-dummy-radio-switch",
            "platform": "DummyRadioSwitchPlatform"
        }
    ]
}
```

and then you can run:

```shell
npm run watch
```

This will launch an instance of Homebridge in debug mode which will restart every time you make a change to the source code. It will load the config stored in the default location under `~/.homebridge`. You may need to stop other running instances of Homebridge while using this command to prevent conflicts. You can adjust the Homebridge startup command in the [`nodemon.json`](./nodemon.json) file.

### Versioning

Given a version number `MAJOR`.`MINOR`.`PATCH`, such as `1.4.3`, increment the:

1. **MAJOR** version when you make breaking changes to the plugin,
2. **MINOR** version when you add functionality in a backwards compatible manner, and
3. **PATCH** version when you make backwards compatible bug fixes.

You can use the `npm version` command to help you with this:

```shell
# major update / breaking changes
npm version major

# minor update / new features
npm version update

# patch / bugfixes
npm version patch
```

### Publish Package

To publish the plugin to [npm](https://www.npmjs.com/), please run:

```shell
npm publish
```
