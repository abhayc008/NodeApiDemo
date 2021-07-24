
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://abhay:Abhay@008@nodemongoapi.hi16y.mongodb.net/Paddy?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

try {
    // Connect to the MongoDB cluster
     client.connect();
     
     databasesList = client.db().admin().listDatabases();
 
     console.log("Databases:");
     databasesList.databases.forEach(db => console.log(` - ${db.name}`));

    // Make the appropriate DB calls
    //   listDatabases(client);

} catch (e) {
    console.error(e);
} finally {
     client.close();
}
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   console.log('AbTest');
//   client.close();
// });
