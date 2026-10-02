"use client";
import { useParams } from "next/navigation";
import ChurchSongForm from "@/app/components/ChurchSongForm";
export default function Page() { const { id } = useParams<{ id: string }>(); return <ChurchSongForm id={id} />; }
