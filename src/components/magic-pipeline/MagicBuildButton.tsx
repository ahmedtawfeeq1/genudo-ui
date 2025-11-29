import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Wand, 
  Database, 
  CheckCircle, 
  Loader2, 
  Bot, 
  Users, 
  Rocket,
  ArrowRight,
  Star,
  Zap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { db } from "@/lib/mock-db";
import type { WebhookResponse } from '@/utils/webhookConfig';

interface MagicBuildButtonProps {
  pipelineData: any;
  currentSessionId: string | null;
  businessNeeds?: string;
  onSuccess?: (pipelineId: string) => void;
  hasBuiltPipeline?: boolean;
  onBuildStateChange?: (isBuilding: boolean) => void;
}

interface BuildStep {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  color: string;
}

const WEBHOOK_URL = 'https://automation.loop-x.co/webhook/277f0200-df51-41d1-a044-1ddf7ed1be87';

const MagicBuildButton = ({
  pipelineData,
  currentSessionId,
  businessNeeds = 'Pipeline creation via Magic Build',
  onSuccess,
  hasBuiltPipeline = false,
  onBuildStateChange
}: MagicBuildButtonProps) => {
  const { user } = useAuth();
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [pipelineBuiltSuccessfully, setPipelineBuiltSuccessfully] = useState(hasBuiltPipeline);
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([
    {
      id: 'prepare',
      name: 'Preparing your Sales Pipeline',
      description: 'Analyzing your business requirements...',
      icon: Database,
      completed: false,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'agents',
      name: 'Building your Sales Agents',
      description: 'Creating intelligent AI agents...',
      icon: Bot,
      completed: false,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'assign',
      name: 'Assigning Agents to Stages',
      description: 'Optimizing workflow assignments...',
      icon: Users,
      completed: false,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'launch',
      name: 'Launching Your Sales Pipeline!',
      description: 'Deploying to automation system...',
      icon: Rocket,
      completed: false,
      color: 'from-orange-500 to-red-500'
    }
  ]);

  // Notify parent of building state changes
  useEffect(() => {
    if (onBuildStateChange) {
      onBuildStateChange(isBuilding);
    }
  }, [isBuilding, onBuildStateChange]);

  // Update pipeline built state when hasBuiltPipeline prop changes
  useEffect(() => {
    setPipelineBuiltSuccessfully(hasBuiltPipeline);
  }, [hasBuiltPipeline]);

  const createParticles = () => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100
    }));
    setParticles(newParticles);
  };

  const animateStep = async (stepIndex: number): Promise<void> => {
    return new Promise((resolve) => {
      const startProgress = stepIndex * 25;
      const endProgress = (stepIndex + 1) * 25;
      let currentProgress = startProgress;
      
      const progressInterval = setInterval(() => {
        currentProgress += 1.5;
        setBuildProgress(Math.min(currentProgress, endProgress));
        
        if (currentProgress >= endProgress) {
          clearInterval(progressInterval);
          setBuildSteps(prev => prev.map((step, idx) => 
            idx === stepIndex ? { ...step, completed: true } : step
          ));
          resolve();
        }
      }, 30);
    });
  };

  const sendToWebhook = async (webhookPayload: any): Promise<WebhookResponse> => {
    try {
      console.log('🚀 Sending pipeline data to webhook:', WEBHOOK_URL);
      console.log('📦 Payload:', webhookPayload);

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Webhook error response:', errorText);
        throw new Error(`Webhook failed with status: ${response.status}`);
      }

      const responseData: WebhookResponse = await response.json();
      console.log('✅ Webhook response received:', responseData);
      
      return responseData;
    } catch (error) {
      console.error('❌ Error sending to webhook:', error);
      throw new Error(`Failed to send to automation system: ${error}`);
    }
  };

  // Class: SessionUpdater
  // Purpose: Update session's pipeline_id in static UI mode without backend.
  // TODO: Replace with backend API call when available.
  const updateSessionPipelineIdStatic = async (
    sessionId: string,
    pipelineId: string,
    userId: string
  ) => {
    await new Promise(res => setTimeout(res, 150));
    console.log('✅ [Static] Updated session with pipeline_id:', { sessionId, pipelineId, userId });
    return true;
  };

  const handleMagicBuild = async () => {
    if (!pipelineData || !user || !currentSessionId) {
      toast({
        title: "Error",
        description: "Missing required data for pipeline creation.",
        variant: "destructive"
      });
      return;
    }

    // If pipeline already built, treat as "View Pipeline" button
    if (pipelineBuiltSuccessfully && onSuccess) {
      onSuccess('');
      return;
    }

    try {
      setIsBuilding(true);
      setBuildProgress(0);
      setCurrentStep(0);
      setShowCelebration(false);

      setBuildSteps(prev => prev.map(step => ({ ...step, completed: false })));

      setCurrentStep(0);
      await animateStep(0);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setCurrentStep(1);
      await animateStep(1);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCurrentStep(2);
      await animateStep(2);
      await new Promise(resolve => setTimeout(resolve, 800));

      setCurrentStep(3);
      await animateStep(3);

      const webhookPayload = {
        flow_status: 'new_pipeline' as const,
        json_result: pipelineData,
        session_id: currentSessionId,
        user_id: user.id,
        business_needs: businessNeeds
      };
      
      const webhookResponse = await sendToWebhook(webhookPayload);
      
      setBuildProgress(100);
      
      createParticles();
      setShowCelebration(true);
      setPipelineBuiltSuccessfully(true); // Mark pipeline as built

      toast({
        title: "🎉 Sales Pipeline Created Successfully!",
        description: `Your pipeline "${pipelineData.pipeline.pipeline_name}" is now live and ready to convert leads!`
      });

      // Update session with pipeline_id (static)
      if (webhookResponse.success && webhookResponse.pipeline_id && currentSessionId) {
        await updateSessionPipelineIdStatic(currentSessionId, webhookResponse.pipeline_id, user.id);
      }

      if (webhookResponse.success && webhookResponse.pipeline_id && onSuccess) {
        setTimeout(() => {
          onSuccess(webhookResponse.pipeline_id);
        }, 2000);
      }

    } catch (error) {
      console.error('Error building pipeline:', error);
      toast({
        title: "Build Failed",
        description: String(error) || "Failed to create pipeline. Please try again.",
        variant: "destructive"
      });
      
      setTimeout(() => {
        setIsBuilding(false);
        setBuildProgress(0);
        setCurrentStep(0);
        setShowCelebration(false);
        setBuildSteps(prev => prev.map(step => ({ ...step, completed: false })));
        // DON'T reset pipelineBuiltSuccessfully - keep it true!
      }, 1000);
    }
  };

  if (!pipelineData) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes shimmer-custom {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        
        @keyframes gradient-custom {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes particle-custom {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-100px) scale(0); opacity: 0; }
        }
        
        @keyframes spin-slow-custom {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-shimmer-custom {
          animation: shimmer-custom 2s infinite;
        }
        
        .animate-gradient-custom {
          background-size: 200% 200%;
          animation: gradient-custom 3s ease infinite;
        }
        
        .animate-particle-custom {
          animation: particle-custom 2s linear infinite;
        }
        
        .animate-spin-slow-custom {
          animation: spin-slow-custom 3s linear infinite;
        }
      `}</style>

      <div className="space-y-4 relative">
        {/* FIXED: Button with double width */}
        <div className="relative max-w-2xl mx-auto">
          <Button
            onClick={handleMagicBuild}
            disabled={isBuilding}
            className={`
              w-full max-w-2xl relative overflow-hidden text-white shadow-2xl hover:shadow-3xl 
              transition-all duration-300 hover:scale-[1.02]
              ${isBuilding 
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-pulse' 
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
              }
            `}
            size="lg"
          >
            {isBuilding && (
              <div className="absolute inset-0 rounded-lg">
                <div className="absolute inset-0 rounded-lg animate-spin bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50"></div>
              </div>
            )}
            
            <div className="relative z-10 flex items-center gap-2">
              {isBuilding ? (
                <>
                  <div className="relative">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <span className="font-semibold text-sm">Building Magic...</span>
                </>
              ) : pipelineBuiltSuccessfully ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span className="font-semibold text-sm">View Sales Pipeline</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span className="font-semibold text-sm">Magic Build!</span>
                  <Wand className="w-4 h-4" />
                </>
              )}
            </div>

            {!isBuilding && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer-custom"></div>
            )}
          </Button>
        </div>

        {isBuilding && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 border border-white/20 backdrop-blur-sm shadow-2xl w-full max-w-7xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5 animate-gradient-custom"></div>
            
            <div className="relative z-10 p-8 space-y-6">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-6 h-6 text-purple-600 animate-pulse" />
                  <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Building Your Sales Empire
                  </h3>
                  <Zap className="w-6 h-6 text-purple-600 animate-pulse" />
                </div>
                <div className="flex items-center justify-between text-sm font-medium">
                  <span className="text-gray-700">Overall Progress</span>
                  <span className="text-purple-600 font-bold">{Math.round(buildProgress)}%</span>
                </div>
                
                <div className="relative">
                  <Progress value={buildProgress} className="h-3 bg-gray-200" />
                  <div 
                    className="absolute top-0 left-0 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300 shadow-lg"
                    style={{ width: `${buildProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* FIXED: Process steps on LEFT, Summary card on RIGHT */}
              <div className="flex gap-8 items-start">
                <div className="flex-[3] space-y-3 min-w-[500px]">
                  {buildSteps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isActive = index === currentStep;
                    const isCompleted = step.completed;
                    
                    return (
                      <div 
                        key={step.id} 
                        className={`
                          relative flex items-center gap-3 p-3 rounded-lg transition-all duration-500 transform
                          ${isActive ? 'bg-white shadow-lg scale-105 border-2 border-purple-200' : 
                            isCompleted ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' : 
                            'bg-white/50 border border-gray-200'
                          }
                        `}
                      >
                        <div className={`
                          relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                          ${isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg' :
                            isActive ? `bg-gradient-to-r ${step.color} shadow-lg` : 
                            'bg-gray-200'
                          }
                        `}>
                          {isActive && (
                            <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-purple-400 to-blue-400 animate-spin-slow-custom">
                              <div className="absolute inset-1 rounded-full bg-white"></div>
                            </div>
                          )}
                          
                          <div className="relative z-10">
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-white" />
                            ) : isActive ? (
                              <StepIcon className="w-5 h-5 text-white animate-pulse" />
                            ) : (
                              <StepIcon className="w-5 h-5 text-gray-500" />
                            )}
                          </div>

                          {isActive && (
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 animate-ping opacity-20"></div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className={`
                            text-base font-semibold transition-colors duration-300
                            ${isCompleted ? 'text-green-700' :
                              isActive ? 'text-gray-900' : 'text-gray-600'
                            }
                          `}>
                            {step.name}
                          </div>
                          {isActive && (
                            <div className="text-sm text-gray-600 animate-pulse mt-1">
                              {step.description}
                            </div>
                          )}
                        </div>

                        <div className="flex-shrink-0">
                          {isCompleted && (
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Complete
                            </Badge>
                          )}
                          {isActive && !isCompleted && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-purple-600 font-medium">Processing...</span>
                            </div>
                          )}
                        </div>

                        {isCompleted && (
                          <div className="absolute -top-1 -right-1">
                            <Sparkles className="w-3 h-3 text-yellow-400 animate-bounce" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* FIXED: Celebration card positioned on the RIGHT - NOW CLICKABLE */}
                {showCelebration && (
                  <div 
                    onClick={() => {
                      if (onSuccess) {
                        onSuccess(''); // This will trigger navigation to pipeline
                      }
                    }}
                    className="flex-[2] min-w-[350px] max-w-[400px] relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-6 text-white shadow-2xl cursor-pointer hover:scale-105 transition-transform duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 animate-shimmer-custom"></div>
                    <div className="relative z-10 text-center space-y-4">
                      <div className="flex items-center justify-center">
                        <Rocket className="w-12 h-12 animate-bounce" />
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="text-2xl font-bold">Congratulations!</h3>
                        <p className="text-green-100 text-lg font-medium">Your Sales Pipeline is Ready</p>
                        
                        {/* ADDED: Click to view instruction */}
                        <div className="mt-4 p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                          <p className="text-white text-sm font-semibold flex items-center justify-center gap-2">
                            <span>👆 Click here to view your pipeline</span>
                            <ArrowRight className="w-4 h-4 animate-pulse" />
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* ADDED: Hover effect overlay */}
                    <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  </div>
                )}
              </div>

              {showCelebration && particles.slice(0, 8).map((particle) => (
                <div
                  key={particle.id}
                  className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full animate-particle-custom"
                  style={{
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                    animationDelay: `${particle.id * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MagicBuildButton;
export type { MagicBuildButtonProps };
