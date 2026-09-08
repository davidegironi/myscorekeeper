// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.
//
// WatermelonDB models. Fields are exposed with decorators so the DbModel facade
// can both write columns (setters) and read raw records through `model._raw`.

import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

/**
 * Games model
 */
export class Game extends Model {
  static table = 'games';
  static associations = {
    matches: { type: 'has_many', foreignKey: 'match_id' },
  };

  @field('name') name;
  @field('winnerorderdescending') winnerorderdescending;
  @field('diceenabled') diceenabled;
  @field('dicemin') dicemin;
  @field('dicemax') dicemax;
  @field('countdowntimerenabled') countdowntimerenabled;
  @field('countdowntimerdefaultsec') countdowntimerdefaultsec;
}

/**
 * Matches model
 */
export class Match extends Model {
  static table = 'matches';
  static associations = {
    games: { type: 'belongs_to', key: 'match_id' },
    players: { type: 'has_many', foreignKey: 'match_id' },
    rounds: { type: 'has_many', foreignKey: 'match_id' },
  };

  @field('name') name;
  @field('match_id') match_id;
}

/**
 * Players model
 */
export class Player extends Model {
  static table = 'players';
  static associations = {
    matches: { type: 'belongs_to', key: 'match_id' },
  };

  @field('name') name;
  @field('match_id') match_id;
}

/**
 * Rounds model
 */
export class Round extends Model {
  static table = 'rounds';
  static associations = {
    matches: { type: 'belongs_to', key: 'match_id' },
    points: { type: 'has_many', foreignKey: 'round_id' },
  };

  @date('date') date;
  @field('isopen') isopen;
  @field('match_id') match_id;
}

/**
 * round_players join model
 */
export class RoundPlayer extends Model {
  static table = 'round_players';
  static associations = {
    rounds: { type: 'belongs_to', key: 'round_id' },
    players: { type: 'belongs_to', key: 'player_id' },
  };

  @field('round_id') round_id;
  @field('player_id') player_id;
}

/**
 * Points model
 */
export class Point extends Model {
  static table = 'points';
  static associations = {
    players: { type: 'belongs_to', key: 'player_id' },
    rounds: { type: 'belongs_to', key: 'round_id' },
  };

  @date('date') date;
  @field('point') point;
  @field('player_id') player_id;
  @field('round_id') round_id;
}

/**
 * All model classes registered with the database
 */
export const ModelClasses = [Game, Match, Player, Round, RoundPlayer, Point];

export default ModelClasses;
