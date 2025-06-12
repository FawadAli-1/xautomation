"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Share } from "lucide-react";
import { apiService, type ApiError } from "@/services/api.service";
import { toast } from "sonner";

interface GeneratedContent {
  content: string;
  isThread: boolean;
  threadParts?: string[];
  scheduledTime?: string;
}

interface PostStatus {
  isPosting: boolean;
  error?: string;
  tweetIds?: string[];
}

export function PostForm() {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [postStatus, setPostStatus] = useState<PostStatus>({ isPosting: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setGeneratedContent(null);
    setIsLoading(true);

    try {
      const result = await apiService.generatePost(prompt, true);
      setGeneratedContent({
        content: result.content,
        isThread: result.isThread,
        threadParts: result.threadParts,
        scheduledTime: result.nextPostingTime?.time
      });
      toast.success("Content Generated", {
        description: "Your post has been generated successfully!"
      });
    } catch (err) {
      setError(err as ApiError);
      toast.error("Error", {
        description: (err as ApiError).message || "Failed to generate content"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostToTwitter = async () => {
    if (!generatedContent) return;

    setPostStatus({ isPosting: true });
    try {
      const result = await apiService.publishToTwitter(
        generatedContent.content,
        generatedContent.isThread,
        generatedContent.threadParts,
        file || undefined
      );
      
      setPostStatus({
        isPosting: false,
        tweetIds: result.tweetIds
      });

      toast.success("Posted Successfully", {
        description: generatedContent.isThread 
          ? `Thread posted successfully! (${result.tweetIds.length} tweets)`
          : "Tweet posted successfully!"
      });
    } catch (err) {
      setPostStatus({
        isPosting: false,
        error: (err as ApiError).message
      });

      toast.error("Error", {
        description: (err as ApiError).message || "Failed to post to X"
      });
    }
  };

  const getTweetUrl = (tweetId: string) => {
    return `https://twitter.com/i/web/status/${tweetId}`;
  };

  return (
    <div className="space-y-6 w-full max-w-2xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="What do you want to post about?"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[80px]"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="file">Attach a file (optional)</Label>
              <Input
                id="file"
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                disabled={isLoading}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate & Schedule"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error.message}
          </AlertDescription>
        </Alert>
      )}

      {postStatus.error && (
        <Alert variant="destructive">
          <AlertDescription>
            {postStatus.error}
          </AlertDescription>
        </Alert>
      )}

      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{generatedContent.isThread ? "Generated Thread" : "Generated Post"}</span>
              <Button
                onClick={handlePostToTwitter}
                disabled={postStatus.isPosting}
                variant="outline"
                size="sm"
              >
                {postStatus.isPosting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Share className="mr-2 h-4 w-4" />
                    Post to X
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedContent.isThread && generatedContent.threadParts ? (
              <div className="space-y-4">
                {generatedContent.threadParts.map((part, index) => (
                  <div key={index} className="rounded-lg bg-muted p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Tweet {index + 1}/{generatedContent.threadParts?.length}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {part.length} characters
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{part}</p>
                    {postStatus.tweetIds?.[index] && (
                      <a
                        href={getTweetUrl(postStatus.tweetIds[index])}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline mt-2 block"
                      >
                        View on X →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-muted p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {generatedContent.content.length} characters
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{generatedContent.content}</p>
                {postStatus.tweetIds?.[0] && (
                  <a
                    href={getTweetUrl(postStatus.tweetIds[0])}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline mt-2 block"
                  >
                    View on X →
                  </a>
                )}
              </div>
            )}
            {generatedContent.scheduledTime && (
              <p className="text-sm text-muted-foreground">
                First post scheduled for: {new Date(generatedContent.scheduledTime).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 