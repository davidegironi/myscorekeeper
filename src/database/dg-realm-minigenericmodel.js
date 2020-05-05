/* eslint-disable max-classes-per-file */
/* eslint-disable no-mixed-operators */
/* eslint-disable no-bitwise */

// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.
//
// Mini generic Realm database model

//
/**
 * Usage
 *   +) import DbModel in your js file
 *      ex.
 *         import { DbModel } from 'dg-realm-genericmodel';
 *   +) instantiate the model using databaseOptions
 *      see databaseOptions section
 *      ex.
 *         const db = new DbModel(databaseOptions);
 *   +) call open() function on mount
 *      ex.
 *        useEffect(() => {
 *          db.open();
 *        }, []);
 *   +) use schema actions on Schema objects
 *      list(...filter)
 *        description:
 *          list objects using the provided filter parameters
 *        parameters:
 *          filter - type string
 *      find(id)
 *        description:
 *          find an objects using the provided id
 *        parameters:
 *          id - type string or number
 *      add(item)
 *        description:
 *          add an item
 *          if no id is provided a uuid is built
 *        parameters:
 *          item - type object
 *      update(item, id)
 *        description:
 *          update an item
 *        parameters:
 *          item - type object
 *          id - type string or number
 *               if null item.id used
 *      remove(id)
 *        description:
 *          remove an item
 *        parameters:
 *          id - type string or number
 *      removeAll(id)
 *        description:
 *          remove an item and children
 *        parameters:
 *          id - type string or number
 *      void()
 *        description:
 *          return a void instance of the schema
 *      newid()
 *        description:
 *          return a new uuid
 *
 * databaseOptions
 *   define the database options as Realm docs
 *
 * table schema required field is id, primaryKey type string or number
 *
 */

import Realm from 'realm';

/**
 * enable recursive find on type list for the find function
 */
const findRecursiveEnabledOnList = false;

/**
 * Main DbModel
 */
export class DbModel {
  constructor(props) {
    this.realm = null;
    this.databaseOptions = props;
  }

  /**
   * open a database connection
   */
  async open() {
    if (!this.isOpen()) {
      return Realm.open(this.databaseOptions)
        .then((realm) => {
          this.realm = realm;
          this.databaseOptions.schema.forEach((schema) => {
            this[schema.name] = new this.GenericRepository(
              {
                realm,
                schema,
                parent: this
              }
            );
          });
          return this;
        });
    }
    return this;
  }

  /**
   * close the database connection
   */
  close() {
    return (this.realm !== null && !this.realm.isClosed)
      ? this.realm.close()
      : true;
  }

  /**
   * check if the connection is open
   */
  isOpen() {
    return this.realm != null ? !this.realm.isClosed : false;
  }

  /**
   * compact the database
   */
  compact() {
    if (this.realm == null) { return; }
    this.realm.compact();
  }

  /**
   * delete the database file
   */
  delete() {
    try {
      this.realm.close();
    } catch {
      // err
    }
    Realm.deleteFile(this.databaseOptions);
  }

  /**
   * Genereric Reporistory
   */
  GenericRepository = class {
    constructor(props) {
      this.realm = props.realm;
      this.schema = props.schema;
      this.parent = props.parent;
    }

    /**
     * list objects
     * @param {string} query
     * @param  {...any} arg
     */
    list(query, ...args) {
      const ret = this.realm.objects(this.schema.name);
      if (query != null) { return ret.filtered(query, ...args); }
      return ret;
    }

    /**
     * add an item
     * @param {object} item
     */
    add(item) {
      const setitem = item;
      if (typeof setitem.id === 'undefined' || setitem.id == null) { setitem.id = this.newid(); }
      this.realm.write(() => {
        this.realm.create(this.schema.name, setitem);
      });
      return setitem.id;
    }

    /**
     * update an item
     * @param {object} item
     * @param {number or string} id
     */
    update(item, id = null) {
      if (typeof id === 'undefined' || id == null) { return; }
      this.realm.write(() => {
        const setitem = (id != null
          ? {
            id,
            ...item,
            ...this.realm.objectForPrimaryKey(this.schema.name, id)
          }
          : item);
        this.realm.create(this.schema.name, setitem, true);
      });
    }

    /**
     * delete an item by id
     * @param {string} id
     */
    remove(id) {
      if (typeof id === 'undefined' || id == null) { return; }
      this.realm.write(() => {
        let getitem = id;
        if (typeof id === 'string' || typeof id === 'number') {
          getitem = this.realm.objectForPrimaryKey(this.schema.name, id);
        }
        this.realm.delete(getitem);
      });
    }

    /**
     * delete an item and children
     * @param {string} id
     */
    removeAll(id) {
      const removeObjectGraph = (schemaObject, schemaProperties, schemaName) => {
        Object.keys(schemaProperties).forEach((p) => {
          if (typeof schemaObject[p] !== 'function') {
            const schemaProperty = schemaProperties[p];
            if (schemaProperty.type === 'list') {
              // recursive properties does not work for list
              let i = schemaObject[p].length - 1;
              while (i >= 0) {
                removeObjectGraph(
                  schemaObject[p][i],
                  this.realm.schema.find((x) => x.name === schemaProperty.objectType).properties,
                  schemaProperty.objectType
                );
                i -= 1;
              }
            } else if (schemaProperty.type === 'object' && schemaObject[p] != null) {
              // delete object and all children
              removeObjectGraph(
                schemaObject[p],
                this.realm.schema.find((x) => x.name === schemaProperty.objectType).properties,
                schemaProperty.objectType
              );
            }
          }
        });

        const refRealm = this.parent[schemaName].realm;
        // delete the object
        refRealm.write(() => {
          refRealm.delete(schemaObject);
        });
      };
      if (typeof id === 'undefined' || id == null) { return; }
      const object = this.realm.objectForPrimaryKey(this.schema.name, id);
      if (object == null) { return; }
      removeObjectGraph(object, this.schema.properties, this.schema.name);
    }

    /**
     * find an item
     * @param {string} id
     */
    find(id) {
      const getSchemaProperties = (schemaObject, schemaProperties) => {
        const props = {};
        Object.keys(schemaProperties).forEach((p) => {
          if (typeof schemaObject[p] !== 'function') {
            const schemaProperty = schemaProperties[p];
            let type = null;
            if (typeof schemaProperty === 'string') {
              type = schemaProperty;
            } else {
              type = schemaProperty.type;
            }
            if (type === 'list') {
              if (findRecursiveEnabledOnList) {
                const newprops = {};
                let i = schemaObject[p].length - 1;
                while (i >= 0) {
                  const newprop = getSchemaProperties(
                    schemaObject[p][i],
                    this.realm.schema.find((x) => x.name === schemaProperty.objectType).properties
                  );
                  newprops[i] = newprop;
                  i -= 1;
                }
                props[p] = newprops;
              } else {
                props[p] = schemaObject[p];
              }
            } else if (type === 'date') {
              props[p] = new Date(schemaObject[p]);
            } else {
              props[p] = schemaObject[p];
            }
          }
        });
        return props;
      };
      if (typeof id === 'undefined' || id == null) { return null; }
      const object = this.realm.objectForPrimaryKey(this.schema.name, id);
      if (object == null) { return null; }
      const props = getSchemaProperties(object, this.schema.properties);
      return props;
    }

    /**
     * return a void schema
     */
    void() {
      return Realm.createTemplateObject(this.schema);
    }

    /**
     * get a new id
     */
    newid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    })
  };
}

export default DbModel;
