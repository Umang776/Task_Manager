import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { api } from '../api/client.js';
import { Loader } from './Loader.jsx';
import { useConfirm } from './ui/ConfirmDialog.jsx';
import { Textarea } from './ui/Input.jsx';
import { Button } from './ui/Button.jsx';

export function TaskCommentsPanel({ taskId, userId, isAdmin, onChanged }) {
  const confirm = useConfirm();
  const { register, handleSubmit, reset } = useForm({ defaultValues: { body: '' } });
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editBody, setEditBody] = useState('');

  const loadComments = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const res = await api.get(`tasks/${taskId}/comments`);
      setComments(res.data.data);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    reset({ body: '' });
    setEditingId(null);
    loadComments();
  }, [taskId, loadComments, reset]);

  const onComment = async (values) => {
    if (!taskId) return;
    try {
      await api.post(`tasks/${taskId}/comments`, { body: values.body });
      toast.success('Comment added');
      reset({ body: '' });
      await loadComments();
      onChanged?.();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add comment');
    }
  };

  const saveEdit = async (commentId) => {
    if (!editBody.trim()) return;
    try {
      await api.patch(`tasks/${taskId}/comments/${commentId}`, { body: editBody.trim() });
      toast.success('Comment updated');
      setEditingId(null);
      await loadComments();
      onChanged?.();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    }
  };

  const removeComment = async (commentId) => {
    const ok = await confirm({
      title: 'Delete comment',
      message: 'Remove this comment?',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`tasks/${taskId}/comments/${commentId}`);
      toast.success('Comment removed');
      await loadComments();
      onChanged?.();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  if (!taskId) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Comments</h3>
      {loading ? (
        <Loader className="py-6" />
      ) : (
        <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto rounded-xl border border-slate-100 p-2 dark:border-slate-800 md:max-h-96">
          {comments.length === 0 ? (
            <li className="text-xs text-slate-500">No comments yet.</li>
          ) : (
            comments.map((c) => {
              const canModerate =
                isAdmin || (userId && String(c.user?._id || c.user) === String(userId));
              return (
                <li key={c._id} className="rounded-lg bg-slate-50 p-2 text-xs dark:bg-slate-800/80">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{c.user?.name}</p>
                  {editingId === c._id ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        rows={2}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded-lg bg-indigo-600 px-2 py-1 text-[11px] font-semibold text-white"
                          onClick={() => saveEdit(c._id)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] dark:border-slate-600"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-slate-600 dark:text-slate-300">{c.body}</p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {new Date(c.createdAt).toLocaleString()}
                      </p>
                      {canModerate ? (
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            className="text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                            onClick={() => {
                              setEditingId(c._id);
                              setEditBody(c.body);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="text-[11px] font-semibold text-red-600 hover:underline"
                            onClick={() => removeComment(c._id)}
                          >
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </>
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
      <form className="mt-3 space-y-2" onSubmit={handleSubmit(onComment)}>
        <Textarea rows={2} placeholder="Write a comment" {...register('body', { required: true })} />
        <Button type="submit" className="!text-xs">
          Post comment
        </Button>
      </form>
    </div>
  );
}
