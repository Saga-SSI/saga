import AppPageHeader from "@/components/AppPageHeader";

export default function HomePage() {
  return (
    <div className="flex h-[calc(100dvh-3rem)] min-h-0 flex-col p-6">
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col">
        <AppPageHeader
          title="Home"
          description="Your feed and updates across the Saga network."
        />
      </div>
    </div>
  );
}
