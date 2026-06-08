import React from 'react'
import Events from './Events'
import { getPosts } from './actions';

export default async function page({ searchParams }: { searchParams: { view?: string } }) {
  const {view}= await searchParams;
  const events = await getPosts(view || "month");
  console.log("Fetched events:", events);
  return (
    <div>
      <Events events={events} />
    </div>
  );
}
