import {
  insertDocument,
  getMeetupByTitle,
  connectClient,
  connectCollection,
} from "../../lib/db";
const collectionName = "meetups";

export default async function handler(req, res) {
  let collection;
  let client;
  try {
    client = await connectClient();

    collection = await connectCollection(
      client,
      process.env.mongodb_database,
      collectionName
    );
  } catch (error) {
    res.status(500).json({ message: "Connecting to the db failed!" });
    if (client) {
      await client.close(); // Ensure this is called on a MongoClient instance
    }
    return;
  }
  if (req.method === "POST") {
    const { title, image, address, description } = req.body;
    if (
      !title ||
      title.trim().length === 0 ||
      !image ||
      image.trim().length === 0 ||
      !address ||
      address.trim().length === 0 ||
      !description ||
      description.trim().length === 0
    ) {
      res
        .status(422)
        .json({ message: "Invalid Input - fields should be filled." });
      if (client) {
        await client.close(); // Ensure this is called on a MongoClient instance
      }
      // client.close();

      return;
    }

    const existingMeetup = await getMeetupByTitle(collection, title);
    if (existingMeetup) {
      res
        .status(422)
        .json({ message: "Meetup with the title exists already!" });
      // client.close();
      if (client) {
        await client.close(); // Ensure this is called on a MongoClient instance
      }

      return;
    }

    try {
      const result = await insertDocument(collection, req.body);
      console.log("result of creating new meetup: ", result);
      res
        .status(201)
        .json({ message: "Meetup added successfully!", comment: req.body });
      return;
    } catch (error) {
      res.status(500).json({ message: "Storing meetup failed!" });
      // client.close();
    } finally {
      // Explicitly closing the connection
      if (client) {
        console.log("closing client");
        await client.close(); // Ensure this is called on a MongoClient instance
      }
    }
  }
}
