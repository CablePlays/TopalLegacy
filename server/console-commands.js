const readline = require("readline");
const jsonDatabase = require("./json-database");
const general = require("./general");
const sqlDatabase = require("./sql-database");

const commands = {
    permission: async (user, permission, has = true) => {
        if (!await sqlDatabase.isUser(user)) {
            console.warn(`There is no user with the ID ${user}!`);
            return;
        }
        if (!general.isPermission(permission)) {
            console.warn(`Invalid permission: ${permission}`);
            return;
        }
        if (typeof has === "string") {
            has = (has === "true");
        }

        const db = jsonDatabase.getUser(user);
        const path = jsonDatabase.PERMISSIONS_PATH + "." + permission;

        if (has === true || has === "true") {
            db.set(path, true);
        } else {
            db.delete(path);
        }

        const { fullName } = await sqlDatabase.getUserInfo(user);
        console.info(`${fullName} has ${has ? "been given" : "lost"} the permission ${permission}.`);
    }
};

const rl = readline.createInterface({
    input: process.stdin
});

async function getInput() {
    return await new Promise(r => {
        rl.question("Write something: ", input => r(input));
    });
}

function handleCommand(args) {
    const [label, ...subargs] = args;
    if (!label) return;

    if (subargs[subargs.length - 1] === "") { // remove last arg if blank
        subargs.pop();
    }

    const command = commands[label];

    if (command == null) {
        console.info("Unknown command!");
        return;
    }

    command(...subargs);
}

async function listen() {
    console.info("Listening for commands");

    while (true) {
        const input = await getInput();
        const args = input.split(/\s+/);
        handleCommand(args);
    }
}

module.exports = listen;