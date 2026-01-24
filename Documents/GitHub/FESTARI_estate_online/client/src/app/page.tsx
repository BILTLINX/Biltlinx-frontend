import SidebarLayout from "@/components/sidebar/layout";
import SignupPage from "./signup/page";

export default function Home() {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <SidebarLayout />
      <main className="flex-1 ml-64 flex items-center justify-center p-8">
        <div className="w-full h-full p-8 bg-gradient-to-br from-[#BE4D00] to-[#1E3240] shadow-sm rounded-lg px-32">
          <SignupPage />
        </div>
      </main>
    </div>
  );
}
