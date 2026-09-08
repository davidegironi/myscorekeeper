// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

import { appSchema, tableSchema } from '@nozbe/watermelondb';

/**
 * Games table
 */
const gamesSchema = tableSchema({
  name: 'games',
  columns: [
    { name: 'name', type: 'string', isIndexed: true },
    { name: 'winnerorderdescending', type: 'boolean' },
    { name: 'diceenabled', type: 'boolean' },
    { name: 'dicemin', type: 'number' },
    { name: 'dicemax', type: 'number' },
    { name: 'countdowntimerenabled', type: 'boolean' },
    { name: 'countdowntimerdefaultsec', type: 'number' },
  ],
});

/**
 * Matches table
 */
const matchesSchema = tableSchema({
  name: 'matches',
  columns: [
    { name: 'name', type: 'string', isIndexed: true },
    { name: 'match_id', type: 'string', isOptional: true },
  ],
});

/**
 * Players table
 */
const playersSchema = tableSchema({
  name: 'players',
  columns: [
    { name: 'name', type: 'string', isIndexed: true },
    { name: 'match_id', type: 'string', isOptional: true },
  ],
});

/**
 * Rounds table
 */
const roundsSchema = tableSchema({
  name: 'rounds',
  columns: [
    { name: 'date', type: 'number', isIndexed: true },
    { name: 'isopen', type: 'boolean' },
    { name: 'match_id', type: 'string', isOptional: true },
  ],
});

/**
 * round_players join table (many-to-many Rounds <-> Players)
 */
const roundPlayersSchema = tableSchema({
  name: 'round_players',
  columns: [
    { name: 'round_id', type: 'string', isOptional: true },
    { name: 'player_id', type: 'string', isOptional: true },
  ],
});

/**
 * Points table
 */
const pointsSchema = tableSchema({
  name: 'points',
  columns: [
    { name: 'date', type: 'number', isIndexed: true },
    { name: 'point', type: 'number' },
    { name: 'player_id', type: 'string', isOptional: true },
    { name: 'round_id', type: 'string', isOptional: true },
  ],
});

/**
 * Full app schema
 */
export const Schema = appSchema({
  version: 1,
  tables: [
    gamesSchema,
    matchesSchema,
    playersSchema,
    roundsSchema,
    roundPlayersSchema,
    pointsSchema,
  ],
});

export const dbName = 'myscorekeeper';

export default Schema;
