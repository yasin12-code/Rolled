export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen gradient-hero flex flex-col justify-center items-center p-4 sm:p-8 relative overflow-hidden">
      {/* Decorative background elements from the screenshot vibe */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px] pointer-events-none"></div>
      
      {/* Big abstract purple wave (SVG simulation) */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-primary -z-10 rounded-b-[100px] shadow-lg opacity-5"></div>
      
      <div className="w-full max-w-md z-10 animate-fade-in">
        {children}
      </div>
      
      <div className="absolute bottom-8 text-center text-gray-400 text-sm z-10 font-medium">
        &copy; 2026 Rolled Inc. All rights reserved.
      </div>
    </div>
  )
}
