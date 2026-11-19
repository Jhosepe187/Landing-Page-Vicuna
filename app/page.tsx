import { About } from "@/components/About";
import { Clients } from "@/components/Clients";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Manifesto } from "@/components/Manifesto";
import { Projects } from "@/components/Projects";
import { Specialties } from "@/components/Specialties";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <Manifesto />
        <Projects />
        <About />
        <Specialties />
        <Clients />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
