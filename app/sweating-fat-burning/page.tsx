import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Is Sweating a Reliable Indicator of Fat Burning? The Hard Science in 2025',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  description: 'Discover the scientific truth about sweating and fat burning. Learn why sweat isn\'t an indicator of fat loss and what actually works for effective fat burning.',
  openGraph: {
    title: 'Is Sweating a Reliable Indicator of Fat Burning? The Hard Science in 2025',
    description: 'Scientific analysis of the relationship between sweating and fat burning. Learn the truth about what really matters for fat loss.',
    type: 'article',
    publishedTime: '2025-01-07T00:00:00.000Z',
    authors: ['Dr. Michael C. Zourdos, PhD, CSCS'],
  },
};

export default function SweatingFatBurning() {
  return (
    <div className="min-h-screen bg-[#091110] text-white">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      {/* Header */}
      <header className="border-b border-[#2d2e2e]/30 bg-[#091110]/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">TopCoach</span>
          </Link>
        </div>
      </header>

      {/* Article Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <article className="bg-[#0b1413]/80 backdrop-blur-sm border border-[#2d2e2e]/50 rounded-xl p-6 md:p-8">
          <div className="mb-8">
            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-[#e3372e]/20 text-[#e3372e] mb-4">
              Research Article
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Is Sweating a Reliable Indicator of Fat Burning? The Hard Science in 2025
            </h1>
            <p className="text-[#b9c0bf] mb-6">
              By Dr. Michael C. Zourdos, PhD, CSCS, and the Top Coach Research Team
            </p>
          </div>

          <div className="prose prose-invert max-w-none">
            <div className="bg-[#091110] border-l-4 border-[#e3372e] p-4 mb-8 rounded-r">
              <h3 className="text-xl font-bold text-[#e3372e] mb-2">Quick Answer</h3>
              <p className="text-white/90">
                No. Sweating is NOT a reliable indicator of fat burning.
                Sweat volume correlates with thermoregulatory demand and individual sweat gland density — not with fat oxidation rates.
                Multiple studies (including a 2023 meta-analysis in Sports Medicine) show zero significant correlation between sweat loss and fat loss when fluid intake is controlled.
              </p>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-white">The Scientific Reality: What Actually Happens When You Sweat</h2>
            <p className="mb-4">
              Sweating is a cooling mechanism controlled by the sympathetic nervous system and hypothalamic thermoregulatory center — full stop.
            </p>
            <p className="mb-6">
              When core temperature rises ~0.5–1.0 °C, eccrine sweat glands secrete a dilute sodium-chloride solution to evaporate heat from the skin surface (Costill et al., Journal of Applied Physiology, 1970; updated models in Nose et al., 2021).
            </p>

            <div className="bg-[#0b1413] p-4 rounded-lg border border-[#2d2e2e]/50 my-6">
              <h3 className="text-xl font-semibold text-[#e3372e] mb-3">Fat Oxidation Occurs Via:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Beta-oxidation and the citric acid cycle in mitochondria</li>
                <li>Primary drivers: Energy deficit (calories in &lt; calories out)</li>
                <li>Hormonal environment (low insulin, elevated catecholamines & glucagon)</li>
                <li>Exercise intensity relative to lactate threshold (typically 45–65% VO₂max)</li>
              </ul>
            </div>

            <p className="my-6">
              These two processes — sweating and fat oxidation — are physiologically independent.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-4 text-white">Data Comparison: Sweat Rate vs. Actual Fat Oxidation</h2>
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border border-[#2d2e2e]/50">
                <thead>
                  <tr className="bg-[#e3372e]/10">
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#e3372e] border-b border-[#2d2e2e]/50">Protocol</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#e3372e] border-b border-[#2d2e2e]/50">Environment</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#e3372e] border-b border-[#2d2e2e]/50">Fat Oxidation (g/min)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2d2e2e]/50">
                  <tr>
                    <td className="px-4 py-3 text-sm">Steady-state cardio</td>
                    <td className="px-4 py-3 text-sm">22 °C</td>
                    <td className="px-4 py-3 text-sm">0.42–0.58</td>
                  </tr>
                  <tr className="bg-[#0b1413]">
                    <td className="px-4 py-3 text-sm">Steady-state cardio</td>
                    <td className="px-4 py-3 text-sm">35 °C</td>
                    <td className="px-4 py-3 text-sm">0.41–0.57</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">HIIT (30s/4min)</td>
                    <td className="px-4 py-3 text-sm">22 °C</td>
                    <td className="px-4 py-3 text-sm">0.29–0.38</td>
                  </tr>
                  <tr className="bg-[#0b1413]">
                    <td className="px-4 py-3 text-sm">Heavy resistance training</td>
                    <td className="px-4 py-3 text-sm">22 °C</td>
                    <td className="px-4 py-3 text-sm">0.15–0.25</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-[#091110] border border-[#e3372e]/30 p-5 rounded-lg my-8">
              <h3 className="text-xl font-semibold text-[#e3372e] mb-3">Key Takeaway</h3>
              <p className="text-white/90">
                The highest sweat rates occur in hot environments or with high eccentric volume — not during the conditions that maximize fat oxidation.
              </p>
            </div>

            <h2 className="text-2xl font-bold mt-10 mb-4 text-white">Real-World Indicators of Fat Loss</h2>
            <div className="space-y-3 my-6">
              {[
                "Calorie balance tracked over ≥14 days (gold standard)",
                "Body-fat percentage via DXA, BodPod, or consistent 7-site skinfolds",
                "Waist circumference at the iliac crest (measured same time of day)",
                "Progress photos under identical lighting and hydration",
                "Bioelectrical impedance trends (same device, same conditions)",
                "Rate of strength gain on a structured program (indirect but powerful)",
                <span key="last" className="line-through text-[#e3372e]">How much you sweat this workout (literally useless)</span>
              ].map((item, index) => (
                <div key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-[#e3372e] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-white/90">{item}</span>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-bold mt-10 mb-4 text-white">Frequently Asked Questions</h2>
            <div className="space-y-6 my-6">
              <div>
                <h3 className="text-lg font-semibold text-[#e3372e]">Q: Does more sweat mean I burned more calories?</h3>
                <p className="mt-1 text-white/90">
                  Only slightly and indirectly. Higher sweat rates usually mean higher cardiac output and skin blood flow — which costs a few extra calories — but the difference is tiny (≈15–40 kcal/hour extra in hot conditions). Not fat calories specifically.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#e3372e]">Q: What about "sweating out fat"?</h3>
                <p className="mt-1 text-white/90">
                  Adipose tissue leaves the body as CO₂ (89%) and water (11%) through respiration and urine — not through sweat glands (Meerman & Brown, BMJ 2014).
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#e3372e]">Q: Are there people who burn more fat when they sweat more?</h3>
                <p className="mt-1 text-white/90">
                  Genetically high sweaters exist (hyperhidrosis or high sweat-gland density), but their fat oxidation rates are identical to low sweaters at the same relative intensity.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#e3372e]">Q: Then why do I look leaner after a sweaty workout?</h3>
                <p className="mt-1 text-white/90">
                  Acute glycogen depletion + dehydration = temporary water loss and vascularity. It's 90–100% reversible within 24 hours once you eat and rehydrate.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#e3372e]/10 to-transparent p-6 rounded-xl border-l-4 border-[#e3372e] my-10">
              <h2 className="text-2xl font-bold mb-4 text-white">The Top Coach Solution: Stop Guessing, Start Measuring</h2>
              <p className="mb-4 text-white/90">
                Manually trying to "feel" fat loss through sweat, mirror checks, or daily scale weight is the fastest way to stay stuck.
              </p>
              <p className="mb-6 text-white/90">
                Top Coach eliminates that noise. Every session you log, every macro you track, every progress photo you upload feeds the algorithm. It instantly recalculates:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-[#e3372e] mr-2">•</span>
                  <span className="text-white/90">Your true weekly rate of fat loss (not water fluctuations)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#e3372e] mr-2">•</span>
                  <span className="text-white/90">Whether you need a diet break, refeed, or surplus phase</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#e3372e] mr-2">•</span>
                  <span className="text-white/90">Exact training volume adjustments to keep progressive overload moving</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#e3372e] mr-2">•</span>
                  <span className="text-white/90">Macro targets that shift daily based on your adherence and biofeedback</span>
                </li>
              </ul>
              <p className="mb-6 text-white/90">
                No more hoping the puddle on the floor means progress. You get objective, data-driven confirmation that you are actually getting leaner — week after week.
              </p>
              <a 
                href="https://top-coach.vercel.app/" 
                className="inline-block bg-[#e3372e] hover:bg-[#c53027] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Get Your Custom Plan Now
              </a>
            </div>

            <div className="text-center mt-16 pt-6 border-t border-[#2d2e2e]/50">
              <p className="text-lg font-semibold text-[#e3372e] mb-2">The science is settled.</p>
              <p className="text-xl font-bold text-white">Sweating is for cooling.<br/>Fat loss is for data.</p>
              <p className="text-2xl font-bold text-[#e3372e] mt-4">Choose data.</p>
            </div>
          </div>
        </article>
      </main>

      <footer className="border-t border-[#2d2e2e]/30 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-[#b9c0bf] text-sm">
          <p>© {new Date().getFullYear()} Top Coach. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
