import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const TermsOfService = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Terms of Service</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Please read these terms carefully before using our website and services.
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
                These Terms of Service ("Terms") govern your use of the Yellow Tea website and services. By accessing or using our services, you agree to be bound by these Terms.
              </p>
            </div>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4">Acceptance of Terms</h2>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <p className="text-muted-foreground">
                    By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Products and Services</h2>
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-3">Product Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>We strive to ensure accurate product descriptions and pricing</li>
                    <li>Product images may vary slightly from actual products</li>
                    <li>We reserve the right to modify or discontinue products without notice</li>
                    <li>All products are subject to availability</li>
                  </ul>
                  
                  <h3 className="text-lg font-semibold mb-3">Pricing</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>All prices are listed in Indian Rupees (INR) unless otherwise specified</li>
                    <li>Prices are subject to change without prior notice</li>
                    <li>Shipping charges are additional unless stated otherwise</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Orders and Payments</h2>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Order Process</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>All orders are subject to acceptance and availability</li>
                    <li>We reserve the right to refuse or cancel any order</li>
                    <li>Order confirmation will be sent via email</li>
                    <li>Orders cannot be modified once confirmed</li>
                  </ul>
                  
                  <h3 className="text-lg font-semibold mb-3">Payment Terms</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Payment must be made at the time of order placement</li>
                    <li>We accept major credit cards, debit cards, and digital wallets</li>
                    <li>All transactions are processed securely through encrypted payment gateways</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Shipping and Delivery</h2>
                <div className="bg-card p-6 rounded-lg border">
                  <ul className="space-y-3 text-muted-foreground">
                    <li>• <strong>Delivery Time:</strong> Our "Garden to Cup in 10 Days" promise applies to most locations</li>
                    <li>• <strong>Shipping Charges:</strong> Calculated based on delivery location and order value</li>
                    <li>• <strong>International Shipping:</strong> Available to most countries with varying delivery times</li>
                    <li>• <strong>Risk of Loss:</strong> Risk of loss passes to customer upon delivery</li>
                    <li>• <strong>Damaged Products:</strong> Report any damaged items within 48 hours of delivery</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Returns and Refunds</h2>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>30-day return policy for unopened products in original packaging</li>
                    <li>Return shipping costs are the responsibility of the customer</li>
                    <li>Refunds will be processed within 7-10 business days</li>
                    <li>Custom or personalized products cannot be returned</li>
                    <li>Please refer to our Refund Policy for detailed terms</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">User Responsibilities</h2>
                <div className="bg-card p-6 rounded-lg border">
                  <p className="text-muted-foreground mb-4">By using our services, you agree to:</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Use the website for lawful purposes only</li>
                    <li>Not interfere with or disrupt our services</li>
                    <li>Respect intellectual property rights</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <p className="text-muted-foreground mb-4">
                    To the maximum extent permitted by law, Yellow Tea shall not be liable for any indirect, incidental, special, or consequential damages arising from:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Use or inability to use our products or services</li>
                    <li>Unauthorized access to or alteration of your data</li>
                    <li>Third-party conduct or content on the service</li>
                    <li>Any other matter relating to the service</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Governing Law</h2>
                <div className="bg-card p-6 rounded-lg border">
                  <p className="text-muted-foreground">
                    These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in Assam, India.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Changes to Terms</h2>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <p className="text-muted-foreground">
                    We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services after any changes constitutes acceptance of the new Terms.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
                <div className="bg-card p-6 rounded-lg border">
                  <p className="text-muted-foreground mb-4">
                    If you have any questions about these Terms of Service, please contact us:
                  </p>
                  <div className="text-muted-foreground">
                    <p>Email: legal@yellowtea.com</p>
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

export default TermsOfService;