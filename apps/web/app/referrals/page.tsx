import Link from "next/link";

async function getData() {
  return { code: "yourcode", clicks: 0, signups: 0, earningsPoints: 0 };
}

export default async function ReferralsPage() {
  const data = await getData();
  const link = `https://solman.gg/r/${data.code}`;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Referral Program</h1>
      <div className="rounded-lg border border-white/10 p-4">
        <div className="font-mono text-sm">Your link: {link}</div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-white/10 p-4">
          <div className="text-sm opacity-60">Clicks</div>
          <div className="text-2xl font-bold">{data.clicks}</div>
        </div>
        <div className="rounded-lg border border-white/10 p-4">
          <div className="text-sm opacity-60">Signups</div>
          <div className="text-2xl font-bold">{data.signups}</div>
        </div>
        <div className="rounded-lg border border-white/10 p-4">
          <div className="text-sm opacity-60">Points Earned</div>
          <div className="text-2xl font-bold">{data.earningsPoints}</div>
        </div>
      </div>
      <Link href="/docs/referrals" className="underline text-brand-green">Learn how it works</Link>
    </div>
  );
}
