import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const PrivacyPolicy = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <div className="bg-card p-8 rounded-lg shadow-sm mb-8">
              <p className="text-muted-foreground mb-4">
                <strong>Last updated:</strong> January 2024
              </p>
              <p className="text-muted-foreground">
                Yellow Tea ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by Yellow Tea.
              </p>
            </div>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Name, email address, and phone number</li>
                    <li>Billing and shipping addresses</li>
                    <li>Payment information (processed securely by our payment partners)</li>
                    <li>Order history and preferences</li>
                  </ul>
                </div>
                
                <div className="bg-muted/50 p-6 rounded-lg mt-4">
                  <h3 className="text-lg font-semibold mb-3">Automatically Collected Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Device information and IP address</li>
                    <li>Browser type and version</li>
                    <li>Website usage patterns and analytics</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
                <div className="bg-card p-6 rounded-lg border">
                  <ul className="space-y-3 text-muted-foreground">
                    <li>• <strong>Order Processing:</strong> To process and fulfill your orders, including shipping and customer service</li>
                    <li>• <strong>Communication:</strong> To send order confirmations, shipping updates, and respond to inquiries</li>
                    <li>• <strong>Marketing:</strong> To send promotional emails and personalized recommendations (with your consent)</li>
                    <li>• <strong>Improvement:</strong> To analyze website usage and improve our products and services</li>
                    <li>• <strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Information Sharing</h2>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <p className="text-muted-foreground mb-4">
                    We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>With shipping partners to deliver your orders</li>
                    <li>With payment processors to process transactions</li>
                    <li>With service providers who assist with our business operations</li>
                    <li>When required by law or to protect our rights</li>
                    <li>In connection with a business transfer or merger</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Data Security</h2>
                <div className="bg-card p-6 rounded-lg border">
                  <p className="text-muted-foreground mb-4">
                    We implement appropriate technical and organizational measures to protect your personal information:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>SSL encryption for data transmission</li>
                    <li>Secure data storage with access controls</li>
                    <li>Regular security audits and updates</li>
                    <li>Employee training on data protection</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <p className="text-muted-foreground mb-4">You have the right to:</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Access your personal information we hold</li>
                    <li>Correct inaccurate or incomplete information</li>
                    <li>Request deletion of your personal information</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Data portability and restriction of processing</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    To exercise these rights, please contact us at privacy@yellowtea.com
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Cookies</h2>
                <div className="bg-card p-6 rounded-lg border">
                  <p className="text-muted-foreground mb-4">
                    We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can manage cookie preferences through your browser settings.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <p className="text-muted-foreground mb-4">
                    If you have any questions about this Privacy Policy, please contact us:
                  </p>
                  <div className="text-muted-foreground">
                    <p>Email: privacy@yellowtea.com</p>
                    <p>Phone: +91 98765 43210</p>
                    <p>Address: 123 Tea Garden Road, Assam, India 781001</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;