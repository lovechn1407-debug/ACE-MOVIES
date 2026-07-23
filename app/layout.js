import './globals.css';

export const metadata = {
  title: 'ACE Movies - Watch & Stream HD Movies',
  description: 'Premium movie streaming platform with server-side TMDB integration, customizable play links, and Netflix cinematic experience.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#08080c] text-[#f3f4f6] min-h-screen flex flex-col font-sans antialiased selection:bg-[#e50914] selection:text-white">
        {children}
      </body>
    </html>
  );
}
