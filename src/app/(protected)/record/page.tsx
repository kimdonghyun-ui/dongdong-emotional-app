'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { AppShell } from '@/components/app-shell'
import { EmotionIcon } from '@/components/emotion-icon'
import { IntensitySelector } from '@/components/intensity-selector'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useEmotionStore } from "@/store/emotionStore";
import { EMOTION_MAP } from '@/constants/emotion';
import { EmotionType } from '@/type'


type Step = 'emotion' | 'intensity' | 'note'

export default function RecordPage() {
  /* hooks */
  const router = useRouter();

  /* store actions */
  const createRecord = useEmotionStore((s) => s.createRecord);

  /* local state */
  const [step, setStep] = useState<Step>('emotion'); //현재 스텝('emotion' | 'intensity' | 'note')
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null); // 내 감정 넣을 state
  const [intensity, setIntensity] = useState(3); // 감정 강도 1 ~ 5 넣을 state
  const [content, setContent] = useState(''); // 메모
  const [isSaving, setIsSaving] = useState(false);

  /* derived state */
  const hasContent = content.trim().length > 0;

  const progress =
    step === 'emotion'
      ? 33
      : step === 'intensity'
      ? 66
      : 100;

  /* handlers */
  const handleEmotionSelect = (emotion: EmotionType) => {
    setSelectedEmotion(emotion);
  };

  const handleNext = () => {
    if (step === 'emotion' && selectedEmotion) {
      setStep('intensity')
    } else if (step === 'intensity') {
      setStep('note')
    }
  }

  const handleBack = () => {
    if (step === 'intensity') {
      setStep('emotion')
    } else if (step === 'note') {
      setStep('intensity')
    }
  }

  const handleSave = async () => {
    if (!selectedEmotion) return

    setIsSaving(true)
    try {
      const record = await createRecord({
        emotion: selectedEmotion,
        intensity,
        content: content.trim(),
      })
      toast.success('감정이 기록되었어요')
      router.push(`/records/${record.documentId}`)
    } catch {
      toast.error('저장에 실패했어요. 다시 시도해주세요.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AppShell hideNav>
      <div className="flex min-h-screen flex-col p-4">
        {/* Header */}
        <header className="flex items-center gap-4 pb-4">
          {step === 'emotion' ? (
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </header>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {step === 'emotion' && (
            <div className="flex-1 flex flex-col">
              <div className="space-y-2 mb-8">
                <h1 className="text-2xl font-bold">지금 기분이 어떠세요?</h1>
                <p className="text-muted-foreground">가장 가까운 감정을 선택해주세요</p>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mb-8">
                {Object.values(EMOTION_MAP).map((emotion) => (
                  <EmotionIcon
                    key={emotion.type}
                    emotion={emotion.type}
                    size="md"
                    showLabel
                    selected={selectedEmotion === emotion.type}
                    onClick={() => handleEmotionSelect(emotion.type)}
                  />
                ))}
              </div>

              <div className="mt-auto">
                <Button
                  className="w-full h-12 text-base"
                  disabled={!selectedEmotion}
                  onClick={handleNext}
                >
                  다음
                </Button>
              </div>
            </div>
          )}

          {step === 'intensity' && selectedEmotion && (
            <div className="flex-1 flex flex-col">
              <div className="space-y-2 mb-8">
                <h1 className="text-2xl font-bold">얼마나 강하게 느끼시나요?</h1>
                <p className="text-muted-foreground">감정의 강도를 선택해주세요</p>
              </div>

              <Card className="mb-8">
                <CardContent className="py-6 flex justify-center">
                  <EmotionIcon
                    emotion={selectedEmotion}
                    size="xl"
                    showLabel
                    selected
                  />
                </CardContent>
              </Card>

              <IntensitySelector
                value={intensity}
                onChange={setIntensity}
                className="mb-8"
              />

              <div className="mt-auto">
                <Button
                  className="w-full h-12 text-base"
                  onClick={handleNext}
                >
                  다음
                </Button>
              </div>
            </div>
          )}

          {step === 'note' && selectedEmotion && (
            <div className="flex-1 flex flex-col">
              <div className="space-y-2 mb-6">
                <h1 className="text-2xl font-bold">메모를 남겨보세요</h1>
                <p className="text-muted-foreground">이 감정을 느끼게 된 이유나 상황을 적어주세요 (선택)</p>
              </div>

              <Card className="mb-6">
                <CardContent className="py-4 flex items-center gap-4">
                  <EmotionIcon
                    emotion={selectedEmotion}
                    size="md"
                    selected
                  />
                  <div>
                    <p className="font-semibold">
                      {EMOTION_MAP[selectedEmotion]?.labelKo}
                      {/* {EMOTIONS.find(e => e.type === selectedEmotion)?.labelKo} */}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      강도: {intensity}/5
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Textarea
                placeholder="무슨 일이 있었나요? 어떤 생각이 드셨나요?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-32 resize-none mb-6"
              />

              <div className="mt-auto space-y-3">
                <Button
                  className="w-full h-12 text-base"
                  onClick={handleSave}
                  disabled={isSaving || !hasContent}
                >
                  {isSaving ? (
                    '저장 중...'
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      기록 완료
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  메모 없이 저장하기
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
