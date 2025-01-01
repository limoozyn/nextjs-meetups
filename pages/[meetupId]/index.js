import Head from "next/head";
import {
  connectClient,
  connectCollection,
  getMeetupIds,
  getMeetupById,
} from "../../lib/db";

import MeetupDetail from "../../components/meetups/MeetupDetail";

export default function MeetupDetails(props) {
  return (
    <>
      <Head>
        <title>{props.meetupData.title}</title>
        <meta name="description" content={props.meetupData.description} />
      </Head>
      <MeetupDetail
        image={props.meetupData.image}
        title={props.meetupData.title}
        address={props.meetupData.address}
        description={props.meetupData.description}
      />
    </>
  );
}

export async function getStaticPaths() {
  const collectionName = "meetups";
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
    console.log("Connecting to the db failed!");
    if (client) {
      await client.close(); // Ensure this is called on a MongoClient instance
    }
    return {
      paths: {
        params: {
          meetupId: "1",
        },
      },
      fallback: true,
    };
  }
  try {
    const meetupIds = await getMeetupIds(collection);
    console.log("meetupIds: ", meetupIds);

    // client.close();
    return {
      paths: meetupIds.map(({ _id }) => ({
        params: {
          meetupId: _id.toString(),
        },
      })),
      fallback: false,
    };
  } catch (error) {
    console.log("Getting meetups failed!");
    // client.close();
  } finally {
    // Explicitly closing the connection
    if (client) {
      await client.close(); // Ensure this is called on a MongoClient instance
    }
  }
}

export async function getStaticProps(context) {
  const collectionName = "meetups";

  let collection;
  let client;

  client = await connectClient();
  collection = await connectCollection(
    client,
    process.env.mongodb_database,
    collectionName
  );

  const meetupId = context.params.meetupId;
  const { _id, ...meetup } = await getMeetupById(collection, meetupId);

  return {
    props: {
      meetupData: {
        id: meetupId,
        ...meetup,
      },
    },
  };
}
