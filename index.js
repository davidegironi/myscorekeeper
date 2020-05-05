// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

import 'react-native-gesture-handler';

import { AppRegistry } from 'react-native';

// load settings
import { name as appName } from './app.json';

// load components
import AppMain from './src/modules/AppMain/components/AppMain';

// registry the app
AppRegistry.registerComponent(appName, () => AppMain);
