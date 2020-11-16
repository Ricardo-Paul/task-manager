#!/usr/bin/env node


const chalk = require('chalk');

// utils imports
const getDb = require('./utils/getDb');
const promptUser = require('./utils/promptUser');
const removeTodo = require('./actions/removeTodo');
const validateEntry = require('./utils/validateEntry');

const command = process.argv.slice(2); //array of commands with the two default ones excluded
const validCommands = ['new', 'get', 'complete', 'help', 'remove'];
const args = process.argv; //all args passed

if(args.length === 2){
    return console.log(`Please choose a command. Run <todo help> for help`)
}

const chosenCommand = command[0].toString();


// create the db
const db = getDb();

const displayUsageText = () => {
    const usageText = `
    Description:
    this CLI app helps you manage your tasks

    usage:
        new: create a new todo
        get: retrieve a list of todos
        complete: mark a todo as complete
        help: get some help
        remove: remove a todo <todo remove 1>
    `
    return console.log(usageText);
}

const oneArgument = command.length < 2? true : false;
const include = validCommands.indexOf(chosenCommand) != -1? true: false;

const logError = (errText) =>{
    console.error(chalk.red(errText))
}

async function newTodo(){
    let counter = (await db).get('counter').value();
    const question = chalk.yellow(`ENTER A TASK ::  `);
    const currentDate = new Date().toDateString();

    // that's a real hack here
    // we create a counter array in the db
    // and use its value to generate unique ids
    // meaning we dont remove any item from this array
    // when we remove a todo.

    promptUser(question)
    .then( async answer => {
        (await db).get('todos').push({
            id: parseInt(counter.length + 1, 10),
            existed: true,
            todo: answer,
            complete: false,
            date: currentDate
        }).write();

        // the only point of creating this record is
        // to generate a unique id
        (await db).get('counter').push("record").write();

    }).then(()=>{
        const check = chalk.green(`✔`);
        console.log(`${chalk.green(`ADDED TO YOUR LIST ${check}`)}
        type <${chalk.green('<todo get>')}> to see the list
        `);
    })
}

/**
 * dispaly complete and incomlete todos 
 */
async function getTodos(){
    const todos = (await db).get('todos').sortBy('id').value();

    let complete = [];
    let incomplete = [];

    // push to complete or incomplete accordingly
    todos.forEach( (todo) => {
        todo.complete?complete.push(todo):incomplete.push(todo);
    });

    // assignments
    const check = chalk.green(`✔`);
    const doneTitle = chalk.cyan(`    FINISHED WORK [${complete.length}]`);
    const undoneTitle = chalk.cyan(`    TASK TO COMPLETE [${incomplete.length}]`);
    

    // log complete tasks
    console.log(`${doneTitle}`);
    complete.map(({ todo, id })=> {
        console.log(`   ${chalk.green(id)}. ${chalk.red(todo)} ${check}`);
    })

    console.log();
    console.log();

    // log incomplete tasks
    console.log(`${undoneTitle}`);
    incomplete.map(({ todo, id, date })=> {
        console.log(`   ${chalk.green(id)}. [ ${chalk.blackBright(date)} ] ${chalk.white(todo)}`);
    });
}

async function completeTodo(){
    const todoId = args[3];
    const record = (await db).get('todos').find({id: parseInt(todoId, 10)}).value();
    if(!record){
        console.log(`We can\'t seem to find a todo with id ${todoId} \n`);
        return;
    }


    // TODO: may have to re-write these codes
        if(args.length != 4){
            return logError(`
            invalid number of args
            Please Enter <complete 'valid task number'>
            `);
        }
        
        if(isNaN(todoId) == true){
            return logError(`value should be a number`)
        }
;

        (await db).get('todos').find({id: parseInt(todoId, 10)})
        .assign({complete: true}).write().then(() => {
            console.log(`COMPLETED`);
        });

}

const interpretCommand = command => {
    switch(command){
        case 'help':
          displayUsageText();
          break
        case 'perso':
        //   TODO: save user info
          break
        case 'new':
            newTodo();
            break;
        case 'get':
            getTodos();
            break;
        case 'complete':
            completeTodo();
            break;
        case 'remove':
            removeTodo(args[3]);
            break;
        default: console.log('Choose a command')
    }
}

// TODO: fix: ./todo.js get 1 should not show invalid command
(function initialize(){
    if(!oneArgument && chosenCommand != 'complete' && chosenCommand != 'remove' ){
        logError('One argument only is allowed, unless the command is <complete>')
        return;
    }
    if(!include){
        console.log(include, chosenCommand)
        logError(`Invalid command`)
        console.log(`please run './todo.js help'`)
        return;
    }
    interpretCommand(chosenCommand);
})();
// db will reinitialize once installed globally