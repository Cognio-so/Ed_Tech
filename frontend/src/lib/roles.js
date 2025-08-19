"use client"
import { useUser } from "@clerk/nextjs";

// Client-side role check only
export function useRole(role) {
  const { user } = useUser();
  console.log(user?.publicMetadata?.role , "user role");
  return user?.publicMetadata?.role === role;
}