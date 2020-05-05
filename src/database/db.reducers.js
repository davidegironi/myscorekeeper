// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

export default function reducer(state = {
  db: null
}, action) {
  switch (action.type) {
    case 'ACTION_REFRESHDB': {
      return {
        ...state,
        db: action.db
      };
    }
    default:
      break;
  }

  return state;
}
