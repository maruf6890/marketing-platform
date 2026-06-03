import React from 'react'
import IntegrationsPage from './IntegrationsPage';
import { getIntegrations, PlatformAccount } from './action';

export default async function page() {
  const data = await getIntegrations() as {data: Record<string, PlatformAccount>};
  console.log(data)
  return <IntegrationsPage data={data.data} />;
}
