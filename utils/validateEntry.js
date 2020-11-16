const getDb = require("./getDb");

module.exports = async (todoId) => {
    const db = getDb();
    const record = (await db).get('todos').find({id: parseInt(todoId, 10)}).value();
    if(!record){
         console.log(`We can\'t seem to find a todo with id ${todoId} \n\n`);
         return;
    } else {
        return true;
    }
}