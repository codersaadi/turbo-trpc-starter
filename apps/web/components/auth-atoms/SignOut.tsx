"use client";
import { signOut } from "@/libs/auth-client";
import { Button } from "@repo/ui/components/ui/button";
import React from "react";

export default function SignOutButton() {
  return <Button onClick={async () => await signOut()}>SignOut</Button>;
}
