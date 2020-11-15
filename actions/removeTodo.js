const getDb = require("../utils/getDb");

/**
 * remove a todo
 * 
 * @param {number} todoId 
 */

module.exports = async (todoId) => {
  console.log('remove hit')
    const db = getDb();
    (await db).get('todos').remove({id: parseInt(todoId, 10)}).write();

    // console.log(tds);

    // (await db).defaults({todos: []}).write();
}