import React from 'react'
import FBPostComposer from './Compose'
import { getUsersPageList } from '../../platform/facebook_pages/action';

export default async function page() {
  const data = await getUsersPageList();
   
  return (
   <FBPostComposer pages={data} />
  )
}
