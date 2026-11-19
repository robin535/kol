import "@/components/sites/kol/kol.css";
import KolApp from "@/components/sites/kol/KolApp";

export default function Home() {
  return (
    <KolApp
      heroes={{
        man: "/assets/hero-man-v3.webp",
        woman: "/assets/hero-woman-v3.webp",
      }}
    />
  );
}
