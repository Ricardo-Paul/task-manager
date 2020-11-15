const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');

/**
 * get the db
 */

module.exports = () => {
    const adpater = new FileAsync('db.json');
    const db = low(adpater);
    db.then((db) => {
        db.defaults({todos: [], counter: []}).write();
    })
    return db;
}