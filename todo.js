#!/usr/bin/env node


const chalk = require('chalk');
const readline = require('readline');
const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');

// imports
const createDb = require('./utils/createDb');


const command = process.argv.slice(2); //array of commands with the two default ones excluded
const validCommands = ['new', 'get', 'complete', 'help', 'perso']
const args = process.argv; //all args passed

if(args.length === 2){
    return console.log(`Please choose a command. Run <todo help> for help`)
}

const chosenCommand = command[0].toString();


// create the db
const db = createDb('db.json');

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

const prompt = (question) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    return new Promise((resolve, error) => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer)
        })
    })
}

function newTodo (){
    const question = chalk.blue(`Enter a task: `);
    prompt(question)
    .then( async answer => {
        // const database = await db;
        let index = 1;
        (await db).get('todos').push({
            id: index++,
            todo: answer,
            complete: false
        }).write()
    }).then( ()=>{
        console.log(`${chalk.green('TASK ADDED !')}
        type <todo get> to see the list
        `)
    })
}

async function getTodos(){
    const todos = (await db).get('todos').value();
    let index = 1;
   return todos.forEach( (todo) => {
    const check = chalk.green(`✔`);
        console.log(`${index++}. ${todo.complete?`${chalk.strikethrough(todo.todo)}`:`${todo.todo}`} ${todo.complete? `${check}`:''}`)
    })
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
        (await db).get(`todos[${taskNumber-1}]`).assign({complete: true}).write(); //works great
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
        default: console.log('Choose a command')
    }
}

// TODO: fix: ./todo.js get 1 should not show invalid command
(function initialize(){
    if(!oneArgument && chosenCommand != 'complete' ){
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