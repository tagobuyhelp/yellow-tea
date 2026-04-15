import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search, Leaf, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const popularPages = [
    { name: "Shop All Teas", href: "/shop", icon: Leaf },
    { name: "Search Products", href: "/search", icon: Search },
    { name: "About Us", href: "/about", icon: Home },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        {/* Main 404 Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              {/* 404 Hero */}
              <div className="mb-12">
                <div className="relative mb-8">
                  <h1 className="text-8xl md:text-9xl font-bold text-primary/20 select-none">
                    404
                  </h1>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Leaf className="h-24 w-24 text-primary animate-pulse" />
                  </div>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Oops! This page has steeped away
                </h2>
                
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  The page you're looking for seems to have gone on a tea break. 
                  Don't worry, we'll help you find your way back to our wonderful world of teas!
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                  <Button asChild size="lg">
                    <Link to="/">
                      <Home className="h-5 w-5 mr-2" />
                      Back to Home
                    </Link>
                  </Button>
                  
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/shop">
                      <Leaf className="h-5 w-5 mr-2" />
                      Explore Teas
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Popular Pages */}
              <div className="mb-12">
                <h3 className="text-2xl font-semibold mb-6">Popular Destinations</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {popularPages.map((page, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6 text-center">
                        <page.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                        <h4 className="font-semibold mb-2">{page.name}</h4>
                        <Button variant="ghost" asChild>
                          <Link to={page.href}>
                            Visit Page
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Help Section */}
              <div className="bg-muted/50 rounded-lg p-8">
                <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
                <p className="text-muted-foreground mb-6">
                  If you think this page should exist or you're experiencing technical difficulties, 
                  please don't hesitate to reach out to our customer support team.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline" asChild>
                    <Link to="/contact">
                      Contact Support
                    </Link>
                  </Button>
                  <Button variant="ghost" onClick={() => window.history.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default NotFound;
