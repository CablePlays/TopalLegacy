const { OAuth2Client } = require('google-auth-library');
const { v4: uuidv4 } = require('uuid');
const cookies = require('./cookies');
const general = require('./general');
const sheetsApi = require('./sheets-api');

const CLIENT_ID = "65424431927-8mpphvtc9k2sct45lg02pfaidhpmhjsf.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
    return await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });
}

function acceptApp(app) {
    // get permissions
    app.post("/get-permissions", async (req, res) => {
        if (await general.sessionTokenValid(req)) {
            const user = cookies.getEmail(req);
            let userPermissions = await general.getPermissions(user);
            res.json(userPermissions);
        } else {
            res.json(general.getPermissionsForLevel(0));
        }
    });

    // update permissions
    app.post("/set-permission", async (req, res) => {
        if (await general.sessionTokenValid(req)) {
            const userEmail = cookies.getEmail(req);
            let userPermissions = await general.getPermissions(userEmail);

            if (userPermissions.permissions) { // check for permission to manage permissions
                const { user, level } = req.body;
                sheetsApi.upsert("Permissions!A2:B", [[user, level]]);
            }
        }

        res.end();
    });

    // get from database
    app.post("/database-get", async (req, res) => {
        let values;

        if (await general.sessionTokenValid(req)) {
            const { range } = req.body;
            values = await sheetsApi.get(range);
        } else {
            values = [];
        }

        res.json({
            values
        });
    });

    // search database
    app.post("/database-search", async (req, res) => {
        let value;

        if (await general.sessionTokenValid(req)) {
            const { range, match, colSearch, colGet } = req.body;
            value = await sheetsApi.search(range, match, colSearch, colGet);
        }

        res.json({
            value
        });
    });

    // add to database
    app.post("/database-add", async (req, res) => {
        if (await general.sessionTokenValid(req)) {
            const { range, values } = req.body;
            sheetsApi.add(range, values);
        }

        res.end();
    });

    // set to database
    app.post("/database-set", async (req, res) => {
        if (await general.sessionTokenValid(req)) {
            const { range, values } = req.body;
            sheetsApi.set(range, values);
        }

        res.end();
    });

    // replace in database
    app.post("/database-replace", async (req, res) => {
        if (await general.sessionTokenValid(req)) {
            const { range, values } = req.body;
            await sheetsApi.replace(range, values);
        }

        res.end();
    });

    // upsert to database
    app.post("/database-upsert", async (req, res) => {
        if (await general.sessionTokenValid(req)) {
            const { range, values } = req.body;
            await sheetsApi.upsert(range, values);
        }

        res.end();
    });

    // login
    app.post("/login", async (req, res) => {
        const { credential } = req.body;
        let decoded;

        try {
            decoded = await verify(credential).then();
        } catch (error) {
            console.warn("Invalid JWT: " + error.message);

            res.json({
                status: "error",
                error: "invalid_jwt"
            });

            return;
        }

        const { email, hd } = decoded.getPayload();

        if (hd !== "treverton.co.za") { // check domain
            res.json({
                status: "error",
                error: "invalid_email"
            });

            return;
        }

        let sessionToken = await sheetsApi.search("Users!A2:B", email);

        if (sessionToken == null) { // create session token
            sessionToken = uuidv4();
            await sheetsApi.upsert("Users!A2:B", [[email, sessionToken]]);
        }

        res.setHeader("Set-Cookie", [
            `session_token=${sessionToken}`,
            `user_email=${email}`
        ]);
        res.json({
            status: "success"
        });
    });
}

module.exports = acceptApp;