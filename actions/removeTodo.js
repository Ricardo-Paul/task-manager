const getDb = require("../utils/getDb");
const validateEntry = require("../utils/validateEntry");
/**
 * remove a todo
 * 
 * @param {number} todoId 
 */

module.exports = async (todoId) => {
  validateEntry(todoId);
  const db = getDb();
  (await db).get('todos').remove({id: parseInt(todoId, 10)}).write();
}