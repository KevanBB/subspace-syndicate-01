
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Join = () => {
  const { user } = useAuth();
  
  return (
    <section id="join" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="glass px-3 py-1 rounded-full inline-block mb-6">
              <span className="text-white/80 text-sm font-medium">Join the Movement</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to <span className="text-gradient">Take Control?</span>
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
              SubSpace is exclusive by design. Request an invitation now and be among the first to experience the revolution.
            </p>
            
            {user ? (
              <div className="flex flex-col items-center gap-4">
                <p className="text-white/70 text-lg">Welcome to SubSpace! You're already part of the revolution.</p>
                <Button className="bg-crimson hover:bg-crimson/90 text-white">
                  Explore SubSpace <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-8">
                  <Input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="bg-abyss border-white/20 text-white placeholder:text-white/50 h-12"
                  />
                  <Button 
                    className="bg-crimson hover:bg-crimson/90 text-white h-12"
                    asChild
                  >
                    <Link to="/auth?tab=signup">
                      Request Invite <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
                
                <p className="text-white/50 text-sm">
                  By requesting an invitation, you agree to our Terms of Service and Privacy Policy.
                </p>
              </>
            )}
          </motion.div>
        </div>
      </div>
      
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-abyss via-abyss/95 to-abyss z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-4xl">
        <div className="absolute inset-0 bg-crimson/10 rounded-full blur-[150px]"></div>
      </div>
    </section>
  );
};

export default Join;
