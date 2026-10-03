import Link from "next/link";
import { getMessages } from "../../i18n/server";
import AuthButton from "./AuthButton";
import LanguageSwitch from "./LanguageSwitch";

export default async function SiteHeader() {
  const { m } = await getMessages();
  return (
    <header className="flex items-center justify-between gap-2 py-4">
      <Link href="/" className="font-display text-xl font-bold tracking-tight">{m.brand}</Link>
      <div className="flex items-center gap-2">
        <LanguageSwitch />
        <AuthButton />
      </div>
    </header>
  );
}
