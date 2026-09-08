/* eslint-disable no-param-reassign */
/* eslint-disable no-console */

// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.
//
// Mini generic database model

import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

/**
 * Column definitions per table. `date` columns are stored as ms numbers.
 */
const TABLE_COLUMNS = {
  games: [
    { name: 'name', type: 'string' },
    { name: 'winnerorderdescending', type: 'bool' },
    { name: 'diceenabled', type: 'bool' },
    { name: 'dicemin', type: 'number' },
    { name: 'dicemax', type: 'number' },
    { name: 'countdowntimerenabled', type: 'bool' },
    { name: 'countdowntimerdefaultsec', type: 'number' }
  ],
  matches: [
    { name: 'name', type: 'string' },
    { name: 'match_id', type: 'string' }
  ],
  players: [
    { name: 'name', type: 'string' },
    { name: 'match_id', type: 'string' }
  ],
  rounds: [
    { name: 'date', type: 'date' },
    { name: 'isopen', type: 'bool' },
    { name: 'match_id', type: 'string' }
  ],
  round_players: [
    { name: 'round_id', type: 'string' },
    { name: 'player_id', type: 'string' }
  ],
  points: [
    { name: 'date', type: 'date' },
    { name: 'point', type: 'number' },
    { name: 'player_id', type: 'string' },
    { name: 'round_id', type: 'string' }
  ]
};

const REPO_TO_TABLE = {
  Games: 'games',
  Matches: 'matches',
  Players: 'players',
  Rounds: 'rounds',
  Points: 'points'
};

const isValid = () => true;

/**
 * Build an empty record map structure
 */
function newRecordMap() {
  const map = {};
  Object.keys(TABLE_COLUMNS).forEach((t) => { map[t] = new Map(); });
  return map;
}

/**
 * Main DbModel
 */
export class DbModel {
  constructor(props) {
    this.databaseOptions = props;
    this.database = null;
    this._records = newRecordMap();
    this._persisted = newRecordMap();
    this._persistQueued = false;

    // build repositories
    Object.keys(REPO_TO_TABLE).forEach((repoName) => {
      this[repoName] = new GenericRepository(repoName, this);
    });
  }

  /* ------------------------------------------------------------------ */
  /* lifecycle                                                          */
  /* ------------------------------------------------------------------ */

  /**
   * open a database connection (loads the graph)
   */
  async open() {
    if (this.isOpen()) { return this; }
    const adapter = new SQLiteAdapter({
      dbName: this.databaseOptions.dbName,
      schema: this.databaseOptions.schema
    });
    this.database = new Database({
      adapter,
      modelClasses: this.databaseOptions.modelClasses
    });
    await this._loadRecords();
    return this;
  }

  /**
   * close the database connection
   */
  close() {
    this.database = null;
    this._records = newRecordMap();
    this._persisted = newRecordMap();
    return true;
  }

  /**
   * check if the connection is open
   */
  isOpen() {
    return this.database != null;
  }

  /**
   * wipe all data from the database
   */
  async delete() {
    const keys = Object.keys(TABLE_COLUMNS);
    keys.forEach((t) => { this._records[t] = new Map(); });
    await this._persist();
  }

  /* ------------------------------------------------------------------ */
  /* loading                                                             */
  /* ------------------------------------------------------------------ */

  async _loadRecords() {
    this._records = newRecordMap();
    this._persisted = newRecordMap();
    const tableNames = Object.keys(TABLE_COLUMNS);
    for (let i = 0; i < tableNames.length; i += 1) {
      const t = tableNames[i];
      const coll = this.database.get(t);
      const models = await coll.query().fetch();
      for (let j = 0; j < models.length; j += 1) {
        const raw = models[j]._raw;
        const row = { id: raw.id };
        TABLE_COLUMNS[t].forEach((col) => {
          row[col.name] = this._fromRaw(col, raw[col.name]);
        });
        this._records[t].set(row.id, row);
      }
    }
    this._persisted = this._cloneRecords();
  }

  _fromRaw(col, value) {
    if (value == null) { return null; }
    if (col.type === 'bool') { return !!value; }
    if (col.type === 'date') { return value; } // ms number
    return value;
  }

  _cloneRecords() {
    const copy = newRecordMap();
    Object.keys(this._records).forEach((t) => {
      const src = this._records[t];
      const dst = copy[t];
      src.forEach((row, id) => { dst.set(id, { ...row }); });
    });
    return copy;
  }

