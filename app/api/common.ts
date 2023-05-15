import { NextRequest } from "next/server";

const OPENAI_URL = "api.openai.com";
const DEFAULT_PROTOCOL = "https";
const PROTOCOL = process.env.PROTOCOL ?? DEFAULT_PROTOCOL;
const BASE_URL = process.env.BASE_URL ?? OPENAI_URL;

export async function requestOpenai(req: NextRequest) {
  const authValue = req.headers.get("Authorization") ?? "";
  const openaiPath = `${req.nextUrl.pathname}${req.nextUrl.search}`.replaceAll(
    "/api/openai/",
    "",
  );

  let baseUrl = BASE_URL;

  if (!baseUrl.startsWith("http")) {
    baseUrl = `${PROTOCOL}://${baseUrl}`;
  }

  console.log("[Proxy] ", openaiPath);
  console.log("[Base Url]", baseUrl);

  if (process.env.OPENAI_ORG_ID) {
    console.log("[Org ID]", process.env.OPENAI_ORG_ID);
  }

  if (!authValue || !authValue.startsWith("Bearer sk-")) {
    console.error("[OpenAI Request] invalid api key provided", authValue);
  }

  return fetch(`${baseUrl}/${openaiPath}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: authValue,
      ...(process.env.OPENAI_ORG_ID && {
        "OpenAI-Organization": process.env.OPENAI_ORG_ID,
      }),
    },
    cache: "no-store",
    method: req.method,
    body: req.body,
  });
}

/**
 * handle text to speach
 * @param req text to speach
 */
export async function requestAzureTTS(text: string) {
  // @ts-ignore
  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
    process.env.NEXT_PUBLIC_SPEECH_KEY,
    process.env.NEXT_PUBLIC_SPEECH_REGION,
  );
  speechConfig.speechSynthesisLanguage = "en-US";
  speechConfig.speechSynthesisVoiceName = "en-US-Guy24kRUS";
  // above is the speech config

  // @ts-ignore
  const audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();
  // above is the audiConfig

  // @ts-ignore
  const synthesizer = new SpeechSDK.SpeechSynthesizer(
    speechConfig,
    audioConfig,
  );

  // console.log("synthesizer: ", await synthesizer.getVoicesAsync());

  synthesizer.speakSsmlAsync(
    `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US">
      <voice name="en-US-NancyNeural"><s /><mstts:express-as style="Default">${text}</mstts:express-as><s /></voice>
    </speak>
    `,
    (result: any) => {
      if (result) {
        console.log("Speech synthesis result:", result.privErrorDetails);
      }
      synthesizer.close();
    },
    (error: any) => {
      console.error("Error during speech synthesis:", error);
      synthesizer.close();
    },
  );
}
