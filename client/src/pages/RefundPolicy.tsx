import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const RefundPolicy = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Refund Policy</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We want you to be completely satisfied with your Yellow Tea purchase. Here's our comprehensive refund policy.
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
                At Yellow Tea, we are committed to your satisfaction. This Refund Policy outlines the terms and conditions for returns and refunds of our tea products.
              </p>
            </div>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4">30-Day Return Window</h2>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <p className="text-muted-foreground mb-4">
                    We offer a 30-day return window from the date of delivery for most products. To be eligible for a return, items must meet the following conditions:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Products must be unopened and in original packaging</li>
                    <li>Products must be in the same condition as received</li>
                    <li>Original purchase receipt or order confirmation required</li>
                    <li>Items must not be damaged due to misuse or normal wear</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Eligible Products</h2>
                <div className="bg-card p-6 rounded-lg border">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-green-600">✓ Returnable Items</h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Unopened tea packages</li>
                        <li>Damaged or defective products</li>
                        <li>Incorrect items shipped</li>
                        <li>Tea accessories in original condition</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-red-600">✗ Non-Returnable Items</h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Opened tea packages (for hygiene reasons)</li>
                        <li>Custom or personalized products</li>
                        <li>Gift cards</li>
                        <li>Items damaged by customer misuse</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Return Process</h2>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Step-by-Step Guide</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-semibold">Contact Our Support Team</p>
                        <p className="text-muted-foreground">Email us at returns@yellowtea.com or call +91 98765 43210 within 30 days of delivery</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-semibold">Provide Order Details</p>
                        <p className="text-muted-foreground">Share your order number, reason for return, and photos if applicable</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-semibold">Receive Return Authorization</p>
                        <p className="text-muted-foreground">We'll provide a Return Merchandise Authorization (RMA) number and return instructions</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <p className="font-semibold">Ship the Items</p>
                        <p className="text-muted-foreground">Package items securely and ship to our return center with the provided RMA number</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Refund Processing</h2>
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-3">Timeline and Methods</h3>
                  <div className="space-y-4 text-muted-foreground">
                    <div>
                      <p><strong>Processing Time:</strong> 2-3 business days after we receive your return</p>
                    </div>
                    <div>
                      <p><strong>Refund Method:</strong> Original payment method used for purchase</p>
                    </div>
                    <div>
                      <p><strong>Credit Card Refunds:</strong> 5-7 business days to appear on statement</p>
                    </div>
                    <div>
                      <p><strong>Digital Wallet Refunds:</strong> 1-3 business days</p>
                    </div>
                    <div>
                      <p><strong>Bank Transfer:</strong> 3-5 business days</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Shipping Costs</h2>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Customer Responsibility</h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Return shipping costs (for change of mind)</li>
                        <li>International return shipping</li>
                        <li>Insurance and tracking (recommended)</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Our Responsibility</h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Return shipping (for defective items)</li>
                        <li>Return shipping (for our errors)</li>
                        <li>Replacement shipping costs</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Special Circumstances</h2>
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-3">Damaged or Defective Products</h3>
                  <p className="text-muted-foreground mb-4">
                    If you receive damaged or defective products, please contact us within 48 hours of delivery:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Take photos of the damaged packaging and product</li>
                    <li>Do not dispose of the damaged items until instructed</li>
                    <li>We may arrange for pickup or provide a prepaid return label</li>
                    <li>Full refund or replacement will be provided</li>
                  </ul>
                  
                  <h3 className="text-lg font-semibold mb-3">Wrong Item Shipped</h3>
                  <p className="text-muted-foreground">
                    If we shipped the wrong item, we'll arrange immediate return pickup and send the correct product at no additional cost.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Partial Refunds</h2>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <p className="text-muted-foreground mb-4">
                    Partial refunds may be granted in the following situations:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Items returned without original packaging</li>
                    <li>Items with signs of use beyond normal inspection</li>
                    <li>Items returned after 30 days but within 60 days</li>
                    <li>Restocking fees for certain bulk orders (as specified)</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Exchanges</h2>
                <div className="bg-card p-6 rounded-lg border">
                  <p className="text-muted-foreground mb-4">
                    We currently do not offer direct exchanges. For different products or quantities:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Return the original item following our return process</li>
                    <li>Place a new order for the desired product</li>
                    <li>We'll process the refund and new order simultaneously to minimize delays</li>
                  </ol>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <p className="text-muted-foreground mb-4">
                    For any questions about returns or refunds, please contact our customer service team:
                  </p>
                  <div className="text-muted-foreground space-y-2">
                    <p><strong>Email:</strong> returns@yellowtea.com</p>
                    <p><strong>Phone:</strong> +91 98765 43210</p>
                    <p><strong>Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST</p>
                    <p><strong>Address:</strong> Yellow Tea Returns Center<br />123 Tea Garden Road, Assam, India 781001</p>
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

export default RefundPolicy;