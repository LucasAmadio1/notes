import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from 'sonner'

interface newNoteCardProps {
  onNoteCreated: (content: string) => void
}

let speechRecognition: SpeechRecognition | null = null

export function NewNoteCard({ onNoteCreated }: newNoteCardProps ) {
    const [shouldShowOnBoarding, setShouldOnBoarding] = useState(true)
    const [content, setContent] = useState('')
    const [isRecording, setIsRecording] = useState(false)

    function handleStartEditor() {
      setShouldOnBoarding(false)
    }
    
    function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>) {
      setContent(event.target.value)

      if (event.target.value === '') {
        setShouldOnBoarding(true)
      }
    }

    function handleSaveNote(event: FormEvent) {
      event.preventDefault()

      if (content === '') {
        return toast.error('Não é possivel criar nota sem  conteúdo')
      }

      onNoteCreated(content)

      setContent('')
      setShouldOnBoarding(true)

      toast.success('Nota criada com sucesso!')
    }

    function handleStartRecording() {
      const isSpeechRecognitionAPIAvaible = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

      if (!isSpeechRecognitionAPIAvaible) {
        return toast.error('Infelizmente seu navegador não suporte a API de gravação')
      }

      setIsRecording(true)
      setShouldOnBoarding(false)

      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

      speechRecognition = new SpeechRecognitionAPI()

      speechRecognition.lang = 'pt-BR'
      speechRecognition.continuous = true
      speechRecognition.maxAlternatives = 1
      speechRecognition.interimResults = true

      speechRecognition.onresult = (event) => {
        const transcription = Array.from(event.results).reduce((text, result) => {
          return text.concat(result[0].transcript)
        }, '')

        setContent(transcription)
      }

      speechRecognition.onerror = (event) => {
        console.log(event)
      }

      speechRecognition.start()
    }
 
    function handleStopRecording() {
      setIsRecording(false)

      if (speechRecognition !== null) {
        speechRecognition.stop()
      }
    }

    function handleClearContentAfterClosingModal() {
      return setContent('')
    }

    return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-md flex flex-col bg-slate-700 text-left p-5 gap-3 outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
         <span className="text-sm font-medium text-slate-200">
           Adicionar nota
         </span>
   
         <p className="text-sm leading-6 text-slate-400">
           Grave uma nota em áudio que será convertida para texto automaticamente.
         </p>
      </Dialog.Trigger>

      <Dialog.Portal>
          <Dialog.Overlay className="inset-0 fixed bg-black/50" />
          <Dialog.Content className="fixed overflow-hidden left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[640px] h-[60vh] w-full bg-slate-700 rounded-md flex flex-col outline-none">
            <Dialog.Close onClick={handleClearContentAfterClosingModal} className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
              <X className="size-5" />
            </Dialog.Close>

            <form className="flex-1 flex flex-col">
              <div className="flex flex-1 flex-col gap-3 p-5">
                <span className="text-sm font-medium text-slate-300">
                  Adicionar nota
                </span>

                {shouldShowOnBoarding ? (
                  <p className="text-sm leading-6 text-slate-400">
                  Comece <button type="button" onClick={handleStartRecording} className="font-medium text-lime-400 hover:underline">gravando uma nota</button> em áudio ou se preferir <button type="button" onClick={handleStartEditor} className="font-medium text-lime-400 hover:underline"> utilize apenas texto</button>.
                  </p>
                ) : (
                  <textarea 
                    autoFocus 
                    className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                    onChange={handleContentChanged}
                    value={content}
                  />
                )}
              </div>

                {isRecording? (
                    <button
                    type="button"
                    onClick={handleStopRecording}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100"
                  >
                    <div className="size-3 rounded-full bg-red-500 animate-pulse" />
                    Gravando! (clique para interromper)
                  </button>
                ) : (
                    <button
                    type="button"
                    onClick={handleSaveNote}
                    className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500"
                  >
                    Salvar nota
                  </button>
                )}
            </form>
          </Dialog.Content>
        </Dialog.Portal>
    </Dialog.Root>
    )
}