const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');

module.exports = (dbName) => {
    const adpater = new FileAsync(dbName);
    const db = low(adpater);
    db.then((db) => {
        db.defaults({todos: []}).write();
    })
    return db;
}