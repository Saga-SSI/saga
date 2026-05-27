import { navFont, sortsMillGoudy } from "@/app/fonts";

interface AppPageHeaderProps {
  title: string;
  description: string;
}

export default function AppPageHeader({ title, description }: AppPageHeaderProps) {
  return (
    <header>
      <h1
        className={`${sortsMillGoudy.className} text-3xl tracking-[-0.04em] text-white`}
      >
        {title}
      </h1>
      <p className={`${navFont.className} mt-2 text-sm text-white/45`}>{description}</p>
    </header>
  );
}
