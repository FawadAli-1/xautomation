"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ScheduledPost = {
  id: string;
  content: string;
  scheduledTime: string;
  status: 'scheduled' | 'posted' | 'failed';
};

export function ScheduledPosts({ posts = [] }: { posts: ScheduledPost[] }) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Scheduled Posts</CardTitle>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No posts scheduled yet.
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-2">
                      Scheduled for: {new Date(post.scheduledTime).toLocaleString()}
                    </p>
                    <p className="text-sm">{post.content}</p>
                  </div>
                  <div className="text-xs font-medium">
                    <span className={`px-2 py-1 rounded-full ${
                      post.status === 'posted' 
                        ? 'bg-green-100 text-green-800'
                        : post.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 