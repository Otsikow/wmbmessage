import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function Terms() {
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
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Terms of Service</h1>
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
                Welcome to MessageGuide. By accessing or using our application, you agree to 
                be bound by these Terms of Service. Please read them carefully.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Acceptance of Terms</h2>
              <p className="text-sm leading-relaxed">
                By creating an account or using MessageGuide, you agree to these Terms of 
                Service and our Privacy Policy. If you do not agree, please do not use our 
                services.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Description of Service</h2>
              <p className="text-sm leading-relaxed">
                MessageGuide provides a digital platform for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm leading-relaxed ml-4">
                <li>Reading and studying the Bible</li>
                <li>Accessing William Marrion Branham's sermons</li>
                <li>Creating personal notes and collections</li>
                <li>Searching scripture and sermon content</li>
                <li>Tracking reading progress</li>
                <li>Sharing verses and content</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">User Accounts</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <p>When you create an account, you agree to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized access</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Acceptable Use</h2>
              <p className="text-sm leading-relaxed">You agree NOT to:</p>
              <ul className="list-disc list-inside space-y-2 text-sm leading-relaxed ml-4">
                <li>Use the service for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the service</li>
                <li>Upload malicious code or viruses</li>
                <li>Harass or harm other users</li>
                <li>Impersonate others or provide false information</li>
                <li>Scrape or data mine the service without permission</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Intellectual Property</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <p>
                  The Bible text is in the public domain. William Marrion Branham's sermons 
                  are provided for educational and spiritual purposes.
                </p>
                <p>
                  All other content, features, and functionality of MessageGuide (including 
                  but not limited to text, graphics, logos, and software) are the property 
                  of MessageGuide and are protected by copyright and trademark laws.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">User Content</h2>
              <p className="text-sm leading-relaxed">
                You retain ownership of any notes, collections, or other content you create 
                in MessageGuide. By using our service, you grant us a license to store, 
                backup, and display your content as necessary to provide our services.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Disclaimer of Warranties</h2>
              <p className="text-sm leading-relaxed">
                MessageGuide is provided "as is" without warranties of any kind, either 
                express or implied. We do not guarantee that the service will be 
                uninterrupted, secure, or error-free.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Limitation of Liability</h2>
              <p className="text-sm leading-relaxed">
                To the fullest extent permitted by law, MessageGuide shall not be liable 
                for any indirect, incidental, special, consequential, or punitive damages 
                arising from your use of the service.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Termination</h2>
              <p className="text-sm leading-relaxed">
                We reserve the right to suspend or terminate your account at any time for 
                violations of these Terms. You may also delete your account at any time 
                through the app settings.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Changes to Terms</h2>
              <p className="text-sm leading-relaxed">
                We may modify these Terms at any time. We will notify users of material 
                changes via email or app notification. Continued use of the service after 
                changes constitutes acceptance of the new Terms.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Governing Law</h2>
              <p className="text-sm leading-relaxed">
                These Terms shall be governed by and construed in accordance with applicable 
                laws, without regard to conflict of law provisions.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Contact Information</h2>
              <p className="text-sm leading-relaxed">
                For questions about these Terms of Service, please contact us at:
              </p>
              <a 
                href="mailto:support@messageguide.com" 
                className="text-sm text-primary hover:underline"
              >
                support@messageguide.com
              </a>
            </div>

            <div className="bg-muted p-4 rounded-lg mt-6">
              <p className="text-xs text-muted-foreground">
                By using MessageGuide, you acknowledge that you have read, understood, and 
                agree to be bound by these Terms of Service.
              </p>
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