  _toDirtyRaw(t, row) {
    const raw = { id: row.id };
    TABLE_COLUMNS[t].forEach((col) => {
      if (col.type === 'date') {
        raw[col.name] = this._normalizeDate(row[col.name]);
      } else {
        raw[col.name] = row[col.name];
      }
    });
    return raw;
  }

  _fill(rec, t, row) {
    TABLE_COLUMNS[t].forEach((col) => {
      if (col.type === 'date') {
        rec[col.name] = this._normalizeDate(row[col.name]);
      } else if (col.type === 'bool') {
        rec[col.name] = !!row[col.name];
      } else if (col.type === 'string') {
        rec[col.name] = row[col.name] == null ? '' : row[col.name];
      } else {
        rec[col.name] = row[col.name] == null ? 0 : row[col.name];
      }
    });
  }

  _normalizeDate(value) {
    if (value == null) { return new Date(0); }
    if (value instanceof Date) { return value.getTime(); }
    if (typeof value === 'number') { return value; }
    return new Date(value).getTime();
  }

  _diffRow(t, a, b) {
    return TABLE_COLUMNS[t].some((col) => {
      const av = a[col.name];
      const bv = b[col.name];
      if (col.type === 'bool') { return !!av !== !!bv; }
      if (col.type === 'date') {
        return this._normalizeDate(av) !== this._normalizeDate(bv);
      }
      if (av == null && bv == null) { return false; }
      return av !== bv;
    });
  }

  /* ------------------------------------------------------------------ */
  /* persistence                                                         */
  /* ------------------------------------------------------------------ */

  async _persist() {
    if (!this.database) { return; }
    try {
      await this.database.write(async () => {
        const batchOps = [];
        const tableNames = Object.keys(TABLE_COLUMNS);
        for (let i = 0; i < tableNames.length; i += 1) {
          const t = tableNames[i];
          const coll = this.database.get(t);
          const cur = this._records[t];
          const prev = this._persisted[t];
          // deletions
          const deletedIds = [];
          prev.forEach((value, id) => { if (!cur.has(id)) { deletedIds.push(id); } });
          for (let d = 0; d < deletedIds.length; d += 1) {
            const m = await coll.find(deletedIds[d]);
            if (m) {
              m.prepareDestroyPermanently();
              batchOps.push(m);
            }
          }
          // inserts & updates
          const createdIds = [];
          const updatedIds = [];
          cur.forEach((row, id) => {
            if (!prev.has(id)) { createdIds.push(id); }
            else if (this._diffRow(t, prev.get(id), row)) { updatedIds.push(id); }
          });
          for (let c = 0; c < createdIds.length; c += 1) {
            const row = cur.get(createdIds[c]);
            batchOps.push(coll.prepareCreateFromDirtyRaw(this._toDirtyRaw(t, row)));
          }
          for (let u = 0; u < updatedIds.length; u += 1) {
            const id = updatedIds[u];
            const row = cur.get(id);
            const m = await coll.find(id);
            if (m) {
              m.prepareUpdate((rec) => this._fill(rec, t, row));
              batchOps.push(m);
            }
          }
        }
        await this.database.batch(...batchOps);
        this._persisted = this._cloneRecords();
      });
    } catch (err) {
      // leave snapshot untouched so the next mutation retries the diff
      console.warn('MyScoreKeeper Watermelon persist failed', err);
    }
  }

  _schedulePersist() {
    if (this._persistQueued) { return; }
    this._persistQueued = true;
    Promise.resolve().then(() => {
      this._persistQueued = false;
      this._persist();
    });
  }

  /* ------------------------------------------------------------------ */
  /* query / resolver helpers                                            */
  /* ------------------------------------------------------------------ */

  _rows(t) {
    if (!this._records[t]) { this._records[t] = new Map(); }
    return this._records[t];
  }

  _dateToMs(value) {
    if (value == null) { return null; }
    if (value instanceof Date) { return value.getTime(); }
    if (typeof value === 'number') { return value; }
    return new Date(value).getTime();
  }

