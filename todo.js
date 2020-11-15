#!/usr/bin/env node


const chalk = require('chalk');
const readline = require('readline');


// utils imports
const getDb = require('./utils/getDb');
const promptUser = require('./utils/promptUser');
const removeTodo = require('./actions/removeTodo');

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
    `
    return console.log(usageText);
}

const oneArgument = command.length < 2? true : false;
const include = validCommands.indexOf(chosenCommand) != -1? true: false;

const logError = (errText) =>{
    console.error(chalk.red(errText))
}


async function newTodo (){
    let counter = (await db).get('counter').value();
    const question = chalk.blue(`Enter a task: `);

    // here we try to simulate a read db by incrementing
    // each record id based on the array length

    promptUser(question)
    .then( async answer => {
        (await db).get('todos').push({
            id: parseInt(counter.length + 1, 10),
            existed: true,
            todo: answer,
            complete: false
        }).write();

        (await db).get('counter').push("record").write();

    }).then(()=>{
        console.log(`${chalk.green('TASK ADDED !')}
        type <todo get> to see the list
        `);
    })
}

async function getTodos(){
    // const todos = (await db).get('todos').filter({ existed: true }).value();
    let index = 1;

    let complete = [];
    let incomplete = [];

    const todos = (await db).get('todos').sortBy('id').value();
    todos.forEach( (todo) => {
    todo.complete?complete.push(todo):incomplete.push(todo);

    const check = chalk.green(`✔`);
        console.log(`=> ${chalk.green(todo.id)}. ${todo.complete?`${chalk.strikethrough(todo.todo)}`:`${todo.todo}`} ${todo.complete? `${check}`:''}`);
    });
    
    // console.log(`You're done with these tasks`);
    // complete.map((c, i )=> {
    //     i = i + 1;
    //     console.log(`${chalk.green(i++)}. ${chalk.strikethrough(c.todo)}`);
    // })

    // console.log(`-----------------------------------------------------------`);

    // console.log(`TASK TO COMPLETE \n`);

    // incomplete.map((c, i )=> {
    //     i = i +1;
    //     console.log(`${chalk.green(i)}. ${c.todo}`);
    // });
}

async function completeTodo(){
    // command should be ./todo.js complete 1
    //args number should be 4
    try{
        const taskNumber = args[3];
        if(args.length != 4){
            return logError(`
            invalid number of args
            Please Enter <complete 'valid task number'>
            `)
        }
        if(isNaN(taskNumber) == true){
            return logError(`value should be a number`)
        }
        //make sure task number exist
        const todos = (await db).get('todos').value();

        if(taskNumber > todos.length || taskNumber == 0){
            return logError(`Not Existed !`)
        }
        // (await db).get('todos').set(todos[taskNumber-1].complete, true).write();
        // console.log(todos[taskNumber-1].complete)
        // if we had an id for each todo, we could use find({id: id}) after get

        // we use task number to map it with an index.. its a working hack as there's no id

        // TODO: search through the undone tasks specifically
        (await db).get(`todos[${taskNumber-1}]`)
        .assign({complete: true}).write(); //works great

        return console.log(`Todo marked completed !
        `)
    } catch(error){
        console.log('Something went wrong!', error)
    }
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