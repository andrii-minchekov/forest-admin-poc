require('dotenv').config();
const {createAgent} = require('@forestadmin/agent');
const {createSqlDataSource} = require('@forestadmin/datasource-sql');

// Create the Forest Admin agent.
/**
 * @type {import('@forestadmin/agent').Agent<import('./typings').Schema>}
 */
const agent = createAgent({
    // Security tokens
    authSecret: process.env.FOREST_AUTH_SECRET,
    envSecret: process.env.FOREST_ENV_SECRET,

    // Make sure to set NODE_ENV to 'production' when you deploy your project
    isProduction: process.env.NODE_ENV === 'production',

    // Autocompletion of collection names and fields
    typingsPath: './typings.ts',
    typingsMaxDepth: 5,
});

// Connect your datasources
// All options are documented at https://docs.forestadmin.com/developer-guide-agents-nodejs/data-sources/connection
agent.addDataSource(
    createSqlDataSource({
        uri: process.env.DATABASE_URL,
        schema: process.env.DATABASE_SCHEMA,
        sslMode: process.env.DATABASE_SSL_MODE,
    }),
);
const {Pool} = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'snippetbox',
    password: 'postgres',
    port: 5432,
});

// Add customizations here.
// For instance, you can code custom actions, charts, create new fields or relationships, load plugins.
// As your project grows, you will need to split it into multiple files!
//
// Here is some code to get your started
//
agent.customizeCollection('snippets', collection => {
    // Actions are documented here:
    // https://docs.forestadmin.com/developer-guide-agents-nodejs/agent-customization/actions
    collection.addAction('New Custom Smart Action', {
        scope: 'Single', // This action can be triggered product by product
        form: [{label: 'Quantity', type: 'Number', isRequired: true}],
        execute: async (context, resultBuilder) => {
            const product = await context.getRecord(['id', 'title'])
            const quantity = context.formValues['Quantity'];

            // ... Perform work here ...

            return resultBuilder.success(`Your snippet for a batch of ${quantity} '${product.title}' was sent`);
        }
    });

    collection.addField('total', {columnType: 'Number', dependencies: ["title"], getValues: (records, context) => records.map(r => records.length)});
});

const {collection} = require('forest-express');

collection('snippets', {
    fields: [{
        field: 'id',
        type: 'Number'
    }, {
        field: 'title',
        type: 'String'
    },
    ],
    segments: [{
        name: 'Narrow-Snippets',
        where: async () => {
            const results = await new Promise((resolve, reject) => {
                // Assuming you have a pool or connection set up for your SQL database
                pool.query('SELECT id FROM snippets WHERE id > 5', (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results.rows);
                    }
                });
            });

            return {id: {$in: results.map((r) => r.id)}};
        }
    }]
});


//   // Search customization is documented here:
//   // https://docs.forestadmin.com/developer-guide-agents-nodejs/agent-customization/search
//   collection.replaceSearch(searchString => {
//     // user has typed a product id, let's only that column
//     if (searchString.match(/^prdid[\d]{8}/$))
//       return { field: 'id', operator: 'Equal', value: searchString };

//     // Otherwise assume that user wants to search for a product by name
//     return { field: 'name', operator: 'Contains', value: searchString };
//   });
// });

// Expose an HTTP endpoint.
agent.mountOnStandaloneServer(Number(process.env.APPLICATION_PORT));

// Start the agent.
agent.start().catch(error => {
    console.error('\x1b[31merror:\x1b[0m Forest Admin agent failed to start\n');
    console.error('');
    console.error(error.stack);
    process.exit(1);
});
