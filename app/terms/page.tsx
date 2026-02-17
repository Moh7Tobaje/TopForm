"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#091110] text-white circuit-pattern p-6">
      <div className="max-w-4xl mx-auto bg-[#2d2e2e]/80 backdrop-blur-sm rounded-lg shadow-md p-8 relative">
        <button 
          onClick={() => router.push("/chat")}
          className="absolute top-4 right-4 text-red-600 hover:text-red-800 transition-colors"
          aria-label="Return to chat"
        >
          <ArrowLeft size={24} />
        </button>
        
        <h1 className="text-2xl font-bold mb-6">Terms of Use & Privacy Policy for Top Coach</h1>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">Terms of Use</h2>
        
        <h3 className="text-lg font-medium mt-4 mb-2">1. Age Requirement</h3>
        <p className="mb-3">
          You must be at least 18 years old to access or use this service. By using the bot, you represent and warrant that you are of legal age. If you are under 18, you are strictly prohibited from using the service.
        </p>
        
        <h3 className="text-lg font-medium mt-4 mb-2">2. Informational Purposes Only</h3>
        <p className="mb-3">
          All fitness, nutrition, and training recommendations provided by Top Coach are for informational and educational purposes only.
        </p>
        <p className="mb-3">
          This service does not replace medical advice from a licensed healthcare provider.
        </p>
        <p className="mb-3">
          Always consult with a doctor or certified professional before starting any exercise or diet plan, especially if you have pre-existing conditions or injuries.
        </p>
        
        <h3 className="text-lg font-medium mt-4 mb-2">3. Assumption of Risk</h3>
        <p className="mb-3">
          By using this service, you acknowledge and agree that:
        </p>
        <ul className="list-disc pl-6 mb-3">
          <li className="mb-1">You are solely responsible for your own health and fitness decisions.</li>
          <li className="mb-1">Top Coach and its developers are not liable for any injuries, health issues, or damages resulting from your reliance on the content provided.</li>
          <li className="mb-1">If you experience pain, discomfort, or injury, you must immediately stop and seek medical attention.</li>
        </ul>
        
        <h3 className="text-lg font-medium mt-4 mb-2">4. Limitation of Liability</h3>
        <p className="mb-3">
          To the maximum extent permitted by law, Top Coach, its creators, and affiliates disclaim all liability for:
        </p>
        <ul className="list-disc pl-6 mb-3">
          <li className="mb-1">Direct, indirect, incidental, special, or consequential damages.</li>
          <li className="mb-1">Losses arising from reliance on the service, including but not limited to injuries, missed goals, or health complications.</li>
        </ul>
        <p className="mb-3">
          Your sole and exclusive remedy is to discontinue use of the service.
        </p>
        
        <h3 className="text-lg font-medium mt-4 mb-2">5. Data Collection and Privacy</h3>
        <p className="mb-3">
          We collect limited personal data (such as height, weight, gender, injuries, and goals) strictly for the purpose of tailoring recommendations.
        </p>
        <p className="mb-3">
          Data is processed according to our Privacy Policy.
        </p>
        <p className="mb-3">
          We do not sell or share personal data with third parties unless legally required.
        </p>
        <p className="mb-3">
          You have the right to request deletion of your data at any time.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">Privacy Policy</h2>
        
        <h3 className="text-lg font-medium mt-4 mb-2">1. Information We Collect</h3>
        <p className="mb-3">
          We may collect the following information:
        </p>
        <ul className="list-disc pl-6 mb-3">
          <li className="mb-1">Personal details you provide (age, gender, weight, injuries, goals).</li>
          <li className="mb-1">Usage data (interactions with the bot).</li>
        </ul>
        
        <h3 className="text-lg font-medium mt-4 mb-2">2. How We Use Your Data</h3>
        <p className="mb-3">
          Your data is used exclusively to:
        </p>
        <ul className="list-disc pl-6 mb-3">
          <li className="mb-1">Provide personalized fitness and nutrition suggestions.</li>
          <li className="mb-1">Improve the quality and accuracy of the service.</li>
        </ul>
        
        <h3 className="text-lg font-medium mt-4 mb-2">3. Data Storage & Security</h3>
        <p className="mb-3">
          Data is stored securely and protected against unauthorized access.
        </p>
        <p className="mb-3">
          We retain data only for as long as necessary to provide the service.
        </p>
        
        <h3 className="text-lg font-medium mt-4 mb-2">4. Your Rights (GDPR/CCPA Compliance)</h3>
        <p className="mb-3">
          You have the right to:
        </p>
        <ul className="list-disc pl-6 mb-3">
          <li className="mb-1">Request a copy of your data.</li>
          <li className="mb-1">Request correction or deletion ("Right to be Forgotten").</li>
          <li className="mb-1">Opt out of further data collection.</li>
        </ul>
        
        <h3 className="text-lg font-medium mt-4 mb-2">5. Sharing of Information</h3>
        <p className="mb-3">
          We do not sell, rent, or trade personal information. Data may only be disclosed if required by law.
        </p>
        
        <h3 className="text-lg font-medium mt-4 mb-2">6. Cross-Border Data Transfer</h3>
        <p className="mb-3">
          If data is transferred across borders, we ensure it is handled in compliance with applicable data protection laws.
        </p>
        
        <h3 className="text-lg font-medium mt-4 mb-2">7. Changes to Privacy Policy</h3>
        <p className="mb-3">
          We may update this Privacy Policy at any time. Continued use of the service indicates acceptance of the revised version.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">User Acknowledgment</h2>
        <p className="mb-3">
          By typing "Agree", you confirm that you:
        </p>
        <ul className="list-disc pl-6 mb-3">
          <li className="mb-1">Are at least 18 years old.</li>
          <li className="mb-1">Have read and understood these Terms of Use and Privacy Policy.</li>
          <li className="mb-1">Accept full responsibility for your actions and health outcomes.</li>
          <li className="mb-1">Release Top Coach and its developers from any liability to the fullest extent permitted by law.</li>
        </ul>
      </div>
    </div>
  );
}