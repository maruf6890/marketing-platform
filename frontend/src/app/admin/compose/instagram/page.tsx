import IGPostComposer from './Compose'
import { getUsersPageList } from '../../platform/instagram_accounts/action';
import { getPostById } from './action';

export default async function page({ searchParams }: { searchParams: { post_id?: string } }) {
  const { post_id } = await searchParams;
  const data = await getUsersPageList(); 
  let postDetails= undefined;
  if(post_id){
    postDetails = await getPostById(post_id);
  }

  return (
   <IGPostComposer pages={data} initialPost={postDetails || undefined}/>
  )
}
