/* eslint-disable global-require, no-unused-vars */

import { TabRouter, StackRouter } from 'react-navigation';

import { textOffBlack, activeColor } from '../styles';

import {
  SCREEN_DETECT,
  SCREEN_BEACON_LIST,
  SCREEN_BEACON_INFO_DETECT,
  SCREEN_BEACON_INFO_BEACONS,
  TAB_BEACONS,
  TAB_DETECT,
} from '../actions/navigation';

export const tabDetectInitialState = [
  {
    SCREEN_DETECT: {
      getScreen: () => require('../containers/screenDetect').default,
    },
    SCREEN_BEACON_INFO_DETECT: {
      getScreen: () => require('../containers/screenBeaconInfo').default,
    },
  },
  {
    initialRouteName: SCREEN_DETECT,
    navigationOptions: {
      headerTitleStyle: {
        color: textOffBlack,
      },
      headerTintColor: activeColor,
    },
  },
];

export const tabBeaconsInitialState = [
  {
    SCREEN_BEACON_LIST: {
      getScreen: () => require('../containers/screenBeaconList').default,
    },
    SCREEN_BEACON_INFO_BEACONS: {
      getScreen: () => require('../containers/screenBeaconInfo').default,
    },
  },
  {
    initialRouteName: SCREEN_BEACON_LIST,
    navigationOptions: {
      headerTitleStyle: {
        color: textOffBlack,
      },
      headerTintColor: activeColor,
    },
  },
];

export const tabInitialState = [
  {
    TAB_DETECT: {
      getScreen: () => require('../containers/tabDetect').default,
    },
    TAB_BEACONS: {
      getScreen: () => require('../containers/tabBeacons').default,
    },
  },
  {
    initialRouteName: TAB_DETECT,
    tabBarOptions: {
      activeTintColor: activeColor,
    },
  },
];

const tabRouter = TabRouter(...tabInitialState);
const tabDetectRouter = StackRouter(...tabDetectInitialState);
const tabBeaconsRouter = StackRouter(...tabBeaconsInitialState);

const emptyAction = { type: '' };
const initalState = {
  tabState: tabRouter.getStateForAction(emptyAction),
  tabDetectState: tabDetectRouter.getStateForAction(emptyAction),
  tabBeaconsState: tabBeaconsRouter.getStateForAction(emptyAction),
};

let cachedRoutes;
function tabRoutes(tabState) {
  if (!cachedRoutes) {
    const routes = tabState.routes.map((route) => {
      return route.routeName;
    });
    cachedRoutes = routes;
  }
  return cachedRoutes;
}

function flattenTabsState(tabsState) {
  return Object.entries(tabsState).reduce((obj, item) => {
    const itemData = item[1];
    // eslint-disable-next-line no-param-reassign
    obj[itemData.name] = itemData.state;
    return obj;
  }, {});
}

function updateTabsState(action, tabState, tabsState) {
  let newTabState;
  let newTabsState;

  const routes = tabRoutes(tabState);

  if (routes.includes(action.routeName)) {
    newTabState = tabRouter.getStateForAction(action, tabState);
  } else {
    const activeTab = routes[tabState.index];

    newTabsState = tabsState;
    const router = newTabsState[activeTab].router;
    const state = newTabsState[activeTab].state;

    newTabsState[activeTab].state = router.getStateForAction(action, state);
  }

  return {
    tabState: newTabState || tabState,
    ...flattenTabsState(newTabsState || tabsState),
  };
}

const navigation = (state = initalState, action) => {
  return updateTabsState(action, state.tabState, {
    TAB_DETECT: {
      router: tabDetectRouter,
      state: state.tabDetectState,
      name: 'tabDetectState',
    },
    TAB_BEACONS: {
      router: tabBeaconsRouter,
      state: state.tabBeaconsState,
      name: 'tabBeaconsState',
    },
  });
};

export default navigation;
