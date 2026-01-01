import { gql, useQuery, useMutation } from '@apollo/client';
import { useParams } from 'react-router-dom';

const POST = gql`
  query Post($id: ID!) {
    post(id: $id) {
      id title body status
      coverMedia { url type }
      counters { likes shares comments }
    }
  }
`;

const BUMP = gql`
  mutation Bump($id: ID!, $likes: Int, $shares: Int, $comments: Int) {
    incrementCounters(id: $id, likes: $likes, shares: $shares, comments: $comments) {
      likes shares comments
    }
  }
`;

export default function PostDetail() {
  const { id } = useParams();
  const { data, loading, error, refetch } = useQuery(POST, { variables: { id } });
  const [bump] = useMutation(BUMP, { onCompleted: () => refetch() });

  if (loading) return <div className="container">Loading...</div>;
  if (error || !data?.post) return <div className="container">Not found</div>;

  const p = data.post;
  return (
    <div className="container">
      <h1>{p.title}</h1>
      {p.coverMedia?.type === 'IMAGE' && <img className="cover" src={p.coverMedia.url} alt={p.title} />}
      {p.coverMedia?.type === 'VIDEO' && <video className="cover" controls src={p.coverMedia.url} />}
      <p>{p.body}</p>
      <div className="counter">
        <button onClick={() => bump({ variables: { id, likes: 1 } })}>👍 {p.counters?.likes ?? 0}</button>
        <button onClick={() => bump({ variables: { id, shares: 1 } })}>↗️ {p.counters?.shares ?? 0}</button>
        <button onClick={() => bump({ variables: { id, comments: 1 } })}>💬 {p.counters?.comments ?? 0}</button>
      </div>
    </div>
  );
}