  _resolveGame(id) {
    const row = this._rows('games').get(id);
    if (!row) { return null; }
    const matches = [];
    this._rows('matches').forEach((m) => {
      if (m.match_id === id) {
        const resolved = this._resolveMatch(m.id);
        if (resolved) { matches.push(resolved); }
      }
    });
    return {
      id,
      name: row.name,
      winnerorderdescending: !!row.winnerorderdescending,
      diceenabled: !!row.diceenabled,
      dicemin: row.dicemin,
      dicemax: row.dicemax,
      countdowntimerenabled: !!row.countdowntimerenabled,
      countdowntimerdefaultsec: row.countdowntimerdefaultsec,
      matches,
      isValid
    };
  }

  _resolveMatch(id) {
    const row = this._rows('matches').get(id);
    if (!row) { return null; }
    const players = [];
    this._rows('players').forEach((p) => {
      if (p.match_id === id) { players.push(this._resolvePlayer(p.id)); }
    });
    const rounds = [];
    this._rows('rounds').forEach((r) => {
      if (r.match_id === id) { rounds.push(this._resolveRound(r.id)); }
    });
    return {
      id,
      name: row.name,
      players,
      rounds,
      isValid
    };
  }

  _resolvePlayer(id) {
    const row = this._rows('players').get(id);
    if (!row) { return null; }
    return { id, name: row.name, isValid };
  }

  _resolveRound(id) {
    const row = this._rows('rounds').get(id);
    if (!row) { return null; }
    const players = [];
    this._rows('round_players').forEach((rp) => {
      if (rp.round_id === id) {
        const p = this._resolvePlayer(rp.player_id);
        if (p) { players.push(p); }
      }
    });
    const points = [];
    this._rows('points').forEach((pt) => {
      if (pt.round_id === id) { points.push(this._resolvePoint(pt.id)); }
    });
    return {
      id,
      date: new Date(row.date),
      isopen: !!row.isopen,
      players,
      points,
      isValid
    };
  }

  _resolvePoint(id) {
    const row = this._rows('points').get(id);
    if (!row) { return null; }
    return {
      id,
      date: new Date(row.date),
      point: row.point,
      player: row.player_id ? this._resolvePlayer(row.player_id) : null,
      isValid
    };
  }

  /* ------------------------------------------------------------------ */
  /* graph mutation helpers (called synchronously)                       */
  /* ------------------------------------------------------------------ */

  _ensureRow(t, id) {
    const map = this._rows(t);
    if (!map.has(id)) { map.set(id, { id }); }
    return map.get(id);
  }

  _setGameFrom(item, row) {
    ['name', 'winnerorderdescending', 'diceenabled', 'dicemin', 'dicemax',
      'countdowntimerenabled', 'countdowntimerdefaultsec'].forEach((k) => {
      if (typeof item[k] !== 'undefined') { row[k] = item[k]; }
    });
  }

  _setMatchFrom(item, row) {
    if (typeof item.name !== 'undefined') { row.name = item.name; }
  }

  _setPlayerFrom(item, row) {
    if (typeof item.name !== 'undefined') { row.name = item.name; }
  }

  _setRoundFrom(item, row) {
    if (typeof item.date !== 'undefined') { row.date = this._dateToMs(item.date); }
    if (typeof item.isopen !== 'undefined') { row.isopen = !!item.isopen; }
  }

  _setPointFrom(item, row) {
    if (typeof item.date !== 'undefined') { row.date = this._dateToMs(item.date); }
    if (typeof item.point !== 'undefined') { row.point = item.point; }
    if (typeof item.player !== 'undefined') {
      row.player_id = item.player && item.player.id ? item.player.id : null;
    }
    if (typeof item.round !== 'undefined') {
      row.round_id = item.round && item.round.id ? item.round.id : null;
    }
  }

  _reconcilePlayerAdd(item) {
    const row = this._ensureRow('players', item.id);
    this._setPlayerFrom(item, row);
    if (typeof item.match_id !== 'undefined') { row.match_id = item.match_id; }
  }

  _reconcilePointAdd(item) {
    const row = this._ensureRow('points', item.id);
    this._setPointFrom(item, row);
    if (typeof item.round_id !== 'undefined') { row.round_id = item.round_id; }
  }

  _deletePlayer(pid) {
    this._rows('round_players').forEach((rp, rid) => {
      if (rp.player_id === pid) { this._rows('round_players').delete(rid); }
    });
    this._rows('points').forEach((pt, ptid) => {
      if (pt.player_id === pid) { this._rows('points').delete(ptid); }
    });
    this._rows('players').delete(pid);
  }

