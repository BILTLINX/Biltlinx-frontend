import SidebarLayout from "@/components/sidebar/layout";

export default function Home() {
  return (
    <div className="flex">
      <SidebarLayout />
      <main className="flex-1 ml-64 p-8 min-h-screen">
        {/* Your content goes here */}
      </main>
    </div>
  );
}
