import React from 'react';

export default function FatBurningSupplements() {
  const supplementData = [
    { ingredient: 'Caffeine', fatLoss: '0.5–1.2 kg', evidence: 'Strong', safety: 'Safe up to 400 mg/day', verdict: 'Works modestly, tolerance builds' },
    { ingredient: 'Green Tea Extract (EGCG)', fatLoss: '0.4–1.0 kg', evidence: 'Moderate-Strong', safety: 'Safe, minor liver risk at very high doses', verdict: 'Small but real effect' },
    { ingredient: 'L-Carnitine', fatLoss: '0.9–1.3 kg', evidence: 'Moderate', safety: 'Very safe', verdict: 'Only useful if you\'re deficient' },
    { ingredient: 'CLA', fatLoss: '0.5–1.0 kg', evidence: 'Moderate', safety: 'Safe', verdict: 'Mostly reduces fat in overweight, not lean' },
    { ingredient: 'Yohimbine', fatLoss: '0.8–1.5 kg', evidence: 'Moderate', safety: 'Anxiety, hypertension risk', verdict: 'Works in fasted state, side effects common' },
    { ingredient: 'Synephrine', fatLoss: '~0.7 kg', evidence: 'Weak-Moderate', safety: 'Mild stimulant side effects', verdict: 'Weak evidence' },
    { ingredient: 'Garcinia Cambogia', fatLoss: 'Statistically insignificant', evidence: 'Very weak', safety: 'Generally safe', verdict: 'Essentially useless' },
    { ingredient: 'Raspberry Ketones', fatLoss: 'Zero human trials', evidence: 'None', safety: 'Unknown', verdict: 'Pure marketing scam' },
    { ingredient: 'Forskolin', fatLoss: 'Zero convincing trials', evidence: 'None', safety: 'Unknown', verdict: 'Scam' },
  ];

  const comparisonData = [
    { factor: 'Average real-world fat loss', pills: '0–2 kg (mostly water/glycogen)', topCoach: '8–20+ kg (sustainable, proven user results)' },
    { factor: 'Requires diet tracking', pills: 'No (you stay clueless)', topCoach: 'Yes (teaches you forever)' },
    { factor: 'Adapts weekly', pills: 'Never', topCoach: 'Yes, automatically' },
    { factor: 'Prevents plateaus', pills: 'No', topCoach: 'Yes, progressive overload + deload logic' },
    { factor: 'Risk of side effects', pills: 'Yes (some serious)', topCoach: 'Zero' },
    { factor: 'Cost per month', pills: '$40–120', topCoach: 'Less than one personal training session' },
    { factor: 'Teaches you independence', pills: 'No', topCoach: 'Yes — you eventually don\'t need it' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-white">
      <article className="prose lg:prose-xl dark:prose-invert max-w-none">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-8 text-center text-white">
            Fat Burning Supplements: Truth or Scam?
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            The fat-loss industry makes billions every year selling the dream: pop a pill, burn fat, get shredded.
          </p>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            The reality is far less exciting — and far more expensive for your wallet and sometimes your health.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-white">
            1. Do Fat Burning Supplements Actually Work?
          </h2>
          <p className="mb-4 text-white/90">
            <strong className="text-green-400">Short answer:</strong> Most don't.
          </p>
          <p className="mb-6 text-white/90">
            <strong className="text-green-400">Long answer:</strong> The effect sizes are so small that they are clinically meaningless for the vast majority of users.
          </p>
          
          <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 mb-6">
            <p className="font-semibold mb-2 text-white">A 2021 umbrella review of meta-analyses on weight-loss supplements (Journal of Obesity & Metabolic Syndrome) concluded:</p>
            <ul className="list-disc pl-6 space-y-2 text-white/90">
              <li>Average additional weight loss vs placebo: 0.3–1.3 kg over 8–52 weeks</li>
              <li>Fat mass reduction: 0.2–1.1 kg</li>
              <li>Many studies were low-quality, short-term, or industry-funded</li>
            </ul>
          </div>
          <p className="text-white/90">
            That's less than the normal week-to-week fluctuation on any decent diet.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-white">
            2. The Only Ingredients With Decent Evidence (Ranked)
          </h2>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-white/10">
                  <th className="px-4 py-3 text-left text-sm font-medium text-white">Ingredient</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white">Average Extra Fat Loss</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white">Evidence Strength</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white">Safety Notes</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {supplementData.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white/5' : 'bg-white/10'}>
                    <td className="px-4 py-3 text-sm text-white">{item.ingredient}</td>
                    <td className="px-4 py-3 text-sm text-white">{item.fatLoss}</td>
                    <td className="px-4 py-3 text-sm text-white">{item.evidence}</td>
                    <td className="px-4 py-3 text-sm text-white">{item.safety}</td>
                    <td className="px-4 py-3 text-sm text-white">{item.verdict}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-sm text-white/70 italic">
            <p>Sources:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Haller et al., 2021 (umbrella review)</li>
              <li>Tabrizi et al., 2019 (caffeine meta-analysis)</li>
              <li>Pooyandjoo et al., 2016 (carnitine)</li>
              <li>Onakpoya et al., Cochrane Reviews (CLA, garcinia, etc.)</li>
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-white">
            3. Why Supplements Fail Most People
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-white/90">
            <li>Effect size too small to notice</li>
            <li>Tolerance develops quickly (especially caffeine/yohimbine)</li>
            <li>No compensation for the calories you still have to control</li>
            <li>Companies use proprietary blends to hide ineffective doses</li>
            <li>Marketing shows shredded models who never touched the product</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-white">
            4. The Real Way to Burn Fat (That Actually Works)
          </h2>
          <p className="text-white/90 mb-4">
            The hierarchy of fat loss (proven by decades of research):
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-white/90 mb-6">
            <li><strong>Sustained calorie deficit</strong> (non-negotiable)</li>
            <li><strong>High protein intake</strong> (1.6–2.2 g/kg preserves muscle)</li>
            <li><strong>Resistance training</strong> (maintains muscle, best long-term TDEE booster)</li>
            <li><strong>NEAT + cardio</strong> (increases deficit without wrecking recovery)</li>
            <li><strong>Sleep & stress management</strong> (cortisol regulation)</li>
            <li><strong>Consistency over months/years</strong></li>
          </ol>
          <p className="text-white/90">
            Everything else — including supplements — is a 1–5% optimization at best.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-white">
            5. Supplements vs. Intelligent Personalized Coaching
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-white/10">
                  <th className="px-4 py-3 text-left text-sm font-medium text-white">Factor</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white">Fat Burner Pills</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white">Top Coach AI System</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {comparisonData.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white/5' : 'bg-white/10'}>
                    <td className="px-4 py-3 text-sm text-white">{item.factor}</td>
                    <td className="px-4 py-3 text-sm text-white">{item.pills}</td>
                    <td className="px-4 py-3 text-sm text-green-400">{item.topCoach}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="text-center py-12 my-12 bg-gradient-to-br from-green-900/30 via-blue-900/30 to-purple-900/30 rounded-xl p-8 backdrop-blur-sm border border-white/10 shadow-xl">
          <h2 className="text-3xl font-bold mb-6 text-white">Final Verdict</h2>
          <p className="text-xl mb-6 text-white/90">
            Fat-burning supplements are not a complete scam — caffeine and green tea extract do provide a measurable but tiny boost.
          </p>
          <p className="text-xl mb-8 text-white/90">
            Everything else sold as "fat torching breakthrough" is either useless or marginally effective at doses that come with side effects.
          </p>
          <p className="text-xl mb-8 text-white/90">
            If you want real, visible, lasting fat loss, invest your money and hope in systems that actually move the needle: proper training, nutrition tracking, and intelligent progression.
          </p>
          <p className="text-2xl font-bold text-white mb-8">
            This is exactly what Top Coach was built for.
          </p>
          
          <div className="max-w-3xl mx-auto text-left mb-8 p-6 bg-white/5 rounded-xl">
            <p className="text-xl mb-4 text-white/90">
              <strong>Top Coach is not another "workout app" or PDF program.</strong>
            </p>
            <p className="text-lg mb-4 text-white/90">
              It's an AI analytical coach that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-white/90">
              <li>Analyzes your real training level (not what you think it is)</li>
              <li>Builds you a truly personalized plan (volume, intensity, exercise selection)</li>
              <li>Tracks every rep, every weight, every session</li>
              <li>Adjusts automatically when you stall or overreach</li>
              <li>Adds intelligent nutrition guidance (macro targets tailored to your progress)</li>
              <li>Answers your questions instantly with data-backed reasoning</li>
            </ul>
            <p className="mt-4 text-white/90">
              No guesswork. No generic templates. No wasting months on plateaus.
            </p>
          </div>
          
          <p className="text-xl mb-8 text-white/90">
            Thousands of users have already switched from buying useless pills to finally seeing consistent progress.
          </p>
          
          <p className="text-2xl font-bold text-green-400 mb-8">
            Stop gambling on supplements.<br />
            Start training like the data says actually works.
          </p>
          
          <a 
            href="https://top-coach.vercel.app/" 
            className="inline-block mt-6 px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold rounded-lg text-lg transition-all duration-300 transform hover:scale-105"
          >
            Try Top Coach free →
          </a>
          
          <p className="text-lg text-white/80 mt-8">
            Your future self who is finally lean and strong will thank you.
          </p>
        </section>
      </article>
    </div>
  );
}
