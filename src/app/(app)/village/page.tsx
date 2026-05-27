import AppPageHeader from "@/components/AppPageHeader";
import TribesGrid from "@/components/tribes/TribesGrid";

export default function VillagePage() {
  return (
    <div className="min-h-full p-6 pb-16">
      <div className="mx-auto w-full max-w-7xl">
        <AppPageHeader
          title="Village"
          description="Find the people working in the village."
        />

        <section aria-labelledby="village-members-heading" className="mt-8">
          <h2 id="village-members-heading" className="sr-only">
            Village member profiles
          </h2>
          <TribesGrid />
        </section>
      </div>
    </div>
  );
}
