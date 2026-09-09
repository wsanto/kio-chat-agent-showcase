"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e] relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <Link href="/chat" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary glow-ring flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-lg">Kio</span>
        </Link>

        <Link href="/chat">
          <Button variant="ghost" className="text-white hover:text-primary">
            Back to Chat
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">Privacy Policy</h1>
          <p className="text-sm text-white/50">Last Updated: January 2024</p>
          <p className="text-lg text-white/70 mt-6 text-balance">
            Your privacy matters to us. This policy explains what information we collect, how we use it, how we protect
            it, and the choices you have regarding your data.
          </p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none space-y-8">
          <section className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">1. What Information We Collect</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              We only collect information necessary to provide you with a safe, effective, emotionally intelligent AI
              companion.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3">1.1 Information You Provide</h3>
            <ul className="list-disc list-inside text-white/80 space-y-2 mb-4">
              <li>Messages and conversations you send to the AI</li>
              <li>Preferences you share (e.g., tone, interests, dislikes)</li>
              <li>Optional profile details (e.g., name, age, pronouns)</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3">1.2 Emotional & Interaction Data</h3>
            <p className="text-white/80 leading-relaxed mb-2">
              To personalize your experience, the system may interpret:
            </p>
            <ul className="list-disc list-inside text-white/80 space-y-2 mb-4">
              <li>Sentiment (positive/negative tone)</li>
              <li>Emotional indicators (e.g., joy, sadness, stress)</li>
              <li>Interaction style (how formal, casual, or concise you prefer)</li>
              <li>Memory cues you choose to let the AI recall</li>
            </ul>
            <p className="text-white/80 leading-relaxed">
              This emotional analysis exists only inside your private experience and is not used to train global models.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">1.3 Technical Information</h3>
            <p className="text-white/80 leading-relaxed mb-2">To operate the service, we automatically collect:</p>
            <ul className="list-disc list-inside text-white/80 space-y-2 mb-4">
              <li>Device type</li>
              <li>Browser and app version</li>
              <li>Log data (e.g., connection time, error reports)</li>
              <li>General location (country/region only, never precise GPS)</li>
            </ul>
            <p className="text-white/80 leading-relaxed">
              We do not collect sensitive identifiers such as government IDs, biometrics, or financial data unless
              explicitly required for a feature and authorized by you.
            </p>
          </section>

          <section className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              We use your information to make the AI more helpful, personalized, and emotionally intelligent—never to
              track you, advertise to you, or manipulate your behavior.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3">2.1 To Operate and Improve the AI</h3>
            <ul className="list-disc list-inside text-white/80 space-y-2 mb-4">
              <li>Maintain conversation continuity</li>
              <li>Enable emotional understanding</li>
              <li>Improve tone, clarity, and responsiveness</li>
              <li>Enhance memory for your individual experience</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3">2.2 To Ensure Safety</h3>
            <ul className="list-disc list-inside text-white/80 space-y-2 mb-4">
              <li>Detect and prevent harmful or abusive use</li>
              <li>Provide support if you express distress</li>
              <li>Comply with legal requirements where necessary</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3">2.3 To Provide Support and Fix Issues</h3>
            <ul className="list-disc list-inside text-white/80 space-y-2">
              <li>Diagnose bugs</li>
              <li>Improve reliability and performance</li>
              <li>Respond to support requests (with your permission)</li>
            </ul>
          </section>

          <section className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">3. How Your Data Is Stored</h2>

            <h3 className="text-xl font-semibold text-white mb-3">3.1 Secure Storage</h3>
            <p className="text-white/80 leading-relaxed mb-4">Your data is encrypted:</p>
            <ul className="list-disc list-inside text-white/80 space-y-2 mb-4">
              <li>In transit (while being sent)</li>
              <li>At rest (while stored)</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3">3.2 Emotional Memory</h3>
            <p className="text-white/80 leading-relaxed mb-2">
              Your AI uses an emotionally tagged memory system to personalize your interactions. These memories:
            </p>
            <ul className="list-disc list-inside text-white/80 space-y-2 mb-4">
              <li>Live only inside your private environment</li>
              <li>Are never shared or pooled with other users</li>
              <li>Can be reset or deleted at any time</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3">3.3 Optional Decentralized Storage</h3>
            <p className="text-white/80 leading-relaxed mb-2">
              Some features may offer secure, tamper-resistant storage for emotional memory using distributed or
              cryptographic technologies. This ensures:
            </p>
            <ul className="list-disc list-inside text-white/80 space-y-2 mb-4">
              <li>Verifiable data integrity</li>
              <li>Protection from unauthorized modification</li>
              <li>User-controlled deletion</li>
            </ul>
            <p className="text-white/80 leading-relaxed">
              You will always be informed before any decentralized storage is used.
            </p>
          </section>

          <section className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">4. What We Do Not Do With Your Data</h2>
            <p className="text-white/80 leading-relaxed mb-2">We never:</p>
            <ul className="list-disc list-inside text-white/80 space-y-2">
              <li>Sell your data</li>
              <li>Share your conversations with advertisers</li>
              <li>Use your emotional data to influence purchasing decisions</li>
              <li>Train global models on your private conversations</li>
              <li>Provide your data to third parties without consent</li>
            </ul>
          </section>

          <section className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">5. How Long We Keep Your Information</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              We retain your data only as long as needed to provide the service. You may request deletion at any time.
            </p>
            <p className="text-white/80 leading-relaxed mb-2">You may delete:</p>
            <ul className="list-disc list-inside text-white/80 space-y-2 mb-4">
              <li>Your entire conversation history</li>
              <li>Emotional memory graph</li>
              <li>Profile settings</li>
              <li>All previously processed emotional or sentiment information</li>
            </ul>
            <p className="text-white/80 leading-relaxed">We will permanently remove it from our systems.</p>
          </section>

          <section className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">6. Who Has Access to Your Data</h2>
            <p className="text-white/80 leading-relaxed mb-4">Access is strictly limited.</p>

            <h3 className="text-xl font-semibold text-white mb-3">Internal Access</h3>
            <p className="text-white/80 leading-relaxed mb-4">
              Only authorized team members may access limited data for support or technical troubleshooting, and only
              with your explicit permission.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3">External Access</h3>
            <p className="text-white/80 leading-relaxed mb-2">
              We do not share personal or emotional data with outside organizations except:
            </p>
            <ul className="list-disc list-inside text-white/80 space-y-2 mb-4">
              <li>When you explicitly authorize a third-party integration</li>
              <li>When required by law</li>
              <li>When necessary to prevent harm to you or others</li>
            </ul>
            <p className="text-white/80 leading-relaxed">We never share data for marketing or advertising.</p>
          </section>

          <section className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights and Controls</h2>
            <p className="text-white/80 leading-relaxed mb-2">You can:</p>
            <ul className="list-disc list-inside text-white/80 space-y-2 mb-4">
              <li>Request a copy of your data</li>
              <li>Delete your data completely</li>
              <li>Correct or update information</li>
              <li>Disable emotional memory at any time</li>
              <li>Opt out of personalization</li>
              <li>Control what the AI remembers or forgets</li>
              <li>Request human review of any automated handling of data</li>
            </ul>
            <p className="text-white/80 leading-relaxed">We support your right to privacy, autonomy, and control.</p>
          </section>

          <section className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">8. Children's Privacy</h2>
            <p className="text-white/80 leading-relaxed">
              Our services are not intended for children under the age of 13 (or local equivalent). We do not knowingly
              collect personal information from children without parental permission.
            </p>
          </section>

          <section className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">9. International Data Transfers</h2>
            <p className="text-white/80 leading-relaxed mb-2">
              Depending on your region, your data may be processed or stored in secure data centers outside your
              country. All processing follows:
            </p>
            <ul className="list-disc list-inside text-white/80 space-y-2">
              <li>Industry security standards</li>
              <li>Modern privacy frameworks</li>
              <li>Appropriate safeguards for international transfer</li>
            </ul>
          </section>

          <section className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">10. Updates to This Policy</h2>
            <p className="text-white/80 leading-relaxed">
              We may update this policy to reflect improvements to safety, security, or legal compliance. If changes are
              significant, we will notify you directly.
            </p>
          </section>

          <section className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">11. Contact Us</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              If you have questions about this policy, your data, or how the AI handles emotional information, you can
              reach us at:
            </p>
            <div className="space-y-2 text-white/80">
              <p>
                Email:{" "}
                <a href="mailto:privacy@kaikostudios.xyz" className="text-primary hover:underline">
                  privacy@kaikostudios.xyz
                </a>
              </p>
              <p>
                Support:{" "}
                <Link href="/faq" className="text-primary hover:underline">
                  Visit our FAQ
                </Link>
              </p>
            </div>
          </section>
        </div>

        <div className="text-center mt-12">
          <p className="text-white/60 text-sm">
            Have more questions?{" "}
            <Link href="/faq" className="text-primary hover:underline">
              Check our FAQ
            </Link>{" "}
            or{" "}
            <Link href="/trust-safety" className="text-primary hover:underline">
              read our Trust & Safety page
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  )
}
