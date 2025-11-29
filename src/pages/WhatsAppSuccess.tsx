
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, X, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { db } from '@/lib/mock-db';

type PageState = 'checking' | 'success' | 'duplicate' | 'error';

interface Account {
  id: string;
  user_id: string;
  external_account_id: string;
  connector_account_identifier: string;
  connector_sender_provider_id: string;
  channel_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const WhatsAppSuccess = () => {
  const [searchParams] = useSearchParams();
  const [pageState, setPageState] = useState<PageState>('checking');
  const [session, setSession] = useState<any | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isDirectRedirect, setIsDirectRedirect] = useState<boolean>(false);
  const [parentNotified, setParentNotified] = useState<boolean>(false);

  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `${timestamp}: ${message} ${data ? JSON.stringify(data) : ''}`;
    console.log(message, data);
    setLogs(prev => [...prev, logMessage]);
  };

  // Get parameters from URL - prioritize webhook parameters
  const urlAccountId = searchParams.get('accountId') || searchParams.get('account_id');
  const urlPendingId = searchParams.get('pending_id');
  const urlStatus = searchParams.get('status');
  const connectionName = searchParams.get('connectionName') || searchParams.get('connection');
  const userId = searchParams.get('userId');

  // Determine the ID to use for database lookups (UUID)
  // If pending_id is present, it is definitely the UUID.
  // Otherwise, accountId might be the UUID (legacy) or External ID (if direct redirect without pending_id).
  const dbAccountId = urlPendingId || urlAccountId;

  useEffect(() => {
    addLog('🔍 Page Loaded. Params:', {
      urlAccountId,
      urlPendingId,
      dbAccountId,
      urlStatus,
      connectionName
    });

    // Check if this is a direct webhook redirect
    if (urlAccountId && urlStatus) {
      addLog('🎯 Direct webhook redirect detected - processing immediately');
      setIsDirectRedirect(true);
      handleDirectWebhookRedirect();
    } else {
      // Fallback to original authentication-required flow
      addLog('📋 No direct redirect parameters - using authentication flow');
      setIsDirectRedirect(false);
      initAuthentication();
    }
  }, [urlAccountId, urlStatus]);

  const handleDirectWebhookRedirect = () => {
    addLog('🚀 Processing direct webhook redirect');

    // Immediately notify parent window if available
    // Note: We use dbAccountId here if it's the UUID, otherwise we might be sending External ID
    // but the parent likely expects UUID. If we only have External ID, we might need to wait.
    if (window.opener && dbAccountId && !parentNotified) {
      addLog('📤 Immediately notifying parent window:', dbAccountId);
      window.opener.postMessage({
        type: 'WHATSAPP_CONNECTION_SUCCESS',
        accountId: dbAccountId
      }, '*');
      setParentNotified(true);
    }

    // Set phone number with masked value for immediate display
    setPhoneNumber('***-***-****');

    // Show appropriate state based on status
    if (urlStatus === 'duplicate') {
      addLog('⚠️ Duplicate connection detected');
      setPageState('duplicate');
    } else if (urlStatus === 'success') {
      addLog('🎉 Success connection detected');
      setPageState('success');

      // Auto-close after 3 seconds for success case
      setTimeout(() => {
        closeWindow();
      }, 3000);
    }

    // Start authentication in background to fetch detailed account info
    initAuthenticationInBackground();
  };

  const initAuthenticationInBackground = async () => {
    try {
      addLog('🔐 Starting background authentication for detailed account info');
      const { data } = await db.auth.getSession();
      addLog('📋 Background session check:', data.session?.user?.id);

      if (data.session?.user && dbAccountId) {
        fetchAccountDetails(data.session, dbAccountId);
      }

      setSession(data.session);
    } catch (error) {
      console.error('Error in background authentication:', error);
      addLog('❌ Error in background authentication', error);
      // Don't change UI state for background auth errors in direct redirect case
    }

    const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => {
      addLog('🔄 Background auth state changed:', session?.user?.id);
      setSession(session);

      if (session?.user && dbAccountId) {
        fetchAccountDetails(session, dbAccountId);
      }
    });

    return () => subscription.unsubscribe();
  };

  const initAuthentication = async () => {
    try {
      const { data } = await db.auth.getSession();
      addLog('📋 Initial session:', data.session?.user?.id);
      setSession(data.session);

      if (data.session?.user) {
        handleAuthenticatedUser(data.session);
      }
    } catch (error) {
      console.error('Error getting session:', error);
      addLog('❌ Error getting session', error);
      setTimeout(initAuthentication, 1000);
    }

    const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => {
      addLog('🔄 Auth state changed:', session?.user?.id);
      setSession(session);

      if (session?.user) {
        handleAuthenticatedUser(session);
      }
    });

    return () => subscription.unsubscribe();
  };

  const handleAuthenticatedUser = (userSession: any) => {
    if (dbAccountId) {
      addLog('🔄 ID provided - fetching details for:', dbAccountId);
      fetchAccountDetails(userSession, dbAccountId);
    } else if (connectionName) {
      addLog('🔄 Connection name provided - checking for account:', connectionName);
      checkAccountByConnectionName(userSession);
    } else {
      addLog('🔄 No specific parameters - checking for recent connections');
      checkForRecentConnection(userSession);
    }
  };

  const fetchAccountDetails = async (userSession: any, currentDbAccountId: string, retryCount = 0) => {
    if (!userSession?.user) return;

    addLog(`🔍 Fetching detailed account info - DB Account ID: ${currentDbAccountId} (Attempt: ${retryCount + 1})`);

    try {
      const { data: accountData } = await db.functions.invoke('unipile-check-connection', {
        body: { pendingId: currentDbAccountId, userId: userSession.user.id }
      });

      if (!accountData) {
        console.error('❌ Account not found or access denied');
        addLog('❌ Account not found or access denied');

        // If we are looking up by what we THOUGHT was a UUID (e.g. urlAccountId was passed as dbAccountId)
        // but it failed, and we have a separate urlPendingId, we should have used that.
        // But our logic above sets dbAccountId = urlPendingId || urlAccountId.
        // So if we are here, either the UUID is wrong, or the record doesn't exist yet (unlikely if we created it in step 1),
        // OR we are using External ID as dbAccountId because pending_id was missing (legacy flow).

        if (retryCount < 5) {
          addLog('⏳ Account not found yet, retrying in 2 seconds...');
          setTimeout(() => fetchAccountDetails(userSession, currentDbAccountId, retryCount + 1), 2000);
        } else {
          // Fallback: If we failed to find by ID, and we don't have a pending_id, maybe we can try check-connection
          // with the External ID directly?
          if (!urlPendingId && urlAccountId) {
            addLog('⚠️ DB lookup failed, trying check-connection with External ID directly...');
            const { data: checkData, error: checkError } = await db.functions.invoke('unipile-check-connection', {
              body: { accountId: urlAccountId }
            });
            if (!checkError && checkData?.status === 'active') {
              // Success!
              addLog('✅ Fallback check success:', checkData.account);
              setAccount(checkData.account);
              setPageState('success');
              return;
            } else {
              addLog('❌ Fallback check failed', checkError);
            }
          }
          setPageState('error');
        }
        return;
      }

      addLog('✅ Found detailed account info:', accountData);

      // Check if the account is still pending
      if (accountData.status === 'pending') {
        addLog('⏳ Account status is still pending, checking with Edge Function...');

        // Call the check-connection function to manually verify with Unipile
        // We pass:
        // accountId: The External ID from URL (urlAccountId) if available.
        // pendingId: The DB UUID (currentDbAccountId).
        const { data: checkData, error: checkError } = await db.functions.invoke('unipile-check-connection', {
          body: {
            accountId: urlAccountId, // External ID from Unipile
            pendingId: currentDbAccountId // Our DB UUID
          }
        });

        if (!checkError && checkData?.status === 'active') {
          addLog('✅ Edge function confirmed active status:', checkData.account);
          setAccount(checkData.account);
          const phone = checkData.account.connector_sender_provider_id?.replace('@s.whatsapp.net', '') || 'Unknown';
          setPhoneNumber(phone);
          setPageState('success');
          notifyParentWindow(checkData.account.id);
          setTimeout(() => closeWindow(), 3000);
          return;
        } else if (!checkError && checkData?.status === 'duplicate') {
          addLog('⚠️ Edge function detected duplicate:', checkData);
          setAccount(checkData.account);
          // Extract phone from result_metadata if available, otherwise from connector_sender_provider_id
          const duplicatePhone = checkData.account?.result_metadata?.phoneNumber ||
            checkData.account?.connector_sender_provider_id?.replace('@s.whatsapp.net', '') ||
            'Unknown';
          setPhoneNumber(duplicatePhone);
          setPageState('duplicate');
          return;
        } else {
          addLog('❌ Edge function check failed or still pending', { checkData, checkError });
        }

        if (retryCount < 3) { // Maximum 3 retries (6 seconds total)
          setTimeout(() => fetchAccountDetails(userSession, currentDbAccountId, retryCount + 1), 2000);
          return;
        } else {
          console.error('❌ Account stuck in pending state after 3 retries');
          addLog('❌ Account stuck in pending state after 3 retries');
          setPageState('error');
          return;
        }
      }

      setAccount(accountData);

      // Update phone number with real data
      const phone = accountData.connector_sender_provider_id?.replace('@s.whatsapp.net', '') || 'Unknown';
      setPhoneNumber(phone);

      // If we are here, status is likely active or something else valid
      if (accountData.status === 'active') {
        setPageState('success');
        notifyParentWindow(accountData.id);
        setTimeout(() => closeWindow(), 3000);
      } else if (accountData.status === 'duplicate') {
        setPageState('duplicate');
      }

    } catch (error) {
      console.error('❌ Error fetching detailed account info:', error);
      addLog('❌ Error fetching detailed account info', error);
      if (retryCount < 3) {
        setTimeout(() => fetchAccountDetails(userSession, currentDbAccountId, retryCount + 1), 2000);
      } else {
        setPageState('error');
      }
    }
  };

  const checkAccountByConnectionName = async (userSession: any) => {
    if (!userSession?.user || !connectionName) {
      console.error('❌ No session or connection name');
      addLog('❌ No session or connection name');
      setPageState('error');
      return;
    }

    addLog(`🔍 Checking for account by connection name: ${connectionName}`);

    try {
      const { data: accounts, error } = await db.functions.invoke('unipile-list-connections', {
        body: { userId: userSession.user.id, provider: 'WHATSAPP', connectionName }
      });

      if (error) {
        console.error('❌ Database error:', error);
        addLog('❌ Database error', error);
        throw error;
      }

      addLog('📋 Found accounts:', accounts);

      if (!accounts || accounts.length === 0) {
        addLog('❌ No account found for connection name - checking for recent connections');
        await checkForRecentConnection(userSession);
        return;
      }

      const foundAccount = accounts[0];
      addLog('✅ Found account via connection name:', foundAccount);
      handleFoundAccount(foundAccount, accounts.length > 1);

    } catch (error) {
      console.error('❌ Error checking account by connection name:', error);
      addLog('❌ Error checking account by connection name', error);
      setPageState('error');
    }
  };

  const checkForRecentConnection = async (userSession: any) => {
    if (!userSession?.user) {
      console.error('❌ No session available');
      addLog('❌ No session available');
      setPageState('error');
      return;
    }

    addLog('🔍 Checking for recent WhatsApp connections');

    try {
      // Look for WhatsApp accounts created in the last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const { data: recentAccounts, error } = await db.functions.invoke('unipile-list-recent-connections', {
        body: { userId: userSession.user.id, provider: 'WHATSAPP', since: fiveMinutesAgo }
      });

      if (error) {
        console.error('❌ Database error:', error);
        addLog('❌ Database error', error);
        throw error;
      }

      addLog('📋 Found recent accounts:', recentAccounts);

      if (!recentAccounts || recentAccounts.length === 0) {
        addLog('❌ No recent connections found');
        setPageState('error');
        return;
      }

      const mostRecentAccount = recentAccounts[0];
      addLog('✅ Found recent account:', mostRecentAccount);
      handleFoundAccount(mostRecentAccount, false);

    } catch (error) {
      console.error('❌ Error checking for recent connections:', error);
      addLog('❌ Error checking for recent connections', error);
      setPageState('error');
    }
  };

  const handleFoundAccount = (foundAccount: Account, isDuplicate: boolean) => {
    setAccount(foundAccount);

    // Extract phone number
    const phone = foundAccount.connector_sender_provider_id?.replace('@s.whatsapp.net', '') || 'Unknown';
    setPhoneNumber(phone);

    if (isDuplicate) {
      addLog('⚠️ Multiple accounts found - this might be a duplicate');
      setPageState('duplicate');
    } else {
      addLog('🎉 Single account found - setting success state');
      setPageState('success');

      // Notify parent window of successful connection
      notifyParentWindow(foundAccount.id);

      // Auto-close after 3 seconds
      setTimeout(() => {
        closeWindow();
      }, 3000);
    }
  };

  const notifyParentWindow = (accountId: string) => {
    if (window.opener && !parentNotified) {
      addLog('📤 Notifying parent window of success:', accountId);
      window.opener.postMessage({
        type: 'WHATSAPP_CONNECTION_SUCCESS',
        accountId: accountId
      }, '*');
      setParentNotified(true);
    } else {
      addLog('📤 Skipping parent notification - already notified or no opener');
    }
  };

  const closeWindow = async () => {
    // If we have a pending or duplicate record, delete it before closing
    if (account && (pageState === 'duplicate' || account.status === 'pending' || account.status === 'duplicate')) {
      addLog('🗑️ Cleaning up pending/duplicate record:', account.id);
      try {
        const { error } = await db.functions.invoke('unipile-delete-connection', { body: { id: account.id } });
        if (error) console.error('Failed to delete pending record:', error);
        else addLog('✅ Pending/duplicate record deleted');
      } catch (error) {
        console.error('Error deleting record:', error);
      }
    }

    // Notify parent to reset connection flow
    if (window.opener && pageState !== 'success') {
      addLog('📤 Notifying parent to reset connection flow');
      window.opener.postMessage({
        type: 'WHATSAPP_CONNECTION_CANCELLED',
      }, '*');
    }

    // Close the window
    if (window.opener) {
      window.close();
    } else {
      window.history.back();
    }
  };

  const renderContent = () => {
    switch (pageState) {
      case 'checking':
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Connecting WhatsApp...
            </h1>
            <p className="text-gray-600 mb-4">
              Setting up your WhatsApp Business account connection...
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This usually takes a few seconds
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              WhatsApp Connected Successfully!
            </h1>
            <p className="text-gray-600 mb-4">
              Your WhatsApp Business account is ready to use.
            </p>
            {account ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  <strong>Account:</strong> {account.connector_account_identifier}
                </p>
                <p className="text-sm text-green-800">
                  <strong>Phone:</strong> +{phoneNumber}
                </p>
                <p className="text-sm text-green-800">
                  <strong>Connected:</strong> {new Date(account.created_at).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  <strong>Phone:</strong> +{phoneNumber}
                </p>
                <p className="text-sm text-green-800">
                  <strong>Status:</strong> Successfully connected
                </p>
                {isDirectRedirect && (
                  <p className="text-xs text-green-600 mt-2">
                    Loading detailed account information...
                  </p>
                )}
              </div>
            )}
            <div className="space-y-3">
              <Button
                onClick={closeWindow}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Close This Window
              </Button>
              <p className="text-xs text-gray-500">
                You can now create pipelines with this account.
                <br />This window will close automatically in a few seconds.
              </p>
            </div>
          </div>
        );

      case 'duplicate':
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              WhatsApp Number Already Connected
            </h1>
            <p className="text-gray-600 mb-4">
              The WhatsApp number (+{phoneNumber}) is already connected to your account.
            </p>

            {account ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-2">
                  <AlertCircle className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="font-medium text-gray-700">Existing Connection</span>
                </div>
                <p className="text-sm text-gray-600">
                  Connected as: <span className="font-medium">{account.connector_account_identifier}</span>
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-2">
                  <AlertCircle className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="font-medium text-gray-700">Existing Connection</span>
                </div>
                <p className="text-sm text-gray-600">
                  This number is already connected to your account.
                </p>
                {isDirectRedirect && (
                  <p className="text-xs text-gray-500 mt-2">
                    Loading detailed account information...
                  </p>
                )}
              </div>
            )}

            <Button
              onClick={closeWindow}
              variant="outline"
              className="w-full"
            >
              Close This Window
            </Button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Connection Failed
            </h1>
            <p className="text-gray-600 mb-6">
              Could not establish your WhatsApp connection. This might be due to a timeout or sync issue.
            </p>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Try these steps:</strong><br />
                  • Check your pipelines page - the connection might already be there<br />
                  • Try connecting again if needed<br />
                  • Contact support if the issue persists
                </p>
              </div>

              <Button
                onClick={closeWindow}
                variant="outline"
                className="w-full"
              >
                Close This Window
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full mb-4">
        <CardContent className="p-8">
          {renderContent()}
        </CardContent>
      </Card>

      {/* Debug logs hidden for production */}
    </div>
  );
};

export default WhatsAppSuccess;
