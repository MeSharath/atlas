import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { analyticsService } from '@/services/analytics';
import { 
  MapPin, 
  Brain, 
  Shield, 
  Cloud, 
  Users, 
  Star,
  ArrowRight,
  CheckCircle,
  Globe,
  Clock,
  TrendingUp
} from 'lucide-react';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTrips: 1250,
    happyTravelers: 850,
    destinations: 120,
    avgRating: 4.8
  });

  useEffect(() => {
    analyticsService.trackPageView('home', 'SoloAI - AI-Powered Travel Planner');
  }, []);

  const handleCTAClick = (source: string) => {
    analyticsService.trackUserInteraction('click', 'cta_button', { source });
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Planning',
      description: 'Our advanced AI creates personalized itineraries based on your preferences, interests, and travel style.',
      color: 'text-blue-600'
    },
    {
      icon: Cloud,
      title: 'Weather Adaptation',
      description: 'Real-time weather monitoring automatically adjusts your plans with indoor alternatives when needed.',
      color: 'text-green-600'
    },
    {
      icon: Shield,
      title: 'Solo Travel Safety',
      description: 'Every recommendation prioritizes safety with solo-friendly accommodations and well-reviewed activities.',
      color: 'text-purple-600'
    },
    {
      icon: MapPin,
      title: 'Interactive Maps',
      description: 'Visualize your entire journey with detailed maps, routes, and location information.',
      color: 'text-red-600'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Share Your Preferences',
      description: 'Tell us about your destination, dates, interests, and travel style.'
    },
    {
      step: 2,
      title: 'AI Creates Your Plan',
      description: 'Our AI generates a personalized itinerary with activities, routes, and recommendations.'
    },
    {
      step: 3,
      title: 'Adapt & Explore',
      description: 'Your itinerary adapts to weather and your changing preferences in real-time.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      location: 'San Francisco, CA',
      rating: 5,
      text: 'SoloAI planned the perfect 5-day Tokyo trip for me. The AI even suggested indoor activities when it rained!',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face'
    },
    {
      name: 'Marcus Johnson',
      location: 'London, UK',
      rating: 5,
      text: 'As a solo traveler, safety is my priority. SoloAI only recommended places where I felt completely secure.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face'
    },
    {
      name: 'Elena Rodriguez',
      location: 'Barcelona, Spain',
      rating: 5,
      text: 'The interactive maps made navigation so easy. I discovered hidden gems I never would have found otherwise.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Your Perfect Solo Adventure
              <span className="block text-accent-200">Powered by AI</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto animate-slide-up">
              Discover personalized travel itineraries that adapt to weather, prioritize safety, 
              and unlock amazing solo travel experiences around the world.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
              {user ? (
                <Link
                  to="/create"
                  className="btn btn-lg bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold shadow-lg"
                  onClick={() => handleCTAClick('hero_create_trip')}
                >
                  Create Your Trip
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="btn btn-lg bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold shadow-lg"
                    onClick={() => handleCTAClick('hero_get_started')}
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  
                  <button
                    onClick={() => {
                      document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
                      handleCTAClick('hero_watch_demo');
                    }}
                    className="btn btn-lg btn-ghost border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
                  >
                    Watch Demo
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 opacity-20">
          <MapPin className="h-12 w-12 animate-pulse-slow" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-20">
          <Globe className="h-16 w-16 animate-pulse-slow" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                {stats.totalTrips.toLocaleString()}+
              </div>
              <div className="text-gray-600">Trips Planned</div>
            </div>
            
            <div className="animate-fade-in">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                {stats.happyTravelers.toLocaleString()}+
              </div>
              <div className="text-gray-600">Happy Travelers</div>
            </div>
            
            <div className="animate-fade-in">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                {stats.destinations}+
              </div>
              <div className="text-gray-600">Destinations</div>
            </div>
            
            <div className="animate-fade-in">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2 flex items-center justify-center">
                <Star className="h-8 w-8 text-yellow-400 mr-1" />
                {stats.avgRating}
              </div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SoloAI?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine cutting-edge AI technology with deep travel expertise to create 
              the perfect solo travel experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card card-body text-center hover:shadow-medium transition-shadow duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 mb-4 ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get your personalized travel itinerary in just three simple steps.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div
                key={index}
                className="text-center animate-slide-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-600 text-white text-2xl font-bold mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Solo Travelers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied solo travelers who trust SoloAI for their adventures.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="card card-body animate-slide-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.text}"
                </p>
                
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready for Your Next Solo Adventure?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of solo travelers who trust SoloAI to plan their perfect trips.
          </p>
          
          {user ? (
            <Link
              to="/create"
              className="btn btn-lg bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold shadow-lg inline-flex items-center"
              onClick={() => handleCTAClick('bottom_cta_create_trip')}
            >
              Create Your First Trip
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          ) : (
            <Link
              to="/signup"
              className="btn btn-lg bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold shadow-lg inline-flex items-center"
              onClick={() => handleCTAClick('bottom_cta_get_started')}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
