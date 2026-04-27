import './globals.css';

export const metadata = {
  title: 'VolunteerBridge - AI-Powered Community Resource Allocation',
  description: 'AI-powered volunteer matching and community resource allocation platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
