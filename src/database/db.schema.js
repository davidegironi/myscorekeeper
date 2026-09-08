// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

import { Schema, dbName } from './watermelon/schema';
import { ModelClasses } from './watermelon/models';

/**
 * database options
 */
export const databaseOptions = {
  schema: Schema,
  dbName,
  modelClasses: ModelClasses
};

/**
 * export default
 */
export default { databaseOptions };
