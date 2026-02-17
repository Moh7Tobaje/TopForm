'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useProgressData } from '@/hooks/useProgressData'
import { useLanguage } from '@/contexts/LanguageContext'
import { 
  Flame, 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar, 
  Dumbbell, 
  Apple, 
  Brain,
  Star,
  Award,
  Zap,
  Activity,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

export default function ProgressPage() {
  const { t, isRTL } = useLanguage()
  const {
    progressData,
    personalRecords,
    aiInsights,
    realTimeInsights,
    metadata,
    loading,
    error,
    timeRange,
    setTimeRange,
    refreshData,
    syncWorkoutData,
    syncNutritionData,
    markInsightAsRead,
    bookmarkInsight,
    forceRealTimeUpdate
  } = useProgressData()

  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true)

  // Auto-sync with workout and nutrition pages
  useEffect(() => {
    const handleWorkoutUpdate = (event: CustomEvent) => {
      syncWorkoutData(event.detail)
    }

    const handleNutritionUpdate = (event: CustomEvent) => {
      syncNutritionData(event.detail)
    }

    window.addEventListener('workoutDataUpdate', handleWorkoutUpdate as EventListener)
    window.addEventListener('nutritionDataUpdate', handleNutritionUpdate as EventListener)

    return () => {
      window.removeEventListener('workoutDataUpdate', handleWorkoutUpdate as EventListener)
      window.removeEventListener('nutritionDataUpdate', handleNutritionUpdate as EventListener)
    }
  }, [syncWorkoutData, syncNutritionData])

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-purple-500'
    if (streak >= 14) return 'text-orange-500'
    if (streak >= 7) return 'text-yellow-500'
    if (streak >= 3) return 'text-green-500'
    return 'text-gray-500'
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500'
    if (score >= 70) return 'text-yellow-500'
    if (score >= 50) return 'text-orange-500'
    return 'text-red-500'
  }

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="w-5 h-5 text-yellow-500" />
      case 'warning': return <Zap className="w-5 h-5 text-orange-500" />
      case 'recommendation': return <Brain className="w-5 h-5 text-blue-500" />
      case 'motivation': return <Star className="w-5 h-5 text-purple-500" />
      default: return <Activity className="w-5 h-5 text-gray-500" />
    }
  }

  const handleInsightClick = async (insight: any) => {
    if (!insight.isRead) {
      await markInsightAsRead(insight.id)
    }
  }

  const handleBookmarkToggle = async (insightId: number, currentBookmark: boolean) => {
    await bookmarkInsight(insightId, !currentBookmark)
  }

  const handleForceRefresh = async () => {
    await forceRealTimeUpdate()
  }

  // Loading state
  if (loading && !progressData) {
    return (
      <div className="min-h-screen circuit-pattern-dense bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-card rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-card rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !progressData) {
    return (
      <div className="min-h-screen circuit-pattern-dense bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto border-red-500">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">{t('progress.connectionError')}</h2>
              <p className="text-gray-400 mb-6">{error}</p>
              <div className={`flex gap-4 justify-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Button onClick={refreshData} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  {t('progress.retry')}
                </Button>
                <Button variant="outline" onClick={handleForceRefresh}>
                  {t('progress.forceUpdate')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen circuit-pattern-dense bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Header with Real-time Status */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
            <h1 className={`text-4xl font-bold text-white mb-2 flex items-center ${isRTL ? 'flex-row-reverse' : ''} gap-3`}>
              <span className="bg-gradient-to-r from-[#e3372e] to-[#cc2e2f] bg-clip-text text-transparent">{t('progress.title')}</span>
              {isRealTimeEnabled ? (
                <Wifi className="w-6 h-6 text-green-500" />
              ) : (
                <WifiOff className="w-6 h-6 text-gray-500" />
              )}
            </h1>
            <p className={`text-gray-400 ${isRTL ? 'text-right' : 'text-left'} max-w-2xl`}>
              {t('progress.subtitle')}
              {metadata && (
                <span className="mx-2 text-xs">
                  • {t('progress.dataFreshness')}: {new Date(metadata.dataFreshness).toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US')}
                </span>
              )}
            </p>
          </div>
          <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Time Range Selector */}
            {(['7d', '30d', '90d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === '7d' ? t('progress.days7') : range === '30d' ? t('progress.days30') : t('progress.days90')}
              </Button>
            ))}
            
            {/* Real-time Controls */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
            >
              {isRealTimeEnabled ? t('progress.disableRealtime') : t('progress.enableRealtime')}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleForceRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Real-time Insights Alert */}
        {realTimeInsights.length > 0 && (
          <Card className="gradient-red-gray border-border shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className={`text-lg text-white flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className={isRTL ? 'text-right' : 'text-left'}>{t('progress.liveInsights')}</span>
                <Badge variant="secondary" className="text-xs">
                  {realTimeInsights.length} {t('progress.new')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {realTimeInsights.map((insight) => (
                  <div key={insight.id} className={`flex items-start gap-3 p-3 bg-background/50 rounded border border-border ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="mt-1">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{insight.title}</h4>
                      <p className="text-gray-300 text-sm">{insight.message}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {t('progress.live')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Dashboard Section - Reordered for RTL/LTR */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Today's Summary - First Card */}
          <Card 
            className="gradient-red-gray border-border shadow-lg"
            style={{ order: isRTL ? 4 : 1 }}
          >
            <CardHeader className="pb-3">
              <CardTitle className={`text-lg text-white flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="p-2 bg-white/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className={`font-bold ${isRTL ? 'text-right' : 'text-left'}`}>{t('progress.todaysSummary')}</span>
                {progressData?.activeToday && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`grid grid-cols-2 gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className="text-2xl font-bold text-white">{progressData?.todayWorkouts || 0}</div>
                  <div className="text-xs text-gray-400">{t('progress.workouts')}</div>
                </div>
                <div className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className="text-2xl font-bold text-white">{progressData?.todayExercises || 0}</div>
                  <div className="text-xs text-gray-400">{t('progress.exercises')}</div>
                </div>
                <div className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className="text-2xl font-bold text-white">{progressData?.todayCalories || 0}</div>
                  <div className="text-xs text-gray-400">{t('progress.calories')}</div>
                </div>
                <div className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className="text-2xl font-bold text-white">{progressData?.todayProtein || 0}g</div>
                  <div className="text-xs text-gray-400">{t('progress.protein')}</div>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-700">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-sm font-medium text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>{t('progress.dayScore')}</span>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className={`text-lg font-bold ${getScoreColor(progressData?.todayScore || 0)}`}>
                      {progressData?.todayScore || 0}/100
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#e3372e] to-[#cc2e2f] flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{Math.round((progressData?.todayScore || 0) / 10)}%</span>
                    </div>
                  </div>
                </div>
                <Progress 
                  value={progressData?.todayScore || 0} 
                  className="mt-2 h-2"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
            </CardContent>
          </Card>

          {/* Activity Streak - Second Card */}
          <Card 
            className="gradient-dark-gray border-border shadow-lg"
            style={{ order: isRTL ? 3 : 2 }}
          >
            <CardHeader className="pb-3">
              <CardTitle className={`text-lg text-white flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="p-2 bg-white/10 rounded-lg">
                  <Flame className="w-5 h-5 text-[#e3372e]" />
                </div>
                <span className={`font-bold ${isRTL ? 'text-right' : 'text-left'}`}>{t('progress.activityStreak')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className={`text-4xl font-bold ${getStreakColor(progressData?.currentStreak || 0)}`}>
                  {progressData?.currentStreak || 0}
                </div>
                <div className="text-sm text-gray-400">{t('progress.currentStreak')} 🔥</div>
              </div>
              <div className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className="text-xl font-semibold text-white">
                  {progressData?.longestStreak || 0}
                </div>
                <div className="text-xs text-gray-400">{t('progress.longestStreak')}</div>
              </div>
              <div className="flex justify-center gap-1">
                {[...Array(Math.min(7, progressData?.currentStreak || 0))].map((_, i) => (
                  <Flame key={i} className="w-4 h-4 text-orange-500" />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Macros - Third Card */}
          <Card 
            className="gradient-red-gray border-border shadow-lg"
            style={{ order: isRTL ? 2 : 3 }}
          >
            <CardHeader className="pb-3">
              <CardTitle className={`text-lg text-white flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="p-2 bg-white/10 rounded-lg">
                  <Apple className="w-5 h-5 text-white" />
                </div>
                <span className={`font-bold ${isRTL ? 'text-right' : 'text-left'}`}>{timeRange === '7d' ? t('progress.days7') : timeRange === '30d' ? t('progress.days30') : t('progress.days90')} {t('progress.macros')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className={`flex justify-between text-sm mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`font-medium text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>{t('progress.totalCalories')}</span>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-white font-medium">{progressData?.totalConsumedCalories || 0}</span>
                    <span className="text-gray-500">/</span>
                    <span className="text-gray-400">{progressData?.totalTargetCalories || 0}</span>
                  </div>
                </div>
                <Progress 
                  value={progressData?.calorieCompliance || 0} 
                  className="h-2"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              <div>
                <div className={`flex justify-between text-sm mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`font-medium text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>{t('progress.totalProtein')}</span>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-white font-medium">{progressData?.totalConsumedProtein || 0}g</span>
                    <span className="text-gray-500">/</span>
                    <span className="text-gray-400">{progressData?.totalTargetProtein || 0}g</span>
                  </div>
                </div>
                <Progress 
                  value={progressData?.proteinCompliance || 0} 
                  className="h-2"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              <div className="pt-2 border-t border-gray-700">
                <div className={`text-xs text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('progress.compliance')}: {Math.round(progressData?.calorieCompliance || 0)}% {t('progress.totalCalories')}, {Math.round(progressData?.proteinCompliance || 0)}% {t('progress.totalProtein')}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats - Fourth Card */}
          <Card 
            className="gradient-dark-gray border-border shadow-lg"
            style={{ order: isRTL ? 1 : 4 }}
          >
            <CardHeader className="pb-3">
              <CardTitle className={`text-lg text-white flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="p-2 bg-white/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-[#e3372e]" />
                </div>
                <span className={`font-bold ${isRTL ? 'text-right' : 'text-left'}`}>{t('progress.quickStats')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className={`font-medium text-sm text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>{t('progress.newPRs')}</span>
                <Badge variant="secondary" className="text-yellow-400 px-3 py-1">
                  {progressData?.recentPRsCount || 0}
                </Badge>
              </div>
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className={`font-medium text-sm text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>{t('progress.aiInsights')}</span>
                <Badge variant="secondary" className="text-blue-400 px-3 py-1">
                  {progressData?.unreadInsightsCount || 0}
                </Badge>
              </div>
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className={`font-medium text-sm text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>{t('progress.milestones')}</span>
                <Badge variant="secondary" className="text-green-400 px-3 py-1">
                  {progressData?.achievedMilestonesCount || 0}
                </Badge>
              </div>
              {metadata && (
                <div className="pt-2 border-t border-gray-700">
                  <div className={`text-xs text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('progress.workoutFrequency')}: {metadata.workoutFrequency}/{t('progress.perWeek')}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Personal Records Section */}
        <Card className="gradient-red-gray border-border shadow-lg">
          <CardHeader>
            <CardTitle className={`text-xl text-white flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-2 bg-white/10 rounded-lg">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <span className={`font-bold ${isRTL ? 'text-right' : 'text-left'}`}>{t('progress.personalRecords')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {personalRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className={isRTL ? 'text-right' : 'text-left'}>{t('progress.noPRs')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personalRecords.map((record) => (
                  <div key={record.id} className="gradient-dark-gray rounded-lg p-4 border border-border">
                    <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <h3 className={`font-semibold text-white ${isRTL ? 'text-right ml-2' : 'text-left'}`}>{record.exerciseName}</h3>
                      <Badge variant="outline" className="text-[#e3372e] border-[#e3372e] px-3 py-1">
                        {record.type === 'weight' ? t('progress.weight') : 
                         record.type === 'reps' ? t('progress.reps') : 
                         record.type === 'volume' ? t('progress.volume') : t('progress.time')}
                      </Badge>
                    </div>
                    <div className="text-center mb-3">
                      <div className="text-2xl font-bold text-white mb-1">
                        {record.type === 'weight' ? `${record.value}kg` :
                         record.type === 'reps' ? `${record.value} ${t('progress.reps')}` :
                         record.type === 'volume' ? `${record.value} kg·${t('progress.reps')}` :
                         `${record.value}s`}
                      </div>
                      <div className="w-12 h-1 bg-gradient-to-r from-[#e3372e] to-[#cc2e2f] mx-auto rounded-full"></div>
                    </div>
                    <div className={`text-xs text-gray-400 text-center ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('progress.setOn')} {new Date(record.date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced AI Insights Section */}
        <Card className="gradient-dark-gray border-border shadow-lg">
          <CardHeader>
            <CardTitle className={`text-xl text-white flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-2 bg-white/10 rounded-lg">
                <Brain className="w-6 h-6 text-[#e3372e]" />
              </div>
              <span className={`font-bold ${isRTL ? 'text-right' : 'text-left'}`}>{t('progress.aiInsights')}</span>
              {aiInsights.some(i => !i.isRead) && (
                <Badge variant="secondary" className="text-xs">
                  {aiInsights.filter(i => !i.isRead).length} {t('progress.unread')}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aiInsights.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className={isRTL ? 'text-right' : 'text-left'}>{t('progress.aiAnalyzing')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {aiInsights.map((insight) => (
                  <div 
                    key={insight.id} 
                    className={`gradient-red-gray rounded-lg p-4 border border-border cursor-pointer transition-all ${
                      !insight.isRead ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleInsightClick(insight)}
                  >
                    <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="mt-1">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <div className={`flex items-center justify-between mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <h3 className={`font-semibold text-white ${isRTL ? 'text-right ml-2' : 'text-left'}`}>{insight.title}</h3>
                          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            {!insight.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleBookmarkToggle(insight.id, insight.isBookmarked)
                              }}
                              className="p-1 h-auto hover:bg-white/10"
                            >
                              <Star className={`w-4 h-4 ${insight.isBookmarked ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`} />
                            </Button>
                          </div>
                        </div>
                        <p className={`text-gray-300 text-sm mb-2 ${isRTL ? 'text-right' : 'text-left'} leading-relaxed`}>{insight.message}</p>
                          {insight.actionableAdvice && (
                            <div className={`bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-3 text-xs text-white border border-white/20 ${isRTL ? 'text-right' : 'text-left'}`}>
                              <div className={`flex items-start gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <span className="text-yellow-400 text-lg">💡</span>
                                <span>{insight.actionableAdvice}</span>
                              </div>
                            </div>
                          )}
                        <div className={`flex items-center justify-between mt-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Badge variant="outline" className="text-xs">
                            {insight.category}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {new Date(insight.generatedAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Status Footer */}
        {metadata && (
          <div className={`text-center text-xs text-gray-500 pt-4 border-t border-gray-800`}>
            <div className={`flex items-center justify-center gap-4 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className={isRTL ? 'text-right' : 'text-left'}>{t('progress.dataFreshness')}: {new Date(metadata.dataFreshness).toLocaleString(isRTL ? 'ar-SA' : 'en-US')}</span>
              <span>•</span>
              <span className={isRTL ? 'text-right' : 'text-left'}>{t('progress.workoutFrequency')}: {metadata.workoutFrequency}/{t('progress.perWeek')}</span>
              <span>•</span>
              <span className={isRTL ? 'text-right' : 'text-left'}>{t('progress.nutritionTracking')}: {metadata.nutritionTrackingDays} {t('progress.days')}</span>
              {Object.values(metadata.errors).some(Boolean) && (
                <>
                  <span>•</span>
                  <span className="text-yellow-500">{t('progress.dataIncomplete')}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