  _deleteRound(rid) {
    this._rows('round_players').forEach((rp, rpid) => {
      if (rp.round_id === rid) { this._rows('round_players').delete(rpid); }
    });
    this._rows('points').forEach((pt, ptid) => {
      if (pt.round_id === rid) { this._rows('points').delete(ptid); }
    });
    this._rows('rounds').delete(rid);
  }

  _deleteMatch(id) {
    this._rows('rounds').forEach((r, rid) => {
      if (r.match_id === id) { this._deleteRound(rid); }
    });
    this._rows('players').forEach((p, pid) => {
      if (p.match_id === id) { this._deletePlayer(pid); }
    });
    this._rows('matches').delete(id);
  }

  _deleteGame(id) {
    this._rows('matches').forEach((m, mid) => {
      if (m.match_id === id) { this._deleteMatch(mid); }
    });
    this._rows('games').delete(id);
  }

  /**
   * Reconcile a match's children (players / rounds). `forcedMatchId` links the
   * match to its parent game when set.
   */
  _reconcileMatch(item, forcedMatchId) {
    const id = item.id;
    const row = this._ensureRow('matches', id);
    this._setMatchFrom(item, row);
    // parent link
    let matchId = null;
    if (forcedMatchId != null) { matchId = forcedMatchId; }
    else if (typeof item.match_id !== 'undefined') { matchId = item.match_id; }
    else { matchId = row.match_id; }
    row.match_id = matchId;

    if (typeof item.players !== 'undefined' && item.players) {
      const ids = item.players.map((p) => p && p.id).filter((x) => x != null);
      this._rows('players').forEach((p, pid) => {
        if (p.match_id === id && ids.indexOf(p.id) === -1) { this._deletePlayer(pid); }
      });
      ids.forEach((pid) => {
        const prow = this._ensureRow('players', pid);
        const pitem = item.players.find((p) => p && p.id === pid);
        this._setPlayerFrom(pitem || {}, prow);
        prow.match_id = id;
      });
    }
    if (typeof item.rounds !== 'undefined' && item.rounds) {
      const rids = item.rounds.map((r) => r && r.id).filter((x) => x != null);
      this._rows('rounds').forEach((r, rid) => {
        if (r.match_id === id && rids.indexOf(r.id) === -1) { this._deleteRound(rid); }
      });
      rids.forEach((rid) => {
        const ritem = item.rounds.find((r) => r && r.id === rid);
        this._reconcileRound(ritem || {}, id);
      });
    }
  }

  /**
   * Reconcile a round's scalar fields, players (join rows) and points.
   * `matchId` links the round to its parent match when set.
   */
  _reconcileRound(item, matchId) {
    const id = item.id;
    const row = this._ensureRow('rounds', id);
    this._setRoundFrom(item, row);
    let ridMatch = null;
    if (matchId != null) { ridMatch = matchId; }
    else if (typeof item.match_id !== 'undefined') { ridMatch = item.match_id; }
    else { ridMatch = row.match_id; }
    row.match_id = ridMatch;

    if (typeof item.players !== 'undefined' && item.players) {
      const pids = item.players.map((p) => p && p.id).filter((x) => x != null);
      const jmap = this._rows('round_players');
      // remove stale join rows
      jmap.forEach((rp, rpid) => {
        if (rp.round_id === id && pids.indexOf(rp.player_id) === -1) { jmap.delete(rpid); }
      });
      // ensure join rows (and referenced players exist)
      [].forEach.call(pids, (pid) => {
        let exists = false;
        jmap.forEach((rp) => { if (rp.round_id === id && rp.player_id === pid) { exists = true; } });
        if (!exists) {
          const rid = this.Games.newid();
          jmap.set(rid, { id: rid, round_id: id, player_id: pid });
        }
      });
    }
    if (typeof item.points !== 'undefined' && item.points) {
      const ptids = item.points.map((p) => p && p.id).filter((x) => x != null);
      this._rows('points').forEach((pt, ptid) => {
        if (pt.round_id === id && ptids.indexOf(pt.id) === -1) { this._rows('points').delete(ptid); }
      });
      [].forEach.call(item.points, (pt) => {
        if (!pt || typeof pt.id === 'undefined') { return; }
        const prow = this._ensureRow('points', pt.id);
        this._setPointFrom(pt, prow);
        prow.round_id = id;
      });
    }
  }

