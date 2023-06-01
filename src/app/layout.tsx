import "./globals.css";

export const metadata = {
  title: "TRIDENT - Smart Maps Assistant",
  description: "TRIDENT - Smart Maps Assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
