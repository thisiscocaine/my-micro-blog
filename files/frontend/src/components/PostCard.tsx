import { Link } from 'react-router-dom';

interface Props {
  id: string;
  title: string;
  excerpt: string;
  status: string;
  counters?: { likes: number; shares: number; comments: number } | null;
  coverMedia?: { url: string; type: string } | null;
}

export default function PostCard({ id, title, excerpt, status, counters, coverMedia }: Props) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h3>{title}</h3>
        <span className="badge">{status}</span>
      </div>
      {coverMedia && coverMedia.type === 'IMAGE' && <img src={coverMedia.url} alt={title} className="cover" />}
      {coverMedia && coverMedia.type === 'VIDEO' && (
        <video className="cover" controls src={coverMedia.url} />
      )}
      <p>{excerpt}</p>
      <div className="counter">
        <span>👍 {counters?.likes ?? 0}</span>
        <span>↗️ {counters?.shares ?? 0}</span>
        <span>💬 {counters?.comments ?? 0}</span>
      </div>
      <Link className="button" to={`/post/${id}`}>Open</Link>
    </div>
  );
}