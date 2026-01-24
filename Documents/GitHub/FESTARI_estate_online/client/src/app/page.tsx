import SignupPage from "./signup/page";
import Navbar from "@/components/navbar/layout";

export default function Home() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-full h-full bg-linear-to-br from-[#BE4D00] to-[#1E3240] shadow-sm rounded-lg">
        <Navbar />
        <div className="p-8 px-32">
          <SignupPage />
        </div>
      </div>
    </div>
  );
}
