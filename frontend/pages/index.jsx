import Head from 'next/head';
import Navigation from '../components/landing/Navigation';
import Hero from '../components/landing/Hero';
import ProblemSection from '../components/landing/ProblemSection';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import SegmentationDeepDive from '../components/landing/SegmentationDeepDive';
import AffinityDeepDive from '../components/landing/AffinityDeepDive';
import UseCases from '../components/landing/UseCases';
import WhyNow from '../components/landing/WhyNow';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';

export default function Home() {
  return (
    <>
      <Head>
        <title>Empirika — Enterprise Behavioral Intelligence</title>
        <meta name="description"
          content="Behavioral intelligence from proprietary first-party data. Real-time segmentation, predictive analytics, and affinity mapping for brands and agencies." />
        <meta property="og:title" content="Empirika — Enterprise Behavioral Intelligence" />
        <meta property="og:description"
          content="First-party behavioral data. Enterprise audience segmentation. What Nielsen can't see." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ background: 'var(--bg-dark)', minHeight: '100vh' }}>
        <Navigation />
        <Hero />
        <ProblemSection />
        <FeaturesGrid />
        <SegmentationDeepDive />
        <AffinityDeepDive />
        <UseCases />
        <WhyNow />
        <FinalCTA />
        <Footer />
      </div>

      {/* Responsive overrides — inline <style> so no Tailwind @apply needed */}
      <style>{`
        @media (max-width: 1024px) {
          .hero-grid    { grid-template-columns: 1fr !important; }
          .usecases-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 768px) {
          .hero-grid      { grid-template-columns: 1fr !important; gap: 40px !important; }
          .comparison-grid{ grid-template-columns: 1fr !important; }
          .features-grid  { grid-template-columns: 1fr !important; }
          .two-col-grid   { grid-template-columns: 1fr !important; }
          .stats-grid     { grid-template-columns: 1fr !important; }
          .usecases-grid  { grid-template-columns: 1fr !important; }
          nav a[href="#"], nav a[href*="Platform"],
          nav a[href*="Use"], nav a[href*="Doc"] {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
