// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

const RNFS = require('react-native-fs');

/**
 * Games schema
 */
export const GamesSchema = {
  name: 'Games',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: {
      type: 'string',
      indexed: true,
      default: ''
    },
    winnerorderdescending: {
      type: 'bool',
      default: true
    },
    diceenabled: {
      type: 'bool',
      default: false
    },
    dicemin: {
      type: 'int',
      default: 1
    },
    dicemax: {
      type: 'int',
      default: 6
    },
    countdowntimerenabled: {
      type: 'bool',
      default: false
    },
    countdowntimerdefaultsec: {
      type: 'int',
      default: 60
    },
    matches: {
      type: 'list',
      objectType: 'Matches'
    }
  }
};

/**
 * Matches schema
 */
export const MatchesSchema = {
  name: 'Matches',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: {
      type: 'string',
      indexed: true,
      default: ''
    },
    players: {
      type: 'list',
      objectType: 'Players'
    },
    rounds: {
      type: 'list',
      objectType: 'Rounds'
    }
  }
};

/**
 * Players schema
 */
export const PlayersSchema = {
  name: 'Players',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: {
      type: 'string',
      indexed: true,
      default: ''
    }
  }
};

/**
 * Rounds schema
 */
export const RoundsSchema = {
  name: 'Rounds',
  primaryKey: 'id',
  properties: {
    id: 'string',
    date: {
      type: 'date',
      indexed: true,
      default: new Date()
    },
    isopen: {
      type: 'bool',
      default: true
    },
    players: {
      type: 'list',
      objectType: 'Players'
    },
    points: {
      type: 'list',
      objectType: 'Points'
    }
  }
};

/**
 * Points schema
 */
export const PointsSchema = {
  name: 'Points',
  primaryKey: 'id',
  properties: {
    id: 'string',
    date: {
      type: 'date',
      indexed: true,
      default: new Date()
    },
    point: {
      type: 'int',
      default: 0
    },
    player: {
      type: 'Players'
    }
  }
};

/**
 * database options
 */
export const databaseOptions = {
  path: `${RNFS.DocumentDirectoryPath}/db.realm`,
  schema: [
    GamesSchema,
    MatchesSchema,
    PlayersSchema,
    RoundsSchema,
    PointsSchema
  ],
  deleteRealmIfMigrationNeeded: true,
  schemaVersion: 1,
  shouldCompactOnLaunch: () => true
};

/**
 * export default
 */
export default { databaseOptions };
