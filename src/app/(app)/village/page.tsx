import AppPageHeader from "@/components/AppPageHeader";

export default function VillagePage() {
  return (
    <div className="flex h-[calc(100dvh-3rem)] min-h-0 flex-col p-6">
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col">
        <AppPageHeader
          title="Village"
          description="Explore Temple, School, Library, Studio, Factory, and Land."
        />
      </div>
    </div>
  );
}