  /**
   * Reconcile a game's scalar fields and its matches list.
   */
  _reconcileGame(item) {
    const id = item.id;
    const row = this._ensureRow('games', id);
    this._setGameFrom(item, row);
    if (typeof item.matches !== 'undefined' && item.matches) {
      const mids = item.matches.map((m) => m && m.id).filter((x) => x != null);
      this._rows('matches').forEach((m, mid) => {
        if (m.match_id === id && mids.indexOf(m.id) === -1) { this._deleteMatch(mid); }
      });
      mids.forEach((mid) => {
        const mitem = item.matches.find((m) => m && m.id === mid);
        this._reconcileMatch(mitem || {}, id);
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* query evaluator                                                    */
  /* ------------------------------------------------------------------ */

  _splitTopLevel(str, separator) {
    const out = [];
    let depth = 0;
    let start = 0;
    let i = 0;
    const len = str.length;
    const slen = separator.length;
    while (i <= len - slen) {
      const ch = str[i];
      if (ch === '(') { depth += 1; }
      else if (ch === ')') { depth -= 1; }
      if (depth === 0 && str.substr(i, slen) === separator) {
        out.push(str.slice(start, i).trim());
        i += slen;
        start = i;
      } else {
        i += 1;
      }
    }
    out.push(str.slice(start).trim());
    return out;
  }

  _stripOuterParens(s) {
    let str = s.trim();
    let stripped = true;
    while (stripped) {
      stripped = false;
      if (str[0] === '(' && str[str.length - 1] === ')') {
        let depth = 0;
        let wrapped = true;
        for (let i = 0; i < str.length; i += 1) {
          if (str[i] === '(') { depth += 1; }
          else if (str[i] === ')') {
            depth -= 1;
            if (depth === 0 && i < str.length - 1) { wrapped = false; break; }
          }
        }
        if (wrapped) {
          str = str.slice(1, -1).trim();
          stripped = true;
        }
      }
    }
    return str;
  }

  _fieldValue(row, field) {
    switch (field) {
      case 'id': return row.id;
      case 'name': return row.name;
      case 'date': return row.date;
      case 'point': return row.point;
      case 'player': return row.player;
      case 'players': return row.players;
      case 'players.@count': return Array.isArray(row.players) ? row.players.length : 0;
      case 'isopen': return row.isopen;
      default: return row[field];
    }
  }

  _parseToken(tok, args) {
    const t = tok.trim();
    const m = /^\$(\d+)$/.exec(t);
    if (m) { return args[parseInt(m[1], 10)]; }
    const q = t.match(/^(["'])(.*)\1$/);
    if (q) { return q[2]; }
    if (t === 'null') { return null; }
    if (t === 'true') { return true; }
    if (t === 'false') { return false; }
    if (t !== '' && !Number.isNaN(Number(t))) { return Number(t); }
    return t;
  }

  _evalCondition(row, cond, args) {
    const c = this._stripOuterParens(cond);
    const m = c.match(/^(.*?)(==|!=|>=|<=|>|<)(.*)$/);
    if (!m) { return false; }
    const field = m[1].trim();
    const op = m[2];
    const expected = this._parseToken(m[3], args);
    const actual = this._fieldValue(row, field);
    let a = actual;
    let b = expected;
    if (a instanceof Date || b instanceof Date) {
      const toNum = (x) => {
        if (x instanceof Date) { return x.getTime(); }
        if (typeof x === 'number') { return x; }
        if (x == null) { return null; }
        return new Date(x).getTime();
      };
      a = toNum(a);
      b = toNum(b);
    }
    switch (op) {
      case '==': return a === b;
      case '!=': return a !== b;
      case '>=': return a >= b;
      case '<=': return a <= b;
      case '>': return a > b;
      case '<': return a < b;
      default: return false;
    }
  }

  _evalQuery(row, query, args) {
    // normalize the Realm-style operators to marker characters
    const q = query
      .replace(/ OR /g, '\u0002')
      .replace(/ AND /g, '\u0001')
      .replace(/&&/g, '\u0001');
    const andParts = this._splitTopLevel(q, '\u0001');
    for (let i = 0; i < andParts.length; i += 1) {
      const orClause = this._stripOuterParens(andParts[i]);
      const orParts = this._splitTopLevel(orClause, '\u0002');
      let ok = false;
      for (let j = 0; j < orParts.length; j += 1) {
        if (this._evalCondition(row, orParts[j], args)) { ok = true; break; }
      }
      if (!ok) { return false; }
    }
    return true;
  }

  /* ------------------------------------------------------------------ */
  /* new id                                                             */
  /* ------------------------------------------------------------------ */

  _newid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

/**
 * Generic Repository
 */
class GenericRepository {
  constructor(repoName, parent) {
    this.repoName = repoName;
    this.schemaName = REPO_TO_TABLE[repoName];
    this.parent = parent;
    this.tableKey = this.schemaName;
  }

  _resolve(id) {
    switch (this.schemaName) {
      case 'games': return this.parent._resolveGame(id);
      case 'matches': return this.parent._resolveMatch(id);
      case 'players': return this.parent._resolvePlayer(id);
      case 'rounds': return this.parent._resolveRound(id);
      case 'points': return this.parent._resolvePoint(id);
      default: return null;
    }
  }

  _mergeExisting(item, id) {
    const existing = this._resolve(id);
    return existing ? { ...existing, ...item } : { id, ...item };
  }

  newid() {
    return this.parent._newid();
  }

  void() {
    switch (this.schemaName) {
      case 'games':
        return {
          id: null,
          name: '',
          winnerorderdescending: true,
          diceenabled: false,
          dicemin: 1,
          dicemax: 6,
          countdowntimerenabled: false,
          countdowntimerdefaultsec: 60,
          matches: [],
          isValid
        };
      case 'matches':
        return { id: null, name: '', players: [], rounds: [], isValid };
      case 'players':
        return { id: null, name: '', isValid };
      case 'rounds':
        return { id: null, date: new Date(), isopen: true, players: [], points: [], isValid };
      case 'points':
        return { id: null, date: new Date(), point: 0, player: null, isValid };
      default:
        return { id: null, isValid };
    }
  }

  find(id) {
    if (typeof id === 'undefined' || id == null) { return null; }
    return this._resolve(id);
  }

  list(query, ...args) {
    const out = [];
    const map = this.parent._rows(this.schemaName);
    map.forEach((row, id) => {
      if (query == null) {
        out.push(this._resolve(id));
      } else {
        const resolved = this._resolve(id);
        if (resolved && this.parent._evalQuery(resolved, query, args)) {
          out.push(resolved);
        }
      }
    });
    return out;
  }

  add(item) {
    const setitem = item;
    if (typeof setitem.id === 'undefined' || setitem.id == null) {
      setitem.id = this.newid();
    }
    switch (this.schemaName) {
      case 'games':
        this.parent._reconcileGame(setitem);
        break;
      case 'matches':
        this.parent._reconcileMatch(setitem, null);
        break;
      case 'players':
        this.parent._reconcilePlayerAdd(setitem);
        break;
      case 'rounds':
        this.parent._reconcileRound(setitem, (setitem.match_id != null ? setitem.match_id : null));
        break;
      case 'points':
        this.parent._reconcilePointAdd(setitem);
        break;
      default:
        break;
    }
    this.parent._schedulePersist();
    return setitem.id;
  }

  update(item, id = null) {
    const targetId = (id != null ? id : item.id);
    if (typeof targetId === 'undefined' || targetId == null) { return; }
    const merged = this._mergeExisting(item, targetId);
    switch (this.schemaName) {
      case 'games':
        this.parent._reconcileGame(merged);
        break;
      case 'matches':
        this.parent._reconcileMatch(merged, null);
        break;
      case 'players':
        this.parent._reconcilePlayerAdd(merged);
        break;
      case 'rounds':
        this.parent._reconcileRound(merged, merged.match_id != null ? merged.match_id : null);
        break;
      case 'points':
        this.parent._reconcilePointAdd(merged);
        break;
      default:
        break;
    }
    this.parent._schedulePersist();
  }

  remove(id) {
    if (typeof id === 'undefined' || id == null) { return; }
    switch (this.schemaName) {
      case 'games': this.parent._deleteGame(id); break;
      case 'matches': this.parent._deleteMatch(id); break;
      case 'players': this.parent._deletePlayer(id); break;
      case 'rounds': this.parent._deleteRound(id); break;
      case 'points':
        this.parent._rows('points').delete(id);
        break;
      default: break;
    }
    this.parent._schedulePersist();
    return id;
  }

  removeAll(id) {
    return this.remove(id);
  }
}

export default DbModel;
