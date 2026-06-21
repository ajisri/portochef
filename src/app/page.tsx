import HeroSection from "../components/HeroSection";
import ManifestoSection from "../components/ManifestoSection";
import ImpactSection from "../components/ImpactSection";
import TimelineGallery from "../components/TimelineGallery";
import BusinessPortfolio from "../components/BusinessPortfolio";
import Testimonials from "../components/Testimonials";
import Recognition from "../components/Recognition";

import Footer from "../components/Footer";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ManifestoSection />
      <ImpactSection />
      <div id="timeline-wrapper">
        <TimelineGallery />
      </div>
      <div id="portfolio-wrapper">
        <BusinessPortfolio />
      </div>
      <Testimonials />
      <Recognition />

      <Footer />
    </main>
  );
}
