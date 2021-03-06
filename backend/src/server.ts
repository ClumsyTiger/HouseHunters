import { environment } from "./environments/environment";

// https://www.npmjs.com/package/express
// +   https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await
import express from "express";
// https://www.npmjs.com/package/mongoose
// +   https://docs.mongodb.com/manual/reference/sql-comparison/
// +   https://docs.mongodb.com/manual/tutorial/query-documents/
import mongoose from "mongoose";
// https://www.npmjs.com/package/bson-objectid
import ObjectId from "bson-objectid";
// https://www.npmjs.com/package/cors
import cors from "cors";
// https://www.npmjs.com/package/express-session
import session from "express-session";
// https://www.npmjs.com/package/connect-mongo
import MongoStore from "connect-mongo";
// https://www.npmjs.com/package/gridfs-stream
import Grid from "gridfs-stream";

// https://www.npmjs.com/package/bson-objectid
/* implements only object id from mongodb */

// https://www.npmjs.com/package/concurrently
/* run nodemon and tsc at the same time */
// https://www.npmjs.com/package/nodemon
/* watch for file changes in node */

// extend express session data interface before its use
declare module 'express-session'
{
    interface SessionData
    {
        acc_id?:          ObjectId;
        acc_type?:        string;
        viewed_prop_map?: Map<ObjectId, boolean>;
    }

    export type Sesh = Session & Partial<SessionData>
}

// rest apis
import { AgncyApi } from "./app/rest-api/agncy.api";
import { AccApi } from "./app/rest-api/acc.api";
import { ConvApi } from "./app/rest-api/conv.api";
import { PropApi } from "./app/rest-api/prop.api";
import { FileApi } from "./app/rest-api/file.api";
import { JsonParseReviver } from "./app/common/types";


// the main function
async function main() {
    // express app and router
    const app = express();
    const router = express.Router();


    // use cross-origin sharing between the express backend and angular frontend (since the domains are different)
    app.use( cors() );
    // set that all requests' bodies are read as json
    app.use( express.json( { reviver: JsonParseReviver, } ) );
    // enable the session store for mongodb
    app.use( session({
        store: MongoStore.create({
            mongoUrl: environment.mongoUrl,
            ttl: environment.sessionTtl,
        }),
        cookie: {
            secure: environment.cookieSecure,
            httpOnly: environment.cookieHttpOnly,
            sameSite: 'lax',
            maxAge: environment.cookieMaxAge,
        },
        secret: environment.sessionSecret, // used for session encryption?
        saveUninitialized: false, // prevents an uninitialized session to be saved to the session store
        resave: false, // prevents an unmodified session (in a request) to be resaved to the session store
    }) );
    // use the express router -- must be the last middleware!!!
    // +   also, keep the forward slash (needed for some reason)
    app.use( '/', router );

    // set the mongoose promise to be the global promise
    mongoose.Promise = global.Promise;
    
    try
    {
        // wait for the mongo connection to be established
        await mongoose.connect( environment.mongoUrl, {
            useUnifiedTopology: true,   // ???
            useNewUrlParser: true,   // the old url parser is deprecated
        });
        
        console.log( `[info] Open connection to MongoDB on path '${environment.mongoUrl}'` );
    }
    catch( err )
    {
        console.error( `[error] Failed to connect to MongoDB on path '${environment.mongoUrl}'`, err );
        process.kill( process.pid, 'SIGTERM' );
        return;
    }
    
    // enables files larger than 16MB to be saved in mongo
    // set the gridfs's mongo driver to be the mongoose's mongo driver
    const gfs = Grid( mongoose.connection.db, mongoose.mongo );

    AgncyApi.register( router );
    AccApi.register( router );
    ConvApi.register( router );
    PropApi.register( router );
    FileApi.register( router, gfs );
    
    // start the express server
    app.listen( environment.expressPort, () =>
        console.log(`[info] Express server running on port ${environment.expressPort}`)
    );
}

// call the main function
main();
