import { useState } from 'react';
import { Star, User, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useProductReviews, useCanReview, useSubmitReview } from '@/hooks/use-reviews';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface ProductReviewsProps {
  productId: string;
  productRating: number;
  ratingCount: number;
}

export default function ProductReviews({ productId, productRating, ratingCount }: ProductReviewsProps) {
  const { user } = useAuth();
  const { data: reviews, isLoading } = useProductReviews(productId);
  const { data: canReviewData } = useCanReview(productId);
  const submitReview = useSubmitReview();
  
  const [isWriting, setIsWriting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Silakan login untuk memberikan ulasan');
      return;
    }

    try {
      await submitReview.mutateAsync({
        product_id: productId,
        order_id: canReviewData?.eligibleOrders[0],
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success('Ulasan berhasil dikirim!');
      setIsWriting(false);
      setRating(5);
      setComment('');
    } catch (error) {
      toast.error('Gagal mengirim ulasan');
    }
  };

  const renderStars = (value: number, interactive = false, size = 'h-5 w-5') => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} transition-colors ${
              star <= (interactive ? hoveredStar || value : value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground/30'
            } ${interactive ? 'cursor-pointer' : ''}`}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoveredStar(star) : undefined}
            onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Rating Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {ratingCount > 0 ? (
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground">{productRating.toFixed(1)}</div>
              <div className="flex justify-center mt-1">{renderStars(Math.round(productRating), false, 'h-4 w-4')}</div>
              <div className="text-sm text-muted-foreground mt-1">{ratingCount} ulasan</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-muted-foreground text-sm">Belum ada ulasan</div>
            </div>
          )}
        </div>

        {/* Write Review Button */}
        {user && canReviewData?.canReview && !isWriting && (
          <Button onClick={() => setIsWriting(true)} variant="outline" className="shrink-0">
            <MessageSquare className="h-4 w-4 mr-2" />
            Tulis Ulasan
          </Button>
        )}
      </div>

      {/* Write Review Form */}
      {isWriting && (
        <div className="bg-muted/30 rounded-2xl p-6 border border-border animate-fade-in">
          <h4 className="font-semibold mb-4">Berikan Ulasan Anda</h4>
          
          <div className="mb-4">
            <label className="text-sm text-muted-foreground mb-2 block">Rating</label>
            {renderStars(rating, true, 'h-8 w-8')}
          </div>
          
          <div className="mb-4">
            <label className="text-sm text-muted-foreground mb-2 block">Komentar (opsional)</label>
            <Textarea
              placeholder="Bagikan pengalaman Anda dengan produk ini..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleSubmitReview}
              disabled={submitReview.isPending}
            >
              {submitReview.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Kirim Ulasan
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setIsWriting(false);
                setRating(5);
                setComment('');
              }}
            >
              Batal
            </Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-card rounded-xl p-5 border border-border/50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <span className="font-medium text-foreground">Pelanggan</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), { 
                        addSuffix: true, 
                        locale: idLocale 
                      })}
                    </span>
                  </div>
                  {renderStars(review.rating, false, 'h-4 w-4')}
                  {review.comment && (
                    <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-muted/30 rounded-2xl">
          <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Belum ada ulasan untuk produk ini</p>
          {!user && (
            <p className="text-sm text-muted-foreground mt-2">
              Login dan beli produk ini untuk memberikan ulasan
            </p>
          )}
        </div>
      )}
    </div>
  );
}
