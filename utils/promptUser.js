const { stdin, stdout } = require('process');
const readline = require('readline');

/**
 * prompt user when creating new todo
 * 
 * @param {string} question 
 */

module.exports = (question) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
            rl.close();
        })
    })
}