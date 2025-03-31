
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import FeaturedCarousel from '@/components/explore/FeaturedCarousel';
import TrendingSection from '@/components/explore/TrendingSection';
import DiscoverSection from '@/components/explore/DiscoverSection';
import DiscoveryWheel from '@/components/explore/DiscoveryWheel';
import CategoriesSection from '@/components/explore/CategoriesSection';
import CommunitySpotlight from '@/components/explore/CommunitySpotlight';
import { motion } from 'framer-motion';

type ContentType = 'all' | 'videos' | 'albums' | 'community';

const Explore = () => {
  const [activeTab, setActiveTab] = useState<ContentType>('all');

  return (
    <AuthenticatedLayout pageTitle="Explore">
      <div className="space-y-8 mb-20">
        {/* Hero Section with Carousel */}
        <section className="relative">
          <FeaturedCarousel />
          
          {/* Content Type Tabs */}
          <div className="mt-6">
            <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as ContentType)}>
              <TabsList className="w-full max-w-md mx-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="videos">Videos</TabsTrigger>
                <TabsTrigger value="albums">Albums</TabsTrigger>
                <TabsTrigger value="community">Community</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-6">
                {/* All content sections */}
              </TabsContent>
              
              <TabsContent value="videos" className="mt-6">
                {/* Videos-specific content */}
              </TabsContent>
              
              <TabsContent value="albums" className="mt-6">
                {/* Albums-specific content */}
              </TabsContent>
              
              <TabsContent value="community" className="mt-6">
                {/* Community-specific content */}
              </TabsContent>
            </Tabs>
          </div>
        </section>
        
        {/* Trending Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Trending Now</h2>
          <TrendingSection contentType={activeTab} />
        </motion.section>
        
        {/* Discover Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Discover</h2>
          <DiscoverSection />
        </motion.section>
        
        {/* Interactive Wheel of Discovery */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="py-6"
        >
          <Card variant="dark" className="overflow-hidden border-white/5 bg-black/30">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-white text-center mb-6">Wheel of Discovery</h2>
              <DiscoveryWheel />
              <p className="text-white/60 text-center text-sm mt-4">
                Spin the wheel to discover random content from across the platform
              </p>
            </CardContent>
          </Card>
        </motion.section>
        
        {/* Categories Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Browse by Category</h2>
          <CategoriesSection />
        </motion.section>
        
        {/* Community Spotlight */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Community Spotlight</h2>
          <CommunitySpotlight />
        </motion.section>
      </div>
    </AuthenticatedLayout>
  );
};

export default Explore;
