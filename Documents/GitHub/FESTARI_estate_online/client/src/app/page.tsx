import SignupPage from "./signup/page";

export default function Home() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-full h-full p-8 bg-gradient-to-br from-[#BE4D00] to-[#1E3240] shadow-sm rounded-lg px-32">
        <SignupPage />
      </div>
    </div>
  );
}
