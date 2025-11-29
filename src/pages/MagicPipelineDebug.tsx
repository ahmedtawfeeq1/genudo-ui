
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ModernLayout from "@/components/layout/ModernLayout";

const MagicPipelineDebug = () => {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Initializing...");

  useEffect(() => {
    try {
      setStatus("Component mounted successfully");
      console.log("✅ MagicPipeline Debug component loaded");
    } catch (error) {
      console.error("❌ Error in debug component:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    }
  }, []);

  if (error) {
    return (
      <ModernLayout title="Magic Pipeline Debug">
        <div className="h-full flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Detected</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout title="Magic Pipeline Debug">
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Debug Mode Active</h2>
          <p className="text-gray-600 mb-4">{status}</p>
          <p className="text-sm text-gray-500 mb-4">
            If you see this, the basic component structure is working.
          </p>
          <Button onClick={() => {
            console.log("Debug button clicked");
            setStatus("Button clicked successfully at " + new Date().toLocaleTimeString());
          }}>
            Test Button
          </Button>
        </div>
      </div>
    </ModernLayout>
  );
};

export default MagicPipelineDebug;
