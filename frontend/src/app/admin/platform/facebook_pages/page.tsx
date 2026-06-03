import React from 'react'
import { getUsersPageList } from './action';
import PagesListPage from './PageListPage';


export default async function page() {
    const data = await getUsersPageList();
    
  return (
    <PagesListPage data={data} />
  )
}
