import { MongoClient, ObjectId } from "mongodb";

export async function connectDatabase(dbName, collectionName) {
  const url = `mongodb+srv://${process.env.mongodb_username}:${process.env.mongodb_password}@${process.env.mongodb_clustername}`;

  const client = new MongoClient(url);

  await client.connect();
  const db = client.db(dbName);
  const collection = await db.collection(collectionName);
  return collection;
}
export async function connectClient() {
  const url = `mongodb+srv://${process.env.mongodb_username}:${process.env.mongodb_password}@${process.env.mongodb_clustername}`;

  const client = new MongoClient(url);

  await client.connect();
  return client;
}
export async function connectCollection(client, dbName, collectionName) {
  const db = client.db(dbName);
  const collection = await db.collection(collectionName);
  return collection;
}

export async function insertDocument(collection, document) {
  collection.insertOne(document);
}
export async function updateDocument(collection, email, newPassword) {
  collection.updateOne({ email }, { $set: { password: newPassword } });
}

export async function getDocuments(collection) {
  return collection.find().toArray();
}

export async function getMeetupIds(collection) {
  return collection.find({}, { projection: { _id: 1 } }).toArray();
}

export async function getMeetupById(collection, id) {
  console.log("id: ", id);

  return collection.findOne({ _id: new ObjectId(id) });
}

export async function getMeetupByTitle(collection, title) {
  return collection.findOne({ title: title });
}
