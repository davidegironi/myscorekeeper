// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

export default function reducer(state = {
  settings: null
}, action) {
  switch (action.type) {
    case 'ACTION_REFRESHSETTINGS': {
      return {
        ...state,
        settings: action.settings
      };
    }
    default:
      break;
  }

  return state;
}
