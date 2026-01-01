import { gql, useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import AdminGuard from '../components/AdminGuard';

const ME = gql`query Me { me { id role email } }`;
const POSTS = gql`
  query Posts {
    posts {
      id title body status
      coverMedia { id url type }
      counters { likes shares comments }
    }
  }
`;

const SIGNUP = gql`mutation Signup($email: String!, $password: String!) { signup(email: $email, password: $password) { user { email role } } }`;
const LOGIN = gql`mutation Login($email: String!, $password: String!) { login(email: $email, password: $password) { user { email role } } }`;
const LOGOUT = gql`mutation Logout { logout }`;

const CREATE = gql`
  mutation Create($title: String!, $body: String!, $coverMediaId: ID) {
    createPost(title: $title, body: $body, coverMediaId: $coverMediaId) { id title body status }
  }
`;

const UPDATE = gql`
  mutation Update($id: ID!, $status: PostStatus) {
    updatePost(id: $id, status: $status) { id status }
  }
`;

const DELETE = gql`
  mutation Delete($id: ID!) { deletePost(id: $id) }
`;

const PRESIGN = gql`
  mutation Presign($fileName: String!, $mime: String!, $size: Int!) {
    createUploadUrl(fileName: $fileName, mime: $mime, size: $size) {
      url publicUrl mediaId objectKey
    }
  }
`;

export default function Admin() {
  const { refetch: refetchMe } = useQuery(ME);
  const { data, loading, error, refetch } = useQuery(POSTS);
  const [signup] = useMutation(SIGNUP, { onCompleted: () => refetchMe() });
  const [login] = useMutation(LOGIN, { onCompleted: () => refetchMe() });
  const [logout] = useMutation(LOGOUT, { onCompleted: () => refetchMe() });

  const [create] = useMutation(CREATE, { onCompleted: () => { refetch(); setCoverMediaId(null); setFilePreview(null); } });
  const [update] = useMutation(UPDATE, { onCompleted: () => refetch() });
  const [del] = useMutation(DELETE, { onCompleted: () => refetch() });
  const [presign] = useMutation(PRESIGN);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [coverMediaId, setCoverMediaId] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleUpload = async (file: File) => {
    const { data } = await presign({ variables: { fileName: file.name, mime: file.type, size: file.size } });
    const { url, mediaId } = data.createUploadUrl;
    await fetch(url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
    setCoverMediaId(mediaId);
    setFilePreview(URL.createObjectURL(file));
  };

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container">Error: {error.message}</div>;

  return (
    <AdminGuard>
      <div className="container">
        <h2>Auth</h2>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => signup({ variables: { email, password } })}>Signup (admin)</button>
          <button onClick={() => login({ variables: { email, password } })}>Login</button>
          <button onClick={() => logout()}>Logout</button>
        </div>

        <h2>Create Post</h2>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea placeholder="Body" value={body} onChange={e => setBody(e.target.value)} />
        <div>
          <input type="file" accept="image/*,video/*" onChange={e => e.target.files && handleUpload(e.target.files[0])} />
          {filePreview && <div><strong>Preview:</strong><br /><img className="cover" src={filePreview} /></div>}
        </div>
        <button className="button" onClick={() => create({ variables: { title, body, coverMediaId } })}>Create</button>

        <h2>Manage Posts</h2>
        {data.posts.map((p: any) => (
          <div key={p.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{p.title}</strong>
              <span className="badge">{p.status}</span>
            </div>
            {p.coverMedia?.type === 'IMAGE' && <img className="cover" src={p.coverMedia.url} />}
            {p.coverMedia?.type === 'VIDEO' && <video className="cover" controls src={p.coverMedia.url} />}
            <div className="counter">
              <span>👍 {p.counters?.likes ?? 0}</span>
              <span>↗️ {p.counters?.shares ?? 0}</span>
              <span>💬 {p.counters?.comments ?? 0}</span>
            </div>
            <button onClick={() => update({ variables: { id: p.id, status: p.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' } })}>
              {p.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
            </button>
            <button style={{ marginLeft: '0.5rem' }} onClick={() => del({ variables: { id: p.id } })}>Delete</button>
          </div>
        ))}
      </div>
    </AdminGuard>
  );
}