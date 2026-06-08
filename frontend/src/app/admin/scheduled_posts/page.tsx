import { getScheduledPosts } from "./actions";
import SchedulePage from "./ScheduledAt";

export default async function page() {
  const data = await getScheduledPosts();
  return (
    <SchedulePage posts={data} />
  )
}
