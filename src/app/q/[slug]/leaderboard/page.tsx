import React from 'react';
import LeaderboardClient from './LeaderboardClient';

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <LeaderboardClient slug={slug} />;
}
