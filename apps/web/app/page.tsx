import { Button } from "@repo/ui/components/ui/button";
import Link from "next/link";

export default async function Home() {
  return (
    <>
      <Link href="/dashboard">
        <Button>Get Started</Button>
      </Link>
    </>
  );
}
