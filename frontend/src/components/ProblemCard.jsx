import { Link } from 'react-router-dom';

export default function ProblemCard({ problem, onDelete, onNotesClick, deleting, getDueStatus }) {
    const due = getDueStatus(problem.nextRevisionDate);

    return (
        <div className="card hover:border-brand-500/30 transition-all duration-200 group">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className={
                            problem.difficulty === 'Easy' ? 'badge-easy' :
                                problem.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'
                        }>
                            {problem.difficulty}
                        </span>
                        <h3 className="font-semibold text-slate-100 text-base truncate">
                            <a href={problem.leetcodeUrl} target="_blank" rel="noreferrer" className="hover:text-brand-400 transition-colors">
                                {problem.title}
                            </a>
                        </h3>
                        {problem.leetcodeUrl && (
                            <a href={problem.leetcodeUrl} target="_blank" rel="noreferrer"
                                className="text-brand-400 hover:text-brand-300 text-xs underline">
                                LC ↗
                            </a>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {problem.topics.map((t) => (
                            <span key={t} className="topic-tag">{t}</span>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                        <div className={`text-xs font-medium ${due.cls}`}>{due.label}</div>
                        <div className="text-xs text-slate-500 mt-0.5">#{problem.revisionCount} reviews</div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onNotesClick}
                            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                            title="View/Edit Notes"
                        >
                            📝 <span className="hidden sm:inline">Notes</span>
                        </button>
                        <Link to={`/edit/${problem._id}`}
                            className="btn-secondary text-xs px-3 py-1.5">
                            Edit
                        </Link>
                        <button
                            onClick={() => onDelete(problem._id)}
                            disabled={deleting === problem._id}
                            className="btn-danger text-xs px-3 py-1.5"
                        >
                            {deleting === problem._id ? '...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>
            
            {(problem.notes || problem.bruteForce || problem.optimizedApproach || problem.mistakes) && (
                <div className="mt-3 pt-3 border-t border-brand-500/10 space-y-2">
                    {problem.mistakes && (
                        <p className="text-[10px] text-red-500/80 font-bold uppercase tracking-tight">Mistakes: <span className="text-slate-500 normal-case font-medium line-clamp-1">{problem.mistakes}</span></p>
                    )}
                    {(problem.notes || problem.bruteForce || problem.optimizedApproach) && (
                        <p className="text-xs text-slate-500 line-clamp-2 italic">
                            {problem.notes || problem.optimizedApproach || problem.bruteForce}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
