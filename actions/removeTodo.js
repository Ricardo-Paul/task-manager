const getDb = require("../utils/getDb");

/**
 * remove a todo
 * 
 * @param {number} taskNumber 
 */

module.exports = async (taskNumber) => {
    const db = getDb();

    try{
      (await db).get(`todos[${taskNumber-1}]`)
      .assign({existed: false}).write();

      console.log(`We move the item to a trash list !
      run <todo trashlist> to check that list
      `)
    } catch(err){
        console.log(`We could not delete the require record`);
    }
}