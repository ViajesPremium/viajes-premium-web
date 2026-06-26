import type { Metadata } from "next";
import BlogSection from "@/features/blog/sections/BlogPage";

export const metadata: Metadata = {
  title: "Blog | Viajes Premium",
  description:
    "Guías y recorridos que inspiran experiencias premium alrededor del mundo.",
};

export default function BlogPage() {
  return <BlogSection />;
}
