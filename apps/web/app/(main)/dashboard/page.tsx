import SignOutButton from "@/components/auth-atoms/SignOut";
import { getServerSession } from "@/libs/auth";
import React from "react";

export default async function page() {
  const session = await getServerSession();
  return (
    <>
      <pre>{JSON.stringify(session, null, 2)}</pre>;
      <SignOutButton />
    </>
  );
}
