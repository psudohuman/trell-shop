// const express = require('express');
// const { graphqlHTTP } = require('express-graphql');
// const { buildSchema } = require('graphql');

// // Define the GraphQL schema
// const schema = buildSchema(`
//   type ClientConfig {
//     global: Global
//     payment: Payment
//   }

//   type Global {
//     free_ship_offer: String
//     top_msg: String
//     shipping_flat_rate: Float
//     max_sale_qty: Int
//     offer_count_visible: Boolean
//     search_product_suggestion_count: Int
//   }

//   type Payment {
//     razorpay: Razorpay
//   }

//   type Razorpay {
//     api_key: String
//     merchant_name: String
//   }

//   type Query {
//     clientConfig: ClientConfig
//   }
// `);

// // Define the data that will be returned by the API
// const data = {
//   clientConfig: {
//     global: {
//       free_ship_offer: 'Free shipping',
//       top_msg: 'Limited time offer',
//       shipping_flat_rate: 5.99,
//       max_sale_qty: 10,
//       offer_count_visible: true,
//       search_product_suggestion_count: 5,
//     },
//     payment: {
//       razorpay: {
//         api_key: '123456789',
//         merchant_name: 'Test Merchant',
//       },
//     },
//   },
// };

// // Define the root resolver function
// const root = {
//   clientConfig: () => data.clientConfig,
// };

// const app = express();

// // Set up the /graphql endpoint with express-graphql
// app.use('/graphql', graphqlHTTP({
//   schema,
//   rootValue: root,
//   graphiql: true,
// }));

// const port = 4000;
// app.listen(port, () => {
//   console.log(`Running a GraphQL API server at localhost:${port}/graphql`);
// });
