import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Science-Backed Truth: Protein Requirements | TopCoach',
  description: 'Discover the exact amount of protein your body needs daily based on the latest scientific research. Learn how to optimize your protein intake for muscle growth, fat loss, and overall health.',
};

export default function ProteinRequirements() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <article className="prose prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-6 text-red-500">
          The Science-Backed Truth: Exactly How Many Grams of Protein Your Body Needs Daily (2026 Data)
        </h1>
        
        <p className="text-lg mb-8 text-gray-300">
          Your body doesn't guess. It calculates—every single day—how much protein it needs to repair muscle, synthesize hormones, maintain immune function, and keep you alive. The question is whether you're giving it the right number.
        </p>
        <p className="text-lg mb-8 text-gray-300">
          Here's the precise, evidence-based answer in 2024.
        </p>

        <div className="bg-gray-800 p-6 rounded-lg border-l-4 border-red-500 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Answer (The Numbers You Actually Need)</h2>
          <ul className="space-y-2 text-gray-300">
            <li>• <span className="font-semibold">Sedentary adults:</span> 0.8–1.0 g/kg body weight</li>
            <li>• <span className="font-semibold">Recreationally active / general health:</span> 1.2–1.6 g/kg</li>
            <li>• <span className="font-semibold">Strength training / muscle gain (optimal range):</span> 1.6–2.2 g/kg</li>
            <li>• <span className="font-semibold">Advanced lifters or aggressive cut (&gt;20% body fat loss):</span> 2.3–3.1 g/kg lean body mass</li>
            <li>• <span className="font-semibold">Maximum useful dose per day (beyond which no further muscle protein synthesis occurs):</span> ~2.2 g/kg for most people (Morton et al., 2018; ISSN Position Stand, 2024 update)</li>
          </ul>
          <p className="mt-4 text-sm text-gray-400">
            These are not opinions. They are the current scientific consensus.
          </p>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">The Scientific Reality: Why Protein Requirements Aren't One-Size-Fits-All</h2>
          <p className="mb-4">
            Protein isn't "fuel" like carbs or fat. It's raw building material.
          </p>
          <p className="mb-4">
            Every day your body breaks down ~250–300 g of protein through normal turnover (even if you train lightly). You must replace it or you lose muscle, bone density, immune function, and hormonal balance.
          </p>
          <p className="mb-4">
            The nitrogen balance studies (the gold standard) show:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>At 0.8 g/kg (the RDA), most sedentary people stay in equilibrium.</li>
            <li>At 1.0–1.2 g/kg, active people stay in equilibrium.</li>
            <li>At 1.6 g/kg or higher, trained individuals shift into positive nitrogen balance and measurable muscle protein synthesis (MPS) increases significantly (Phillips & Van Loon, 2011; Morton et al., Meta-Analysis 2018).</li>
          </ul>
          <p className="mb-4">
            The dose-response curve plateaus around 1.6–2.2 g/kg in young, resistance-trained individuals. Going higher than 2.2 g/kg yields diminishing returns for muscle gain in most cases—except during aggressive dieting, where 2.3–3.1 g/kg LBM preserves lean mass dramatically (Helms et al., 2014; ISSN 2024).
          </p>
          <p>
            Per-meal dosing matters too: 0.4–0.55 g/kg per meal (roughly 25–50 g depending on body weight) maximally stimulates MPS when spread over 3–5 meals (Schoenfeld & Aragon, 2018; Jäger et al., ISSN 2017/2024).
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Protein Requirement Comparison Table (2026 Consensus)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-red-500 text-white">
                  <th className="px-4 py-3 text-left">Goal / Training Status</th>
                  <th className="px-4 py-3 text-left">Recommended Intake (g/kg/day)</th>
                  <th className="px-4 py-3 text-left">Reference Source</th>
                  <th className="px-4 py-3 text-left">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr className="hover:bg-gray-700">
                  <td className="px-4 py-3">Sedentary / minimum health</td>
                  <td className="px-4 py-3">0.8–1.0</td>
                  <td className="px-4 py-3 text-sm">Institute of Medicine (2005/2024 confirmation)</td>
                  <td className="px-4 py-3 text-sm text-gray-400">Prevents deficiency; no performance benefit</td>
                </tr>
                <tr className="hover:bg-gray-700">
                  <td className="px-4 py-3">General fitness / endurance</td>
                  <td className="px-4 py-3">1.2–1.6</td>
                  <td className="px-4 py-3 text-sm">ACSM / ISSN 2024</td>
                  <td className="px-4 py-3 text-sm text-gray-400">Supports recovery; modest hypertrophy possible</td>
                </tr>
                <tr className="hover:bg-gray-700">
                  <td className="px-4 py-3">Hypertrophy (optimal range)</td>
                  <td className="px-4 py-3">1.6–2.2</td>
                  <td className="px-4 py-3 text-sm">Morton et al. 2018, ISSN 2024</td>
                  <td className="px-4 py-3 text-sm text-gray-400">Sweet spot for 95% of lifters; plateau begins here</td>
                </tr>
                <tr className="hover:bg-gray-700">
                  <td className="px-4 py-3">Aggressive fat loss (&gt;1% BW/week)</td>
                  <td className="px-4 py-3">2.3–3.1 (per kg LBM)</td>
                  <td className="px-4 py-3 text-sm">Helms et al. 2014, Longland et al. 2016, ISSN 2024</td>
                  <td className="px-4 py-3 text-sm text-gray-400">Preserves lean mass when in large deficit</td>
                </tr>
                <tr className="hover:bg-gray-700">
                  <td className="px-4 py-3">Older adults (&gt;60 y) resistance training</td>
                  <td className="px-4 py-3">1.6–2.4</td>
                  <td className="px-4 py-3 text-sm">Bauer et al. 2013, Morton 2018, ISSN 2024</td>
                  <td className="px-4 py-3 text-sm text-gray-400">Higher threshold needed due to anabolic resistance</td>
                </tr>
                <tr className="hover:bg-gray-700">
                  <td className="px-4 py-3">Maximum useful intake (young, trained)</td>
                  <td className="px-4 py-3">~2.2</td>
                  <td className="px-4 py-3 text-sm">Morton et al. 2018 meta-regression</td>
                  <td className="px-4 py-3 text-sm text-gray-400">99% confidence interval caps additional benefit</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">The Hidden Variables Most Calculators Ignore</h2>
          <ul className="space-y-4">
            <li>
              <span className="font-semibold text-red-400">Lean body mass</span> matters more than total body weight when you're over ~20–25% body fat.
              <p className="text-gray-400 text-sm mt-1">→ 90 kg male at 30% body fat should calculate off ~63 kg LBM, not 90 kg.</p>
            </li>
            <li>
              <span className="font-semibold text-red-400">Training volume:</span> Someone squatting 15–20 sets/week needs the upper end; 5–9 sets/week can thrive at 1.6 g/kg.
            </li>
            <li>
              <span className="font-semibold text-red-400">Age:</span> Anabolic resistance increases ~3–5% per decade after 40. Older lifters need both higher total protein and higher per-meal doses (0.55–0.6 g/kg/meal).
            </li>
            <li>
              <span className="font-semibold text-red-400">Sleep & stress:</span> Chronic cortisol elevation increases leucine oxidation → you need ~10–20% more protein to achieve the same net balance.
            </li>
          </ul>
        </section>

        <section className="bg-gray-800 p-6 rounded-lg mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">FAQ – The Questions People Actually Search</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Q: "Can I build muscle on 1.2 g/kg?"</h3>
            <p className="text-gray-300">
              <span className="font-semibold">A:</span> Yes, but slowly. You'll leave 70–80% of possible gains on the table (Morton 2018).
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Q: "Will 300 g protein damage my kidneys?"</h3>
            <p className="text-gray-300">
              <span className="font-semibold">A:</span> No high-quality evidence in healthy individuals shows renal damage up to 3.3 g/kg (Antonio et al., 2016; ISSN 2024). The myth comes from outdated clinical populations.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Q: "What if I'm vegan?"</h3>
            <p className="text-gray-300">
              <span className="font-semibold">A:</span> Same targets. Digestibility is ~10–20% lower, so aim for the upper end (1.8–2.4 g/kg) and prioritize leucine-rich plant sources or supplementation.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Q: "Do I need 100 g post-workout?"</h3>
            <p className="text-gray-300">
              <span className="font-semibold">A:</span> No. 0.4–0.55 g/kg in that meal is the maximum stimulatory dose. The rest of the day matters far more.
            </p>
          </div>
        </section>

        <section className="bg-red-500/10 border border-red-500/30 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-4">The Top Coach Solution – Why Manual Calculation Always Fails</h2>
          <p className="mb-4">
            Spreadsheets, MyFitnessPal guesses, and "bro math" inevitably drift. You change weight. You change training volume. You switch from cut to bulk. You get older. Your sleep tanks for two weeks. Every variable shifts the target—sometimes by 30–50 g/day.
          </p>
          <p className="mb-6">
            Top Coach's algorithm recalculates your exact daily requirement in real time using:
          </p>
          <ul className="grid md:grid-cols-2 gap-4 mb-6">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Current body weight & body-fat percentage (LBM-based)</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Weekly training volume & session RPE</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Current phase (bulk/cut/maintenance)</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Age & sleep score input</span>
            </li>
          </ul>
          <p className="mb-4">
            It doesn't round to "1.6–2.2." It gives you 183 g today, 177 g next week if you drop 0.7 kg, 204 g when you switch to a high-volume hypertrophy block.
          </p>
          <p className="mb-6">
            No more guessing. No more plateauing because you're secretly 40 g under your actual requirement.
          </p>
          <p className="mb-6">
            Get your precise number—updated daily—here: <a href="https://top-coach.vercel.app/" className="text-red-400 hover:underline">https://top-coach.vercel.app/</a>
          </p>
          <div className="bg-black/20 p-4 rounded-lg border border-red-500/30">
            <p className="text-center text-lg font-semibold mb-4">
              Stop estimating. Start optimizing.
            </p>
            <a 
              href="https://top-coach.vercel.app/" 
              className="block w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors duration-200"
            >
              Get Your Personalized Protein Plan
            </a>
          </div>
        </section>
      </article>
    </div>
  );
}
