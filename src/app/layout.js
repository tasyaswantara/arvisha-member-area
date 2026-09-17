import AuthProvider from "@/components/auth/AuthProvider";
import "@/styles/globals.css";

export const metadata = {
  title: "Arvisha Member Area",
  description: "Member area for Arvisha"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
