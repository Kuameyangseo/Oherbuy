const StatItem = ({label, value}: {label: string; value: string | number}) => (
  <div className="bg-white/90 rounded-lg p-4 text-center shadow">
    <div className="text-2xl font-bold text-slate-800">{value}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);

const Stats = ({data}: {data?: {listings: number; monthlySales: number; revenue: number}}) => {
  const d = data ?? {listings: 12, monthlySales: 342, revenue: 12450};
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatItem label="Active listings" value={d.listings} />
      <StatItem label="Monthly sales" value={d.monthlySales} />
      <StatItem label="Revenue (USD)" value={`$${d.revenue.toLocaleString()}`} />
    </section>
  );
};

export default Stats;
