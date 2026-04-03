
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageSquare, Bookmark, MoreHorizontal, ShoppingBag, Sparkles, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StoryReel } from '@/components/story-reel';
import { users as allUsers, stories } from '@/lib/data';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/cart-context';

// ─── Feed Post interface ─────────────────────────────────────────────────────
interface FeedPost {
  id: string;
  user: { id: string; username: string; avatar: string };
  caption: string;
  product: Product;
  likes: number;
  timeAgo: string;
  isLiked?: boolean;
  isSaved?: boolean;
}

// Kullanıcı avatarları (mock)
const MOCK_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
];

const MOCK_USERS = [
  { id: 'u1', username: 'maybeno', avatar: MOCK_AVATARS[0] },
  { id: 'u2', username: 'perisu', avatar: MOCK_AVATARS[1] },
  { id: 'u3', username: 'henife', avatar: MOCK_AVATARS[2] },
  { id: 'u4', username: 'zeynep_mode', avatar: MOCK_AVATARS[3] },
  { id: 'u5', username: 'elif_style', avatar: MOCK_AVATARS[4] },
  { id: 'u6', username: 'ayse.trend', avatar: MOCK_AVATARS[5] },
];

const CAPTIONS = [
  'Obsessed with this piece 🔥 AI recommended it just for me!',
  'Summer outfit done ✨ Amazing shopping experience',
  "Today's look 💕 What do you think?",
  'This color is everywhere this season 🌿',
  'Found this dress with AI assistant, totally in love!',
  'New addition to my wardrobe 🛍️',
  'Weekend outfit ready 🌸',
  'The quality of this brand is unmatched 👏',
];

const TIME_STRS = ['2m ago', '15m ago', '1h ago', '3h ago', '5h ago', '8h ago', 'yesterday'];

function buildFeed(products: Product[]): FeedPost[] {
  return products.map((product, i) => ({
    id: `post-${product.id}-${i}`,
    user: MOCK_USERS[i % MOCK_USERS.length],
    caption: CAPTIONS[i % CAPTIONS.length],
    product,
    likes: product.likeCount,
    timeAgo: TIME_STRS[i % TIME_STRS.length],
    isLiked: false,
    isSaved: false,
  }));
}

// ─── Post Skeleton ────────────────────────────────────────────────────────────
function PostSkeleton() {
  return (
    <div className="border-b border-border pb-4 animate-pulse">
      <div className="flex items-center gap-3 p-4">
        <div className="h-10 w-10 rounded-full bg-muted" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-24 bg-muted rounded" />
          <div className="h-2.5 w-16 bg-muted rounded" />
        </div>
      </div>
      <div className="aspect-square bg-muted" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-32 bg-muted rounded" />
        <div className="h-3 w-48 bg-muted rounded" />
      </div>
    </div>
  );
}

