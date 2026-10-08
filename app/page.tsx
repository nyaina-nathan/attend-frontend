import AboutProject from "./components/landing/AboutProject";
import Features from "./components/landing/Features";
import FinalCta from "./components/landing/FinalCta";
import Hero from "./components/landing/Hero";
import HowItWorks from "./components/landing/HowItWorks";
import OrganizerSpotlight from "./components/landing/OrganizerSpotlight";
import UpcomingEvents from "./components/landing/UpcomingEvents";
import Footer from "./components/site/Footer";
import Navbar from "./components/site/Navbar";

/**
 * Public landing page — the home route.
 *
 * This stays a single Server Component that only composes sections; each
 * section lives in its own small component under `app/components/landing`.
 * Section 3 (Upcoming events) is the only part that fetches live data.
 */
export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1">
        <Hero />
        <UpcomingEvents />
        <HowItWorks />
        <Features />
        <OrganizerSpotlight />
        <AboutProject />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
