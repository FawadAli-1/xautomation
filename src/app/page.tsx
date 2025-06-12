import { PostForm } from "./components/post-form";
import { ScheduledPosts } from "./components/scheduled-posts";
import { PageContainer } from "./components/layout/page-container";

export default function Home() {
  return (
    <PageContainer>
      <h1 className="text-3xl font-bold mb-6 text-center">X Automation App</h1>
      <PostForm />
      <ScheduledPosts posts={[]} />
    </PageContainer>
  );
}
