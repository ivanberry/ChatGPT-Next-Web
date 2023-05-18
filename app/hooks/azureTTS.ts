import { useState } from "react";
import {
  SpeechSynthesizer,
  SpeakerAudioDestination,
  SpeechConfig,
  AudioConfig,
  SpeechConfigImpl,
} from "microsoft-cognitiveservices-speech-sdk";

/**
 * handle text to speach
 * @param req text to speach
 */
export default function useAzureTTS() {
  console.log("called");
  // @ts-ignore
  const speechConfig = SpeechConfig.fromSubscription(
    process.env.NEXT_PUBLIC_SPEECH_KEY as string,
    process.env.NEXT_PUBLIC_SPEECH_REGION as string,
  );
  speechConfig.speechSynthesisLanguage = "en-US";
  speechConfig.speechSynthesisVoiceName = "en-US-Guy24kRUS";
  //   speechConfig.autoDetectSourceLanguages = true;

  //   @ts-ignore
  const player = new SpeakerAudioDestination();
  player.onAudioStart = function () {
    window.console.log("playback started");
  };

  // @ts-ignore
  const audioConfig = AudioConfig.fromSpeakerOutput(player);

  // TODO: everytime will change a new instance, how to reuse it?
  const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

  function speak(text: string) {
    synthesizer.speakSsmlAsync(
      `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US">
      <voice name="en-US-NancyNeural"><s /><mstts:express-as style="Default">${text}</mstts:express-as><s /></voice>
    </speak>
    `,
      (result: any) => {
        if (result) {
          console.log("Speech synthesis result:", result.privErrorDetails);
        }
        // synthesizer.close();
      },
      (error: any) => {
        console.error("Error during speech synthesis:", error);
        synthesizer.close();
      },
    );
  }

  return [player, speak];
}
