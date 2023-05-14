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
    "api_key",
    "service_Region",
  );
  speechConfig.speechSynthesisLanguage = "en-US";
  speechConfig.speechSynthesisVoiceName = "en-US-Guy24kRUS";

  // @ts-ignore
  const audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();
  // @ts-ignore
  const synthesizer = new SpeechSDK.SpeechSynthesizer(
    speechConfig,
    audioConfig,
  );

  synthesizer.speakTextAsync(
    text,
    (result: any) => {
      if (result) {
        console.log("Speech synthesis result:", result);
      }
      synthesizer.close();
    },
    (error: any) => {
      console.error("Error during speech synthesis:", error);
      synthesizer.close();
    },
  );
}
