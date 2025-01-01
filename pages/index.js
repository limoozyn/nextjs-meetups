import Head from "next/head";

import { connectClient, connectCollection, getDocuments } from "../lib/db";
import MeetupList from "../components/meetups/MeetupList";

export default function HomePage(props) {
  return (
    <>
      <Head>
        <title>React Meetups</title>
        <meta
          name="description"
          content="Browse a huge list of highly active React meetups!"
        />
      </Head>
      <MeetupList meetups={props.meetups} />
    </>
  );
}

export async function getStaticProps() {
  const collectionName = "meetups";
  let collection;
  let client;
  let meetups = [];
  try {
    client = await connectClient();
    collection = await connectCollection(
      client,
      process.env.mongodb_database,
      collectionName
    );
  } catch (error) {
    console.log("Connecting to the db failed!");
    if (client) {
      await client.close(); // Ensure this is called on a MongoClient instance
    }
    return {
      props: {
        meetups: [],
      },
    };
  }
  try {
    const meetupsResult = await getDocuments(collection);
    meetups = meetupsResult.map((origMeetup) => {
      const { _id, ...meetup } = origMeetup;
      return {
        id: _id.toString(),
        ...meetup,
      };
    });
    // client.close();
  } catch (error) {
    console.log("Getting meetups failed!");
    // client.close();
  } finally {
    // Explicitly closing the connection
    if (client) {
      await client.close(); // Ensure this is called on a MongoClient instance
    }
  }

  // fetch data from an API
  return {
    props: {
      meetups,
    },
    revalidate: 10,
  };
}
