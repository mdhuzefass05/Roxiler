import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import StarRating, { getRatingColor } from './StarRating';
import { replyToRatingApi } from '../../api/ratings.api';
import useToast from '../../hooks/useToast';

const OwnerReplyModal = ({ isOpen, onClose, review, onReplied }) => {
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const handleOpen = () => {
    if (review) {
      setReplyText(review.owner_reply || '');
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      setError('Please enter a response message.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await replyToRatingApi(review.id, replyText.trim());
      toast.success('Your official store reply was posted!');
      if (onReplied) onReplied();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post reply.');
    } finally {
      setLoading(false);
    }
  };

  if (!review) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reply to Customer Review"
    >
      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="alert alert--error" role="alert" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Customer Review Summary Box */}
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'var(--color-input-bg)',
            boxShadow: 'var(--shadow-clay-pressed)',
            borderRadius: '20px',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <strong>{review.user?.name || review.user_name || 'Verified Customer'}</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <StarRating value={review.rating_value} size="sm" />
              <strong style={{ color: getRatingColor(review.rating_value) }}>{review.rating_value} ★</strong>
            </div>
          </div>
          {review.comment ? (
            <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--color-foreground)' }}>
              &ldquo;{review.comment}&rdquo;
            </p>
          ) : (
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>No written feedback provided.</p>
          )}
        </div>

        {/* Owner Reply Textarea */}
        <div className="form-group">
          <label htmlFor="owner-reply-text" className="form-label">
            Your Official Business Response
          </label>
          <textarea
            id="owner-reply-text"
            rows="4"
            maxLength={500}
            placeholder="Thank the customer, address their feedback, or invite them back for their next visit…"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="form-input"
            style={{ height: 'auto', padding: '0.85rem 1.25rem', borderRadius: '18px' }}
            required
          />
          <span className="form-helper-text" style={{ textAlign: 'right', display: 'block' }}>
            {replyText.length}/500 characters
          </span>
        </div>

        <div className="modal-actions">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Post Store Reply
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default OwnerReplyModal;
