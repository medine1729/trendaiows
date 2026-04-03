
'use client';

import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { users } from '@/lib/data';
import { UserPlus, Heart, MessageSquare, Camera } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const allNotifications = [
    {
        id: 1,
        type: 'follow_request',
        user: { id: 'user3', username: 'ahmet', profilePictureUrl: 'https://placehold.co/100x100', followerCount: 0, followingCount: 0 },
        text: 'wants to follow you.',
        time: '2s',
    },
     {
        id: 2,
        type: 'like',
        user: users[1], // henife
        text: 'liked your post.',
        time: '5s',
        postPreview: 'https://placehold.co/600x800'
    },
    {
        id: 3,
        type: 'comment',
        user: users[0], // perisu
        text: 'commented on your post: "Looks great!"',
        time: '1d',
        postPreview: 'https://placehold.co/600x800'
    },
    {
        id: 4,
        type: 'follow_request',
        user: { id: 'user4', username: 'zeynep', profilePictureUrl: 'https://placehold.co/100x100', followerCount: 0, followingCount: 0 },
        text: 'wants to follow you.',
        time: '3d',
    },
     {
        id: 5,
        type: 'like',
        user: { id: 'user5', username: 'mehmet', profilePictureUrl: 'https://placehold.co/100x100', followerCount: 0, followingCount: 0 },
        text: 'liked your post.',
        time: '1h',
        postPreview: 'https://placehold.co/600x800'
    },
];

const NotificationIcon = ({ type }: { type: string }) => {
    const iconStyle = "h-6 w-6";
    switch (type) {
        case 'follow_request':
            return <UserPlus className={iconStyle} />;
        case 'like':
            return <Heart className={iconStyle} />;
        case 'comment':
            return <MessageSquare className={iconStyle} />;
        default:
            return null;
    }
}

const NotificationItem = ({ notification }: { notification: any }) => (
    <div key={notification.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
        <NotificationIcon type={notification.type} />
        <Avatar className="h-12 w-12">
            <AvatarImage src={notification.user.profilePictureUrl} alt={notification.user.username} data-ai-hint="person face" />
            <AvatarFallback>{notification.user.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
            <p>
                <span className="font-semibold">{notification.user.username}</span>
                {' '}
                {notification.text}
            </p>
            <p className="text-xs text-muted-foreground">{notification.time}</p>
        </div>
        {notification.type === 'follow_request' && (
            <div className="flex gap-2">
                <Button size="sm">Accept</Button>
                <Button size="sm" variant="outline">Decline</Button>
            </div>
        )}
        {notification.postPreview && (
            <Image
                src={notification.postPreview}
                alt="Post preview"
                width={56}
                height={56}
                className="rounded-md object-cover"
                data-ai-hint="product image"
            />
        )}
    </div>
);


const EmptyState = ({ title, description, icon: Icon }: { title: string, description: string, icon: React.ElementType }) => (
    <div className="text-center py-16">
        <div className="mx-auto h-20 w-20 rounded-full border-2 border-foreground flex items-center justify-center mb-4">
            <Icon className="h-10 w-10 text-foreground" />
        </div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground mt-2">{description}</p>
    </div>
);


export default function ActivityPage() {
    const likes = allNotifications.filter(n => n.type === 'like');
    const comments = allNotifications.filter(n => n.type === 'comment');

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Your Activity</h1>
      
      <Tabs defaultValue="likes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="likes">
            <Heart className="mr-2 h-4 w-4"/> Likes
          </TabsTrigger>
          <TabsTrigger value="comments">
            <MessageSquare className="mr-2 h-4 w-4"/> Comments
          </TabsTrigger>
        </TabsList>
        <TabsContent value="likes">
            <Card>
                <CardContent className="p-0">
                    {likes.length > 0 ? (
                        <div className="divide-y">
                            {likes.map((notification) => (
                                <NotificationItem key={notification.id} notification={notification} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState 
                            title="No likes yet"
                            description="When you like posts, they will appear here."
                            icon={Heart}
                        />
                    )}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="comments">
           <Card>
                <CardContent className="p-0">
                    {comments.length > 0 ? (
                        <div className="divide-y">
                            {comments.map((notification) => (
                                <NotificationItem key={notification.id} notification={notification} />
                            ))}
                        </div>
                    ) : (
                         <EmptyState 
                            title="No comments yet"
                            description="Posts you comment on will appear here."
                            icon={MessageSquare}
                        />
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
