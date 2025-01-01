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
    client.close();
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
      client.close();

      return;
    }

    const existingMeetup = await getMeetupByTitle(collection, title);
    if (existingMeetup) {
      res
        .status(422)
        .json({ message: "Meetup with the title exists already!" });
      client.close();

      return;
    }

    try {
      await insertDocument(collection, req.body);
      res
        .status(201)
        .json({ message: "Meetup added successfully!", comment: req.body });
      return;
    } catch (error) {
      res.status(500).json({ message: "Storing meetup failed!" });
      client.close();
    }
  }
}
