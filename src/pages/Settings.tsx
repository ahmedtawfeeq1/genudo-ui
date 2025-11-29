
import React from "react";
import ModernLayout from "@/components/layout/ModernLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Check, Plus, User, Building, CreditCard, Bell, Shield, Users } from "lucide-react";
import Key from "@/components/ui/key";
import Lock from "@/components/ui/lock";

const Settings = () => {
  return (
    <ModernLayout title="Settings">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="profile" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Manage your personal information and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary text-2xl font-bold">JD</span>
                  </div>
                  <div className="space-y-2">
                    <Button size="sm">Upload Photo</Button>
                    <Button variant="outline" size="sm">Remove</Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" defaultValue="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" defaultValue="Doe" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="john.doe@example.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Time Zone</Label>
                  <select 
                    id="timezone" 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    defaultValue="America/New_York"
                  >
                    <option value="America/New_York">Eastern Time (US & Canada)</option>
                    <option value="America/Chicago">Central Time (US & Canada)</option>
                    <option value="America/Denver">Mountain Time (US & Canada)</option>
                    <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>
                
                <div className="flex justify-end">
                  <Button>Save Profile</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account details and company information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <RadioGroup defaultValue="business" className="flex">
                    <div className="flex items-center space-x-2 mr-6">
                      <RadioGroupItem value="personal" id="personal" />
                      <Label htmlFor="personal" className="cursor-pointer">Personal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="business" id="business" />
                      <Label htmlFor="business" className="cursor-pointer">Business</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" defaultValue="Acme Corp" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" defaultValue="https://www.acmecorp.com" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-size">Company Size</Label>
                  <select 
                    id="company-size" 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    defaultValue="11-50"
                  >
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501+">501+ employees</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <select 
                    id="industry" 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    defaultValue="software"
                  >
                    <option value="software">Software & IT</option>
                    <option value="ecommerce">E-Commerce & Retail</option>
                    <option value="finance">Finance & Banking</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-2">Security Settings</h3>
                  
                  <div className="space-y-3 p-4 border border-gray-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Shield size={18} className="text-gray-500" />
                        <div>
                          <div className="font-medium">Two-Factor Authentication</div>
                          <div className="text-sm text-gray-500">
                            Add an extra layer of security to your account
                          </div>
                        </div>
                      </div>
                      <Button variant="outline">Setup</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Key size={18} className="text-gray-500" />
                        <div>
                          <div className="font-medium">Change Password</div>
                          <div className="text-sm text-gray-500">
                            Update your password regularly for security
                          </div>
                        </div>
                      </div>
                      <Button variant="outline">Update</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Lock size={18} className="text-gray-500" />
                        <div>
                          <div className="font-medium">API Keys</div>
                          <div className="text-sm text-gray-500">
                            Manage API keys for integrations
                          </div>
                        </div>
                      </div>
                      <Button variant="outline">Manage</Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button>Save Account Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="billing" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
                <CardDescription>
                  Manage your subscription and payment methods.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border border-gray-200 rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-md font-medium">Pro Plan</h3>
                        <Badge className="ml-2 bg-primary">Current</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        $49/month, billed monthly
                      </p>
                    </div>
                    <Button variant="outline">Change Plan</Button>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Agents</div>
                      <div className="font-medium">
                        10 <span className="text-sm text-gray-500">/ 15</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Storage</div>
                      <div className="font-medium">
                        2.5 GB <span className="text-sm text-gray-500">/ 10 GB</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Messages</div>
                      <div className="font-medium">
                        15,428 <span className="text-sm text-gray-500">/ 50,000</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Integrations</div>
                      <div className="font-medium">
                        3 <span className="text-sm text-gray-500">/ Unlimited</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Current billing period: April 10 - May 9, 2025
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-3">Payment Methods</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div className="flex items-center">
                        <div className="h-8 w-12 bg-gray-100 rounded flex items-center justify-center mr-3">
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <div className="font-medium">Visa ending in 4242</div>
                          <div className="text-xs text-gray-500">Expires 12/25</div>
                        </div>
                        <Badge className="ml-3 bg-green-100 text-green-800 hover:bg-green-100">
                          <Check size={12} className="mr-1" />
                          Default
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      <Plus size={16} className="mr-2" />
                      Add Payment Method
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-3">Billing History</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Description</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Invoice</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-200">
                          <td className="py-3 px-4">Apr 10, 2025</td>
                          <td className="py-3 px-4">Pro Plan - Monthly</td>
                          <td className="py-3 px-4">$49.00</td>
                          <td className="py-3 px-4">
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm">Download</Button>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-3 px-4">Mar 10, 2025</td>
                          <td className="py-3 px-4">Pro Plan - Monthly</td>
                          <td className="py-3 px-4">$49.00</td>
                          <td className="py-3 px-4">
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm">Download</Button>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-3 px-4">Feb 10, 2025</td>
                          <td className="py-3 px-4">Pro Plan - Monthly</td>
                          <td className="py-3 px-4">$49.00</td>
                          <td className="py-3 px-4">
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm">Download</Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="team" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>
                  Invite and manage your team members.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-medium">Team Members (3/5)</h3>
                  <Button>
                    <Plus size={16} className="mr-2" />
                    Invite Member
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary font-medium">JD</span>
                      </div>
                      <div>
                        <div className="font-medium">John Doe</div>
                        <div className="text-sm text-gray-500">john.doe@example.com</div>
                      </div>
                      <Badge className="ml-3">Owner</Badge>
                    </div>
                    <Button variant="ghost" size="sm">Manage</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary font-medium">AS</span>
                      </div>
                      <div>
                        <div className="font-medium">Alice Smith</div>
                        <div className="text-sm text-gray-500">alice@example.com</div>
                      </div>
                      <Badge className="ml-3">Admin</Badge>
                    </div>
                    <Button variant="ghost" size="sm">Manage</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary font-medium">BJ</span>
                      </div>
                      <div>
                        <div className="font-medium">Bob Johnson</div>
                        <div className="text-sm text-gray-500">bob@example.com</div>
                      </div>
                      <Badge className="ml-3 bg-gray-100 text-gray-800 hover:bg-gray-100">Member</Badge>
                    </div>
                    <Button variant="ghost" size="sm">Manage</Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-3">Pending Invitations</h3>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <Users size={16} />
                      </div>
                      <div>
                        <div className="font-medium">sarah@example.com</div>
                        <div className="text-sm text-gray-500">Invited Apr 5, 2025</div>
                      </div>
                      <Badge className="ml-3 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
                    </div>
                    <div>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        Cancel
                      </Button>
                      <Button variant="ghost" size="sm">
                        Resend
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-3">Roles & Permissions</h3>
                  
                  <div className="space-y-3 p-4 border border-gray-200 rounded-md">
                    <div>
                      <div className="font-medium">Owner</div>
                      <div className="text-sm text-gray-500">
                        Full access to all settings and resources
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-medium">Admin</div>
                      <div className="text-sm text-gray-500">
                        Can manage team members, agents, and view analytics
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-medium">Member</div>
                      <div className="text-sm text-gray-500">
                        Can create and modify agents, view chats and analytics
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-medium">Viewer</div>
                      <div className="text-sm text-gray-500">
                        Read-only access to conversations and analytics
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how you receive notifications and alerts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-md font-medium mb-3">Email Notifications</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium">Agent Performance Reports</div>
                        <div className="text-sm text-gray-500">
                          Weekly summary of your agents' performance
                        </div>
                      </div>
                      <Switch defaultChecked id="agent-reports" />
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium">Human Handover Alerts</div>
                        <div className="text-sm text-gray-500">
                          Get notified when a conversation is escalated to a human
                        </div>
                      </div>
                      <Switch defaultChecked id="handover-alerts" />
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium">Billing & Account Updates</div>
                        <div className="text-sm text-gray-500">
                          Receive invoices and important account notifications
                        </div>
                      </div>
                      <Switch defaultChecked id="billing-updates" />
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium">Feature Announcements</div>
                        <div className="text-sm text-gray-500">
                          Learn about new features and improvements
                        </div>
                      </div>
                      <Switch defaultChecked id="feature-announcements" />
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium">Usage Alerts</div>
                        <div className="text-sm text-gray-500">
                          Get notified when approaching plan limits
                        </div>
                      </div>
                      <Switch defaultChecked id="usage-alerts" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-3">In-App Notifications</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium">New Conversations</div>
                        <div className="text-sm text-gray-500">
                          Show notifications for new incoming conversations
                        </div>
                      </div>
                      <Switch defaultChecked id="new-conversations" />
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium">Human Handover Requests</div>
                        <div className="text-sm text-gray-500">
                          Get alerted when a conversation needs human attention
                        </div>
                      </div>
                      <Switch defaultChecked id="handover-requests" />
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium">Team Activity</div>
                        <div className="text-sm text-gray-500">
                          Notifications about team member actions
                        </div>
                      </div>
                      <Switch id="team-activity" />
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium">System Alerts</div>
                        <div className="text-sm text-gray-500">
                          Important system notifications and updates
                        </div>
                      </div>
                      <Switch defaultChecked id="system-alerts" />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </ModernLayout>
  );
};

export default Settings;
