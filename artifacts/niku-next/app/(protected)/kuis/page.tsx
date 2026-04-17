import { redirect } from "next/navigation";

export default function KuisPage() {
  redirect("/kelas?tab=kuis");
}
