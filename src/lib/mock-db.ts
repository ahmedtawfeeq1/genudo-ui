// THIS IS THE FINAL, ROBUST MOCK CLIENT
// It prevents the "getSession is not a function" error by defining a separate 'auth' object.

const mockUser = {
  id: "fake-user-123",
  email: "demo@example.com",
  user_metadata: { full_name: "Demo User" },
  aud: "authenticated",
  role: "authenticated"
};

const mockSession = {
  user: mockUser,
  access_token: "fake-jwt-token",
  refresh_token: "fake-refresh-token",
  expires_at: 9999999999,
};

// 1. Mock AUTH Module (Handles Login/Session calls perfectly)
const mockAuth = {
  // Directly implements the required function that was failing:
  getSession: () => Promise.resolve({ data: { session: mockSession }, error: null }),
  getUser: () => Promise.resolve({ data: { user: mockUser }, error: null }),
  onAuthStateChange: (callback: any) => {
    // Immediately call the callback to simulate a logged-in user loading instantly
    if (callback) callback('SIGNED_IN', mockSession);
    return { data: { subscription: { unsubscribe: () => {} } } };
  },
  signInWithPassword: () => Promise.resolve({ data: { session: mockSession, user: mockUser }, error: null }),
  signOut: () => Promise.resolve({ error: null }),
  signUp: () => Promise.resolve({ data: { user: mockUser }, error: null }),
} as any; 

// 2. Mock DATABASE/Table Module (Handles .from().select() chains)

const mockList = Array(5).fill(null).map((_, i) => ({
  id: i + 1,
  created_at: new Date().toISOString(),
  title: `Sample Item ${i + 1}`,
  name: `Demo Item ${i + 1}`,
  status: (i % 3 === 0) ? "pending" : "active",
  description: "This is fake data for UI preview.",
  user_id: mockUser.id
}));

const tableHandler = {
  get: (target: any, prop: string) => {
    // Handle Promises (await db.from('...').select())
    if (prop === 'then') {
      return (resolve: any) => resolve({ data: mockList, error: null });
    }
    
    // Allow chaining for all other functions (.eq, .order, .limit, etc.)
    return (...args: any[]) => {
      return new Proxy({}, tableHandler);
    };
  }
};

// Main Export Object structure (db.auth and db.from)
export const db = {
  // Expose the specific Auth mock
  auth: mockAuth,
  
  // Expose the database proxy for table calls
  from: (tableName: string) => {
    console.log(`[Mock DB] Intercepted table: ${tableName}`);
    return new Proxy({}, tableHandler);
  },
  
  // Expose an RPC/Function call proxy if needed
  rpc: (fnName: string) => {
    console.log(`[Mock DB] Intercepted RPC: ${fnName}`);
    return Promise.resolve({ data: mockList, error: null });
  }

} as any;
