import { getDrafts } from "./actions";
import DraftsPage from "./Drafts";

export default async function page() {
  const drafts = await getDrafts();
  return (
    <DraftsPage posts={drafts} />
  )
}
