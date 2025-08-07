'use client'
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default async function Home() {

  return (
   <div className="flex flex-col items-center justify-center h-screen">
    <Link href="/sign-in">
    <Button>Get Started</Button>
    </Link>
   </div>
  );
}
