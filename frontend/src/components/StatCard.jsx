export default function StatCard({ icon, label, value, color, bg, border, extra }) {
    return (
        <div className={`card glass border ${border} hover:scale-105 transition-all duration-300 group h-full`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{label}</p>
                    <p className={`text-4xl font-black mt-2 tracking-tighter ${color}`}>{value}</p>
                    {extra}
                </div>
                <div className={`${bg} p-3.5 rounded-2xl text-2xl border ${border} shadow-inner group-hover:rotate-12 transition-transform`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
