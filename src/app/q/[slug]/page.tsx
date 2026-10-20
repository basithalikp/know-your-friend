import React from 'react';
import TakeQuizClient from './TakeQuizClient';

export default async function TakeQuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <TakeQuizClient slug={slug} />;
}
