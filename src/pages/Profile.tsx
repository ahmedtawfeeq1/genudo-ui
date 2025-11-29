
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SEOHead from '@/components/common/SEOHead';
import { pageConfigs } from '@/utils/pageConfig';
import ProfileForm from '@/components/profile/ProfileForm';
import PasswordResetForm from '@/components/profile/PasswordResetForm';

const Profile = () => {
  return (
    <>
      <SEOHead 
        title={pageConfigs.profile.title}
        description={pageConfigs.profile.description}
        keywords={pageConfigs.profile.keywords}
      />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <ProfileForm />
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <PasswordResetForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Profile;
