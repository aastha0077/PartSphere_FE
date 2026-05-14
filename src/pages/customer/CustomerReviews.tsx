import React, { useEffect, useState } from 'react';
import { Star, MessageSquarePlus, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
}

const CustomerReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<Review[]>('/customer/reviews');
      setReviews(res.data || []);
    } catch {
      toast.error('Could not load your reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/customer/reviews', { rating, comment });
      toast.success('Thank you for your feedback.');
      setComment('');
      setRating(5);
      await load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <MessageSquarePlus className="text-indigo-500" />
          Service <span className="text-indigo-500">Reviews</span>
        </h1>
        <p className="text-gray-400 mt-2">
          Share your experience with our vehicle service center. Your feedback helps us improve parts availability and service quality.
        </p>
      </div>

      <form onSubmit={submit} className="bg-[#0d0d12] border border-white/10 rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-colors"
                aria-label={`${n} stars`}
              >
                <Star
                  size={28}
                  className={n <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Comments</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Tell us about your visit, parts quality, or booking experience…"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 outline-none focus:border-indigo-500 resize-y"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
        >
          {submitting ? <Loader2 className="animate-spin" size={20} /> : null}
          Submit review
        </button>
      </form>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Your past reviews</h2>
        {loading ? (
          <div className="flex justify-center py-12 text-gray-500">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-gray-500 py-8 text-center border border-dashed border-white/10 rounded-xl">
            You have not submitted any reviews yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li
                key={r.id}
                className="bg-[#0d0d12] border border-white/10 rounded-xl p-5 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2 text-amber-400">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} size={16} className="fill-amber-400" />
                  ))}
                </div>
                {r.comment ? (
                  <p className="text-gray-300 whitespace-pre-wrap">{r.comment}</p>
                ) : (
                  <p className="text-gray-600 italic text-sm">No written comment.</p>
                )}
                <p className="text-xs text-gray-500">
                  {new Date(r.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CustomerReviews;
