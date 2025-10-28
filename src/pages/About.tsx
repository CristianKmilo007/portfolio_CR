// src/pages/About.tsx
import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import CustomLink from "../components/CustomLink";
import { usePageExit } from "../hooks/usePageExit";
import PageWrapper from "./PageWrapper";

export default function About() {
  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
  const node = ref.current;
  const tl = gsap.timeline();
  tl.from(node, { autoAlpha: 0, y: 18, duration: 0.6, ease: "power3.out" })
    .from(".about-item", { y: 12, autoAlpha: 0, stagger: 0.07, duration: 0.42 }, "-=0.35");

  return () => {
    tl.kill();
    // quita inline styles que puedan quedar
    gsap.set(node, { clearProps: "all" });
    gsap.set(".about-item", { clearProps: "all" });
  };
}, []);


  usePageExit(() => {
    return new Promise<void>((res) => {
      const tl = gsap.timeline({ defaults: { ease: "power2.in" } });
      tl.to(".about-item", { y: 12, autoAlpha: 0, stagger: 0.05, duration: 0.28 })
        .to(ref.current, { y: -10, autoAlpha: 0, duration: 0.26 }, "-=0.16")
        .call(() => res());
    });
  });

  return (
    <PageWrapper>
      <div ref={ref} className="max-w-3xl mx-auto space-y-6 pt-24">
        <header className="flex items-center justify-between">
          <h2 className="text-3xl font-semibold about-item font-crimson">Sobre mí g</h2>
          <nav>
            <CustomLink to="/" className="about-item underline">Home</CustomLink>
          </nav>
        </header>

        <p className="about-item">Soy desarrollador ...</p>
        <div className="about-item p-4 bg-white rounded-lg shadow">Más contenido animado</div>
      </div>
    </PageWrapper>
  );
}
