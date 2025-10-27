import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="relative h-32 md:h-40 overflow-hidden bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="absolute inset-0 flex items-center">
          <div className="px-4 sm:px-6 md:px-8 lg:px-12 w-full">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(-1)} 
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="flex items-center gap-2 sm:gap-3">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Privacy Policy</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full py-6 sm:py-8 pb-24 md:pb-8">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 max-w-4xl mx-auto space-y-6">
          <div className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Last Updated: October 27, 2025
              </p>
              <p className="text-base leading-relaxed">
                MessageGuide ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                information when you use our application.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Information We Collect</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <h3 className="font-semibold text-base">Account Information</h3>
                <p>
                  When you create an account, we collect your email address and any profile 
                  information you choose to provide.
                </p>

                <h3 className="font-semibold text-base mt-4">Usage Data</h3>
                <p>
                  We collect information about how you interact with the app, including:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Bible verses you read and bookmark</li>
                  <li>Notes and collections you create</li>
                  <li>Search queries and preferences</li>
                  <li>Reading calendar activities</li>
                </ul>

                <h3 className="font-semibold text-base mt-4">Device Information</h3>
                <p>
                  We may collect device information such as your device type, operating system, 
                  and browser type to improve app functionality.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-sm leading-relaxed ml-4">
                <li>To provide and maintain our services</li>
                <li>To personalize your experience</li>
                <li>To sync your data across devices</li>
                <li>To send you notifications and updates (with your permission)</li>
                <li>To improve our app and develop new features</li>
                <li>To ensure security and prevent fraud</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Data Security</h2>
              <p className="text-sm leading-relaxed">
                We implement appropriate security measures to protect your personal information. 
                However, no method of transmission over the internet is 100% secure, and we 
                cannot guarantee absolute security.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Your Rights</h2>
              <p className="text-sm leading-relaxed">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-sm leading-relaxed ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Third-Party Services</h2>
              <p className="text-sm leading-relaxed">
                We use Supabase for authentication and data storage. Please review their 
                privacy policy for information about how they handle your data.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Children's Privacy</h2>
              <p className="text-sm leading-relaxed">
                MessageGuide is intended for users of all ages. We do not knowingly collect 
                personal information from children under 13 without parental consent.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Changes to This Policy</h2>
              <p className="text-sm leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of 
                any changes by posting the new Privacy Policy on this page and updating the 
                "Last Updated" date.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Contact Us</h2>
              <p className="text-sm leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <a 
                href="mailto:support@messageguide.com" 
                className="text-sm text-primary hover:underline"
              >
                support@messageguide.com
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      <div className="md:hidden">
        <Navigation />
      </div>
    </div>
  );
}
