// src/pages/Home.tsx
import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import CustomLink from "../components/CustomLink";
import { usePageExit } from "../hooks/usePageExit";
import PageWrapper from "./PageWrapper";

export default function Home() {
  const ref = useRef<HTMLDivElement | null>(null);

  // enter animation (mount)
  useLayoutEffect(() => {
    const node = ref.current;
    const tl = gsap.timeline();
    tl.from(node, {
      autoAlpha: 0,
      y: 18,
      duration: 0.6,
      ease: "power3.out",
    }).from(
      ".about-item",
      { y: 12, autoAlpha: 0, stagger: 0.07, duration: 0.42 },
      "-=0.35"
    );

    return () => {
      tl.kill();
      // quita inline styles que puedan quedar
      gsap.set(node, { clearProps: "all" });
      gsap.set(".about-item", { clearProps: "all" });
    };
  }, []);

  // register exit: return a promise that resolves when exit animation finished
  usePageExit(() => {
    return new Promise<void>((res) => {
      const tl = gsap.timeline({ defaults: { ease: "power2.in" } });
      tl.to(".home-card", { y: 20, autoAlpha: 0, stagger: 0.06, duration: 0.3 })
        .to(ref.current, { y: -12, autoAlpha: 0, duration: 0.28 }, "-=0.2")
        .call(() => res());
    });
  });

  return (
    <PageWrapper>
      <div ref={ref} className="max-w-5xl mx-auto space-y-8 pt-24">
        <header className="flex items-center justify-between">
          <h1 className="text-4xl font-extrabold">Bienvenido — Home</h1>
          <nav className="flex gap-4">
            <CustomLink to="/about" className="underline">
              About
            </CustomLink>
          </nav>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="home-card p-6 rounded-xl bg-white shadow">
            Proyectos
          </div>
          <div className="home-card p-6 rounded-xl bg-white shadow">
            Servicios
          </div>
          <div className="home-card p-6 rounded-xl bg-white shadow">
            Contacto
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
