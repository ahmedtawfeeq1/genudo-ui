import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Check, AlertCircle } from 'lucide-react';
 
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

// Facebook App ID from environment
const FB_APP_ID = '1777255749372756';

interface MessengerConnectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    pipelineId?: string; // Pipeline to link the account to
}

interface FacebookPage {
    id: string;
    name: string;
    accessToken: string;
}

const MessengerConnectDialog: React.FC<MessengerConnectDialogProps> = ({
    open,
    onOpenChange,
    onSuccess,
    pipelineId
}) => {
    const [step, setStep] = useState<'login' | 'selectPage' | 'connecting' | 'success'>('login');
    const [pages, setPages] = useState<FacebookPage[]>([]);
    const [selectedPageId, setSelectedPageId] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [sdkLoaded, setSdkLoaded] = useState(false);
    const user: any = { id: 'demo' };
    const { toast } = useToast();

    // Load Facebook SDK
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Check if SDK is already loaded
        if ((window as any).FB) {
            setSdkLoaded(true);
            return;
        }

        // Load Facebook SDK
        const script = document.createElement('script');
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.async = true;
        script.defer = true;
        script.crossOrigin = 'anonymous';

        script.onload = () => {
            (window as any).FB.init({
                appId: FB_APP_ID,
                cookie: true,
                xfbml: true,
                version: 'v17.0'
            });
            setSdkLoaded(true);
            console.log('✅ Facebook SDK loaded');
        };

        document.body.appendChild(script);

        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    // Reset state when dialog opens
    useEffect(() => {
        if (open) {
            setStep('login');
            setPages([]);
            setSelectedPageId('');
            setError(null);
        }
    }, [open]);

    const handleFacebookLogin = async () => {
        if (!sdkLoaded) {
            toast({
                title: "Facebook SDK not loaded",
                description: "Please wait a moment and try again",
                variant: "destructive"
            });
            return;
        }

        if (!user) {
            toast({
                title: "Not authenticated",
                description: "Please log in first",
                variant: "destructive"
            });
            return;
        }

        setError(null);

        try {
            console.log('🔐 Starting Facebook Login...');

            const FB = (window as any).FB;

            FB.login((response: any) => {
                console.log('Facebook login response:', response);

                if (response.authResponse) {
                    const userAccessToken = response.authResponse.accessToken;
                    console.log('✅ Got access token');

                    // Call our Edge Function to get available pages
                    handleGetPages(userAccessToken);
                } else {
                    console.log('❌ User cancelled login or did not grant permissions');
                    setError('Facebook login was cancelled or permissions were not granted');
                }
            }, {
                scope: 'pages_show_list,pages_manage_metadata,pages_messaging',
                return_scopes: true
            });

        } catch (err: any) {
            console.error('Facebook login error:', err);
            setError(err.message || 'Failed to initiate Facebook login');
        }
    };

    const handleGetPages = async (userAccessToken: string) => {
        try {
            console.log('📡 Simulating messenger-get-pages...');
            setStep('connecting');

            const data = {
                success: true,
                pages: [
                    { id: 'pg-1', name: 'Demo Page 1', accessToken: 'token-1' },
                    { id: 'pg-2', name: 'Demo Page 2', accessToken: 'token-2' },
                ]
            };

            console.log('Response from messenger-get-pages:', data);

            if (data.success && data.pages) {
                setPages(data.pages);
                
                // Auto-select first page if only one available
                if (data.pages.length === 1) {
                    setSelectedPageId(data.pages[0].id);
                }

                setStep('selectPage');
            } else {
                throw new Error(data.error || 'Failed to fetch pages');
            }

        } catch (err: any) {
            console.error('❌ Get pages error:', err);
            setError(err.message || 'Failed to fetch Facebook pages');
            setStep('login');

            toast({
                title: "Failed to Fetch Pages",
                description: err.message || "Could not retrieve your Facebook pages",
                variant: "destructive"
            });
        }
    };

    const handleConnectPage = async () => {
        if (!selectedPageId) {
            toast({
                title: "No Page Selected",
                description: "Please select a Facebook page to connect",
                variant: "destructive"
            });
            return;
        }

        try {
            console.log('📡 Simulating messenger-connect...');
            setStep('connecting');

            const selectedPage = pages.find(p => p.id === selectedPageId);
            if (!selectedPage) {
                throw new Error('Selected page not found');
            }

            const data = { success: true, page: selectedPage, linkedToPipeline: !!pipelineId };

            console.log('Response from messenger-connect:', data);

            if (data.success) {
                console.log('✅ Messenger connected successfully');
                setStep('success');

                toast({
                    title: "Messenger Connected!",
                    description: `Successfully connected to ${data.page?.name}${data.linkedToPipeline ? ' and linked to pipeline' : ''}`,
                });

                setTimeout(() => {
                    onSuccess();
                    onOpenChange(false);
                }, 2000);

            } else {
                throw new Error('Connection failed');
            }

        } catch (err: any) {
            console.error('❌ Connection error:', err);
            setError(err.message || 'Failed to connect Messenger account');
            setStep('selectPage');

            toast({
                title: "Connection Failed",
                description: err.message || "Failed to connect Messenger account",
                variant: "destructive"
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Connect Facebook Messenger</DialogTitle>
                    <DialogDescription>
                        Connect your Facebook Page to start receiving messages through this pipeline.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Step 1: Facebook Login */}
                    {step === 'login' && (
                        <div className="text-center py-6">
                            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.896 1.396 5.453 3.577 7.227V22l3.555-1.95a11.738 11.738 0 002.868.35c5.523 0 10-4.145 10-9.243C22 6.145 17.523 2 12 2zm.998 12.536l-2.558-2.73-4.998 2.73 5.498-5.833 2.62 2.73 4.938-2.73-5.5 5.833z" />
                                </svg>
                            </div>

                            <h3 className="font-semibold text-lg mb-2">Connect Your Facebook Page</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                You'll be asked to select which Facebook Page you want to use for receiving messages.
                            </p>

                            {error && (
                                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            <Button
                                onClick={handleFacebookLogin}
                                disabled={!sdkLoaded}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                                {!sdkLoaded ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        Continue with Facebook
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Step 2: Page Selection */}
                    {step === 'selectPage' && (
                        <div className="py-4">
                            <h3 className="font-semibold text-lg mb-4">Select a Facebook Page</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Choose which page you want to connect:
                            </p>

                            {error && (
                                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            <RadioGroup value={selectedPageId} onValueChange={setSelectedPageId}>
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {pages.map((page) => (
                                        <div key={page.id} className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50">
                                            <RadioGroupItem value={page.id} id={page.id} />
                                            <Label htmlFor={page.id} className="flex-1 cursor-pointer">
                                                <div className="font-medium">{page.name}</div>
                                                <div className="text-xs text-gray-500">ID: {page.id}</div>
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </RadioGroup>

                            <div className="flex gap-3 mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => setStep('login')}
                                    className="flex-1"
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={handleConnectPage}
                                    disabled={!selectedPageId}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                >
                                    Connect Page
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Connecting */}
                    {step === 'connecting' && (
                        <div className="text-center py-6">
                            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                            <h3 className="font-semibold text-lg mb-2">Connecting...</h3>
                            <p className="text-sm text-gray-600">
                                Setting up your Messenger integration
                            </p>
                        </div>
                    )}

                    {/* Step 4: Success */}
                    {step === 'success' && (
                        <div className="text-center py-6">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Successfully Connected!</h3>
                            <p className="text-sm text-gray-600">
                                Your Facebook Page has been connected. Closing...
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MessengerConnectDialog;