// ─── Single Feed Post ─────────────────────────────────────────────────────────
function FeedPostCard({ post: initialPost }: { post: FeedPost }) {
  const [post, setPost] = useState(initialPost);
  const { addToCart } = useCart();

  const toggleLike = () => {
    setPost((p) => ({
      ...p,
      isLiked: !p.isLiked,
      likes: p.isLiked ? p.likes - 1 : p.likes + 1,
    }));
  };

  const toggleSave = () => {
    setPost((p) => ({ ...p, isSaved: !p.isSaved }));
  };

  return (
    <article className="border-b border-border bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Link href={`/profile/${post.user.username}`}>
          <div className="relative h-10 w-10 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex-shrink-0">
            <div className="bg-background rounded-full p-0.5 h-full w-full">
              <Avatar className="h-full w-full">
                <AvatarImage src={post.user.avatar} alt={post.user.username} data-ai-hint="person" />
                <AvatarFallback>{post.user.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${post.user.username}`} className="font-semibold text-sm hover:underline">
            {post.user.username}
          </Link>
          <p className="text-xs text-muted-foreground">{post.timeAgo}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Product image */}
      <div className="relative aspect-square w-full bg-muted overflow-hidden">
        <Image
          src={post.product.imageUrls[0]}
          alt={post.product.name}
          fill
          className="object-cover"
          data-ai-hint="fashion product"
        />
        {/* Shopping tag overlay */}
        <button
          onClick={() => addToCart(post.product)}
          className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-semibold shadow-md hover:bg-white transition-colors group"
        >
          <ShoppingBag className="h-3.5 w-3.5 text-primary" />
          <span className="text-foreground">₺{post.product.price.toFixed(0)}</span>
          <span className="text-muted-foreground hidden group-hover:inline">· Add to Cart</span>
        </button>
      </div>

      {/* Actions */}
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <button
              onClick={toggleLike}
              className={cn(
                'p-2 -ml-2 rounded-full transition-all duration-200 active:scale-90',
                post.isLiked ? 'text-red-500' : 'text-foreground hover:text-muted-foreground'
              )}
            >
              <Heart className={cn('h-6 w-6', post.isLiked && 'fill-red-500')} />
            </button>
            <button className="p-2 rounded-full hover:text-muted-foreground transition-colors">
              <MessageSquare className="h-6 w-6" />
            </button>
          </div>
          <button
            onClick={toggleSave}
            className={cn(
              'p-2 rounded-full transition-all duration-200',
              post.isSaved ? 'text-foreground' : 'hover:text-muted-foreground'
            )}
          >
            <Bookmark className={cn('h-6 w-6', post.isSaved && 'fill-foreground')} />
          </button>
        </div>

        {/* Likes count */}
        <p className="text-sm font-semibold">{post.likes.toLocaleString('en-US')} likes</p>

        {/* Caption */}
        <p className="text-sm mt-1">
          <Link href={`/profile/${post.user.username}`} className="font-semibold hover:underline mr-1.5">
            {post.user.username}
          </Link>
          {post.caption}
        </p>

        {/* Product link */}
        <Link
          href={`/product/${post.product.id}`}
          className="mt-1.5 flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          {post.product.name}
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
            ₺{post.product.price.toFixed(0)}
          </Badge>
        </Link>

        {/* Comments hint */}
        <button className="text-xs text-muted-foreground mt-1 hover:text-foreground transition-colors">
          View all comments
        </button>

        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wide">{post.timeAgo}</p>
      </div>

      {/* Bottom spacing */}
      <div className="h-4" />
    </article>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Story'si olan kullanıcılar
  const storyUsers = allUsers.filter((u) => u.hasStory);

  useEffect(() => {
    async function loadFeed() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/products?type=homepage');
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        const allProducts: Product[] = [
          ...(data.trending || []),
          ...(data.newArrivals || []),
        ];
        setFeed(buildFeed(allProducts));
      } catch (err) {
        console.error('Feed load error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadFeed();
  }, []);

  return (
    <div className="max-w-[470px] mx-auto pb-20 md:pb-6">

      {/* Stories */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3 overflow-x-auto scrollbar-hide">
          {/* Add story button */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="relative h-16 w-16">
              <div className="h-16 w-16 rounded-full border-2 border-dashed border-muted-foreground/40 flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors cursor-pointer">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground">Add your story</span>
          </div>

          {/* Other users' stories */}
          {storyUsers.map((user) => {
            const userStories = stories.filter((s) => s.userId === user.id);
            return (
              <Dialog key={user.id}>
                <DialogTrigger asChild>
                  <button className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div className="relative h-16 w-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
                      <div className="bg-background rounded-full p-[2px] h-full w-full">
                        <Avatar className="h-full w-full">
                          <AvatarImage
                            src={user.profilePictureUrl}
                            alt={user.username}
                            data-ai-hint="person"
                          />
                          <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium max-w-[64px] truncate">{user.username}</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="p-0 m-0 bg-black border-0 max-w-full h-screen sm:h-[95vh] sm:max-w-md sm:rounded-xl overflow-hidden">
                  <div className="relative w-full h-full">
                    {userStories[0] && (
                      <Image
                        src={userStories[0].imageUrl}
                        alt={user.username}
                        fill
                        className="object-cover"
                        data-ai-hint="story"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <Avatar className="h-8 w-8 border border-white">
                        <AvatarImage src={user.profilePictureUrl} data-ai-hint="person" />
                        <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-white text-sm font-semibold">{user.username}</span>
                      <span className="text-white/70 text-xs">2 sa önce</span>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            );
          })}
        </div>
      </div>

      {/* Feed */}
      <div>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <PostSkeleton key={i} />)
        ) : (
          feed.map((post) => <FeedPostCard key={post.id} post={post} />)
        )}

        {/* AI Banner post */}
        {!isLoading && (
          <div className="border-b border-border bg-gradient-to-br from-primary/5 to-amber-500/5 p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg">Your AI Style Assistant</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-4">
              Try our AI assistant for personalized outfit recommendations!
            </p>
            <Button asChild className="rounded-xl">
              <Link href="/chat">
                <Sparkles className="mr-2 h-4 w-4" />
                Explore with AI
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
