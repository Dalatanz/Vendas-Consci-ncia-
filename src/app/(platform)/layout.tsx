import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user";
import { PlatformShell } from "@/components/platform/PlatformShell";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return <PlatformShell user={{ name: user.name, company: user.company }}>{children}</PlatformShell>;
}
