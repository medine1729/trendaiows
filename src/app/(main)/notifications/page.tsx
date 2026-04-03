
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { users } from '@/lib/data';
import { UserPlus, Heart, MessageSquare } from 'lucide-react';

const notifications = [
  {
    id: 1,
    type: 'follow_request',
    user: { id: 'user3', username: 'ahmet', profilePictureUrl: 'https://placehold.co/100x100', followerCount: 0, followingCount: 0 },
    text: 'sizi takip etmek istiyor.',
    time: '2s',
  },
  {
    id: 2,
    type: 'like',
    user: users[1], // henife
    text: 'gönderini beğendi.',
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
    text: 'sizi takip etmek istiyor.',
    time: '3g',
  },
   {
    id: 5,
    type: 'like',
    user: { id: 'user5', username: 'mehmet', profilePictureUrl: 'https://placehold.co/100x100', followerCount: 0, followingCount: 0 },
    text: 'gönderini beğendi.',
    time: '1h',
    postPreview: 'https://placehold.co/600x800'
  },
];

const NotificationIcon = ({ type }: { type: string }) => {
    const iconStyle = "h-8 w-8 text-white p-1.5 rounded-full";
    switch (type) {
        case 'follow_request':
            return <div className="bg-blue-500 rounded-full p-1"><UserPlus className={iconStyle} /></div>;
        case 'like':
            return <div className="bg-red-500 rounded-full p-1"><Heart className={iconStyle} /></div>;
        case 'comment':
            return <div className="bg-green-500 rounded-full p-1"><MessageSquare className={iconStyle} /></div>;
        default:
            return null;
    }
}


export default function NotificationsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Bildirimler</h1>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {notifications.map((notification) => (
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
                    <Button size="sm">Kabul Et</Button>
                    <Button size="sm" variant="outline">Reddet</Button>
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
