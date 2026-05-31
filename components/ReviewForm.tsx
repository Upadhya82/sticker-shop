'use client';

import { useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function ReviewForm() {
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      rating >= 1 &&
      rating <= 5 &&
      comment.trim().length >= 2 &&
      !loading
    );
  }, [rating, comment, loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!canSubmit) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        customer_name: customerName.trim() ? customerName.trim() : null,
        rating,
        comment: comment.trim(),
      });

      if (error) throw error;

      setSuccessMsg('Thanks! Your review was submitted.');
      setCustomerName('');
      setRating(5);
      setComment('');
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm text-zinc-300">Name (optional)</label>
        <input
          type="text"
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none ring-0 placeholder:text-zinc-600 focus:border-white/20"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Your name"
        />
      </div>

      <div>
        <label className="text-sm text-zinc-300">Rating</label>
        <select
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-white/20"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          <option value={5}>5 - Excellent</option>
          <option value={4}>4 - Good</option>
          <option value={3}>3 - Okay</option>
          <option value={2}>2 - Bad</option>
          <option value={1}>1 - Terrible</option>
        </select>
      </div>

      <div>
        <label className="text-sm text-zinc-300">Comment</label>
        <textarea
          className="mt-1 min-h-[120px] w-full resize-y rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-white/20"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about the service..."
        />
        <p className="mt-1 text-xs text-zinc-500">
          Minimum 2 characters.
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-red-500/20 bg-red-950/30 p-3 text-sm text-red-200">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/30 p-3 text-sm text-emerald-200">
          {successMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}