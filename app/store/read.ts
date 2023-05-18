import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  SpeechSynthesizer,
  SpeakerAudioDestination,
  SpeechConfig,
  AudioConfig,
  SpeechConfigImpl,
} from "microsoft-cognitiveservices-speech-sdk";

function read(text: string, synthesizer: SpeechSynthesizer) {
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
      // synthesizer.close();
    },
  );
}

/**
 * handle text to speach
 * @param req text to speach
 */
function createSynthesizer(player: SpeakerAudioDestination): SpeechSynthesizer {
  // @ts-ignore
  const speechConfig = SpeechConfig.fromSubscription(
    process.env.NEXT_PUBLIC_SPEECH_KEY as string,
    process.env.NEXT_PUBLIC_SPEECH_REGION as string,
  );
  speechConfig.speechSynthesisLanguage = "en-US";
  speechConfig.speechSynthesisVoiceName = "en-US-Guy24kRUS";
  //   speechConfig.autoDetectSourceLanguages = true;

  // @ts-ignore
  const audioConfig = AudioConfig.fromSpeakerOutput(player);
  const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

  return synthesizer;
}

function createAudio(): SpeakerAudioDestination {
  // https://learn.microsoft.com/en-us/javascript/api/microsoft-cognitiveservices-speech-sdk/speakeraudiodestination?view=azure-node-latest
  const player = new SpeakerAudioDestination();
  player.onAudioStart = function () {
    window.console.log("playback started");
  };

  return player;
}

// Notice the interface details
interface ReadStore {
  reading: boolean;
  getSynthesizer: Function;
  // getPlayer: () => SpeakerAudioDestination;
  read: Function;
  player: SpeakerAudioDestination;
  synthesis: any;
}

const useReadStore = create<ReadStore>()(
  persist(
    (set, get) => {
      const player = createAudio();
      const synthesis = createSynthesizer(player);

      const readMethod = (text: string) => read(text, synthesis);

      return {
        reading: false,
        // getPlayer: () => get().player,
        setStatus: (status: boolean) => set(() => ({ reading: status })),
        getStatus: () => get().reading,
        getSynthesizer: () => get().synthesis,
        player, // 播放器检测器,可以检测出当前是否有音频在播放
        synthesis,
        read: readMethod,
      };
    },
    {
      name: "read-store",
    },
  ),
);

export default useReadStore;
