import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger,   SelectGroup, SelectValue } from "@/components/ui/select"
import { ArrowRightLeft } from "lucide-react"
import { ButtonLoading } from './ui/button-loading'

type Language = 'cor_Latn' | 'fra_Latn'



export function TranslationToolComponent() {
  const [loading, setLoading] = useState<Boolean>(false)
  const [sourceLanguage, setSourceLanguage] = useState<Language>('cor_Latn')
  const [targetLanguage, setTargetLanguage] = useState<Language>('fra_Latn')
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  console.log(targetLanguage)
  const switchLanguages = () => {
    setSourceLanguage(targetLanguage)
    setTargetLanguage(sourceLanguage)
    setInputText(outputText)
    setOutputText(inputText)
  }

  const translate = async () => {
    setLoading(true)
  
    const headers = {
      "Content-Type": "application/json"
  };
  
  
  const payload = {
      "inputs": inputText,
      "parameters": {
          "src_lang": sourceLanguage,
          "tgt_lang": targetLanguage
      }
  };
  
  fetch('https://d52sqo2qaq5dove0.eu-west-1.aws.endpoints.huggingface.cloud', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(data => {
      if (data.length > 0)
        setOutputText(data[0]);
      else
        setOutputText('Aucune traduction possible...')
      setLoading(false);
  })
  .catch(error => {
      console.log(error);
      setOutputText(error);
      setLoading(false)
  });
  }

  return (
    <div className="space-y-8">
      <div
        className="mx-auto mb-16 flex items-center justify-center  text-sm font-semibold text-primary dark:text-white relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:border before:border-transparent before:bg-primary/10 before:bg-gradient-to-b before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 dark:before:border-gray-700 dark:before:bg-gray-800 sm:w-max"
      >
        <span class="mr-3">🚧</span>
        <span class="hidden md:flex">Version Beta&nbsp;</span>
      </div>
      <h1 className="text-2xl font-bold text-center mb-6">Traducteur Corse-Français</h1>
      
      <div className="flex items-center space-x-4 bg-white">
        <Select value={sourceLanguage} onValueChange={(value: Language) => sourceLanguage !== value ? switchLanguages() : null}>
          <SelectTrigger>
            <SelectValue placeholder="Source Language" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="cor_Latn">Corse</SelectItem>
            <SelectItem value="fra_Latn">Français</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline transparent" size="icon" onClick={switchLanguages}>
          <ArrowRightLeft className="h-4 w-4" />
        </Button>

        <Select value={targetLanguage} onValueChange={(value: Language) => targetLanguage !== value ? switchLanguages() : null}>
          <SelectTrigger>
            <SelectValue placeholder="LangDestination" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="cor_Latn">Corse</SelectItem>
            <SelectItem value="fra_Latn">Français</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-center">
        {loading ? <ButtonLoading /> : 
        <Button onClick={translate} disabled={inputText.length === 0} className="text-white">
          Traduire
        </Button>
        }
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Textarea
            id="input-text"
            placeholder={`Entrez le text ici en ${sourceLanguage === 'cor_Latn' ? 'Corse' : 'Français'}`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={5}
          />
        </div>

        <div className="space-y-2">
          <Textarea
            id="output-text"
            placeholder={`La traduction apparaîtra ici en ${targetLanguage === 'cor_Latn' ? 'Corse' : 'Français'}`}
            value={outputText}
            readOnly
            rows={5}
          />
        </div>
      </div>
      <span class="text-muted text-center mx-auto flex justify-center text-sm">Le traducteur IA peut faire des erreurs, veuillez verifier les traductions.</span>
    </div>
  )
}
