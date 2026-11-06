import type { GameConfig } from "../../chat/types/chat.types";
import { END } from "../../chat/types/chat.types";
import type {
  Beat,
  CallSpec,
  Condition,
  Effects,
} from "../../chat/types/story.types";
import SevenLampsOpening from "../../intro/components/theSevenLamps/TheSevenLamps";
import SevenLampsTitleLobby from "../../games/dinnerDate/components/title/TitleLobby";

const IMG = (f: string) => `/games/theSevenLamps/images/${f}`;
const VID = (f: string) => `/games/theSevenLamps/videos/${f}`;
const AUD = (f: string) => `/games/theSevenLamps/audio/${f}`;

const MENON_NAME = "Menon sir (Chief Editor)";

type Opts = Partial<Beat>;
const them = (text: string, o: Opts = {}): Beat => ({
  from: "them",
  text,
  ...o,
});
const by = (speaker: string, text: string, o: Opts = {}): Beat => ({
  from: "them",
  speaker,
  text,
  ...o,
});
const sys = (text: string, o: Opts = {}): Beat => ({
  from: "system",
  text,
  ...o,
});
const stamp = (text: string): Beat => ({
  from: "system",
  variant: "stamp",
  text,
});
const title = (text: string): Beat => ({
  from: "system",
  variant: "title",
  text,
});
const flag = (set: Effects, when?: Condition): Beat => ({ set, when });
const pic = (src: string, alt: string): Beat => ({
  from: "them",
  media: { kind: "image", src, alt },
});
const clip = (
  tone: "paper" | "sticky" | "screen",
  heading: string,
  extra: { byline?: string; body?: string } = {},
): Beat => ({
  from: "system",
  media: { kind: "clipping", tone, heading, ...extra },
});
const f = (
  flag: string,
  extra: { is?: boolean | string | number; gte?: number; lt?: number } = {},
): Condition => ({ flag, ...extra });
const all = (...c: Condition[]): Condition => ({ all: c });
const any = (...c: Condition[]): Condition => ({ any: c });
const not = (c: Condition): Condition => ({ not: c });
const when = (b: Beat, c: Condition): Beat => ({ ...b, when: c });
const rush = (b: Beat): Beat => ({ typingMs: 800, ...b });

const evidenceReady = any(
  f("hasRecording", { is: true }),
  f("archivePhotos"),
  f("ridgeRecording"),
  f("ridgePhoto"),
  f("lampPhoto"),
);
const cleanTip = all(f("evidenceSent"), not(f("tippedKeepers")));
const knowsRoll = any(f("gopalanAlly"), f("knowsRoll"));

const goBoss: Beat = { startChat: { chatId: "boss", delayMs: 5000 } };
// Beat.startChat in story.types.ts has no `stepId` yet. This helper builds the
// beat with a cast so the file compiles without touching the types. Once
// story.types.ts allows `stepId`, the cast can be removed.
const jumpTo = (chatId: string, stepId: string, delayMs: number): Beat =>
  ({ startChat: { chatId, stepId, delayMs } }) as Beat;

const goMenon: Beat = jumpTo("boss", "s9", 4000);
const goPillai: Beat = { startChat: { chatId: "pillai", delayMs: 3000 } };
const goLakshmi: Beat = { startChat: { chatId: "lakshmi", delayMs: 5000 } };
const goPolice: Beat = { startChat: { chatId: "police", delayMs: 5000 } };
const goNewsroom: Beat = { startChat: { chatId: "newsroom", delayMs: 16000 } };
const goPillaiEnd: Beat = {
  startChat: { chatId: "pillai_end", delayMs: 3000 },
};
// CHANGE: Athul is ONE chat now. The guard scene and the ending messages are
// steps inside the "athul" chat, reached with stepId.
const goAthulEnd: Beat = jumpTo("athul", "ae1", 6000);
const goGuard: Beat = jumpTo("athul", "g1", 8000);
const isEnding = (e: string) => f("ending", { is: e });

const impostorCall: CallSpec = {
  name: "Athul",
  voiceSrc: AUD("impostor-call.mp3"),
  direction: "outgoing",
  ringMs: 4000,
};
const callAthul: Beat[] = [
  { from: "system", call: impostorCall },
  sys("Call ended · 0:14"),
  them("Sorry. Network is bad. Please do not call."),
  flag({ caughtImpostor: true }),
];
const TRAP_Q = "Hey, what did you say to that cop at Fort Kochi that night?";
const trapReply: Beat[] = [
  them("Ah. Fort Kochi. Yes. A funny night."),
  flag({ caughtImpostor: true }),
];

const clampMs = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

const pace = (b: Beat, i: number): Beat => {
  if (!b.from || b.call || b.typingOnly) return b;
  const len = b.text ? b.text.length : 0;
  const first = i === 0 ? 500 : 0;
  if (b.variant === "stamp" || b.variant === "title") {
    return { delayMs: 1000 + first, ...b };
  }
  if (b.from === "system" && !b.media) {
    return { delayMs: 500 + first, ...b };
  }
  if (b.media) {
    return { typingMs: 900, delayMs: 900 + first, ...b };
  }
  return {
    typingMs: clampMs(300 + len * 18, 500, 2500),
    delayMs: 250 + ((len * 53) % 5) * 120 + first,
    ...b,
  };
};

const paceAll = (beats: Beat[] | undefined) =>
  beats ? beats.map((b, i) => pace(b, i)) : beats;

const withPacing = (cfg: GameConfig): GameConfig => ({
  ...cfg,
  chats: cfg.chats.map((c) => ({
    ...c,
    steps: c.steps.map((s) => ({
      ...s,
      intro: paceAll(s.intro),
      options: s.options.map((o) => ({ ...o, say: paceAll(o.say) })),
    })),
  })),
});

const storyConfig: GameConfig = {
  id: "seven-lamps",
  title: "The Seven Lamps",
  wallpaper: "/user/mobile/mobile-bg.avif",
  lobby: SevenLampsTitleLobby,
  Intro: SevenLampsOpening,

  notifications: [],
  call: { name: "Unknown number", voiceSrc: "" },

  chats: [
    {
      id: "athul",
      name: "Athul",
      initials: "A",
      avatarClass: "bg-emerald-500/90",
      time: "9:02 PM",
      unread: 1,
      initialMessages: [
        {
          id: 1,
          from: "them",
          text: "bro finally reached munnar. its like 9pm",
        },
        {
          id: 2,
          from: "them",
          text: "freezing here man. should've got another jacket",
        },
      ],
      start: "s1",
      steps: [
        {
          id: "s1",
          options: [
            {
              text: "How was the drive?",
              say: [them("long. dark hill roads, my ears are still blocked")],
              next: "s1b",
            },
            {
              text: "Did you find a place to stay?",
              say: [them("small lodge near the town. nothing fancy")],
              next: "s1b",
            },
            {
              text: "Get some tea before your balls freeze off.",
              set: { sentForTea: true },
              say: [them("fuck off man. going now")],
              next: "s1b",
            },
          ],
        },
        {
          // goBoss removed from here. Menon's chat no longer pops up
          // while Athul is still online.
          id: "s1b",
          intro: [
            them(
              "i know you're stuck on the night desk tonight because of me. don't stay till midnight again, you do it every time",
            ),
          ],
          options: [
            {
              text: "Someone has to stay and work. You're the one who ditched me.",
              say: [
                them(
                  "lol yeah. 3 years of covering for each other and i leave you the night desk",
                ),
                them("ill make it up. chai on me when i'm back"),
              ],
              next: "s1b_break",
            },
            {
              text: "Send me a selfie so I know you're not dead.",
              say: [
                pic(
                  IMG("selfie.avif"),
                  "A blurry, grainy selfie of Athul in a dark beanie, grinning, in fog at night. A single streetlamp glows behind him.",
                ),
                them(
                  "sorry its blurry. this phone's camera is trash, and the fog does'nt help",
                ),
                them("still alive though. happy?"),
              ],
              next: "s1b_selfie",
            },
            {
              text: "Don't die. You owe me dinner.",
              say: [
                them("dinner at your pick. kerala meals, banana leaf. deal"),
              ],
              next: "s1b_break",
            },
          ],
        },
        {
          id: "s1b_selfie",
          options: [
            {
              // CHANGE: the old "paper paid / not the camera" joke was too
              // insider. Now it is a relatable office complaint: the company
              // pays for the cheapest trip but never fixes the tools you
              // actually need.
              text: "You still haven't fixed that camera? How did you even afford Munnar?",
              say: [
                them(
                  "office paid for the trip, fool. cheapest bus, cheapest lodge",
                ),
                them(
                  "they'll book a 12 hour bus but wont replace a phone that works. thats our company for you",
                ),
              ],
              next: "s1b_break",
            },
            {
              text: "Fine. You're alive. Good enough.",
              say: [them("told you. now stop worrying")],
              next: "s1b_break",
            },
          ],
        },
        {
          // goBoss now fires here, right after Athul goes offline.
          id: "s1b_break",
          intro: [
            them("my phone is dying. 2%"),
            them("going to charge it. ill message you in a bit"),
            sys("Athul · offline"),
            goBoss,
          ],
          options: [],
          then: "s1b_hold",
        },
        {
          // Athul stays unreachable until the Menon chat is finished
          // (menonDone = true, set in boss step b4). Then this option appears.
          id: "s1b_hold",
          options: [
            {
              text: "Athul? You there?",
              when: f("menonDone"),
              sends: "Athul? You there?",
              say: [
                sys("Athul · online"),
                them("yeah. phone's back on. sorry, battery was dead"),
              ],
              next: "s1c",
            },
          ],
        },
        {
          id: "s1c",
          intro: [
            sys("Athul · online"),
            stamp("9:30 PM"),
            them("ok but this is serious. you know why this story is so big?"),
            them(
              "6 people dead in 3 weeks up here. heads cut off, every time. police have a case open but nobody is arrested. nothing",
            ),
          ],
          options: [
            {
              text: "Six people killed and no arrests? That's not normal.",
              say: [
                them(
                  "thats what i said. cops just keep saying 'we are investigating'. so im asking the people who live here",
                ),
              ],
              next: "s2",
            },
            {
              text: "Menon gave YOU this? He never gives away stories.",
              set: { suspicion: { add: 1 } },
              say: [
                them(
                  "exactly. called me in himself. said go tonight, didnt even ask me to pitch it",
                ),
              ],
              next: "s2",
            },
            {
              text: "Be careful. Seriously.",
              say: [them("i will. you're on speed dial")],
              next: "s2",
            },
          ],
        },

        {
          id: "s2",
          intro: [
            stamp("9:41 PM"),
            them("found a tea shop near the lodge. only place open this late"),
            them(
              "the old man who runs it says the police have it all wrong. went quiet when he saw my phone recording",
            ),
          ],
          options: [
            {
              text: "Wrong how? What did he say?",
              say: [
                them("hold on im getting there. he keeps looking at the road"),
              ],
              next: "s3",
            },
            {
              text: "Old guys love dramatic stories.",
              say: [
                them(
                  "nah bro. he was scared. his hands were shaking while he poured the tea",
                ),
              ],
              next: "s3",
            },
            {
              text: "Scared of a phone? What's he afraid of?",
              say: [them("no phones no names. he said phones listen")],
              next: "s3",
            },
          ],
        },

        {
          id: "s3",
          intro: [
            them("recorder's on, he saw it. he'll only talk if its off"),
            them("i can turn it back on without him seeing though. your call"),
          ],
          options: [
            {
              text: "Leave it off. Don't lose him.",
              say: [
                them(
                  "ok switching it off. ill message you after, don't text me",
                ),
              ],
              next: "a1",
            },
            {
              text: "Turn it on. Hide the phone.",
              set: { hasRecording: true },
              say: [
                them(
                  "ok. phone's in my shirt pocket. ill message you after, don't text me",
                ),
              ],
              next: "b1",
            },
            {
              text: "Make him talk on camera. We need proof.",
              set: { hasRecording: false, infoLevel: "none" },
              say: [
                them("ok let me ask him"),
                them("...", { typingMs: 2500 }),
                them("he got up and walked away. no witness, no recording"),
                them("fine. sherlock athul will find out if this is real"),
              ],
              next: "s4e",
            },
          ],
        },

        {
          id: "a1",
          options: [
            {
              text: "Ok. Message me when he's done.",
              sends: "Ok. Message me when he's done.",
              say: [
                stamp("20 minutes later"),
                them(
                  "bro. that old man told me something really bad. the heads are being taken for a secret ceremony. lamps on the hill. and the police already know",
                  { typingMs: 3500 },
                ),
                them(
                  "can't remember the rest. i wish i'd kept the recorder on",
                ),
              ],
              next: "a2",
            },
            {
              text: "Any news? What's he saying?",
              sends: "Any news? What's he saying?",
              set: { hasRecording: false, infoLevel: "low" },
              say: [
                stamp("A few minutes later"),
                them("bro what the hell"),
                them(
                  "your message made my phone buzz right in the middle of it",
                ),
                them('he said "i told you no phones"'),
                them("walked off. wont talk to me now"),
              ],
              next: "a_msg",
            },
          ],
        },
        {
          id: "a2",
          options: [
            { text: "Damn.", next: "a3" },
            { text: "No recording? Seriously?", next: "a3" },
            { text: "Sounds like a village story.", next: "a3" },
          ],
        },
        {
          id: "a3",
          options: [
            { text: "Give me a second to take this in.", next: "a4" },
            { text: "Ok, let's go through what you've got.", next: "a4" },
            { text: "Hold on, let me think.", next: "a4" },
          ],
        },
        {
          id: "a4",
          options: [
            {
              text: "How does he even know about the lamps?",
              say: [
                them(
                  "he used to work at the tea estate up there in the 80s. carried lamp oil up the hill for some men. never asked why",
                ),
              ],
              next: "s4c",
            },
            {
              text: "Did he say who's behind it?",
              say: [
                them("no names"),
                them(
                  "but he said it happens every 20 years. six people killed, six lamps lit. and the case is always closed fast",
                ),
              ],
              next: "s4c",
            },
            {
              text: "Did he say anything that proves it's real?",
              say: [
                them("no proof. just that his own son went up there in 2006"),
                them(
                  "and never came down. then the paper called him the killer",
                ),
                them("he kept saying 'my son would never do that'"),
              ],
              next: "s4c",
            },
          ],
        },
        {
          id: "a_msg",
          options: [
            {
              text: "My bad, I didn't think.",
              say: [them("yeah well. he's gone man")],
              next: "s4d",
            },
            {
              text: "You should've put it on silent.",
              say: [
                them("i thought it WAS silent. whatever"),
                them("he's gone man. no point now"),
              ],
              next: "s4d",
            },
            {
              text: "He got that angry over one buzz? What's he so scared of?",
              say: [
                them("thats what's bugging me"),
                them(
                  "his face went white. like somebody could be listening. then he just left",
                ),
              ],
              next: "s4d",
            },
          ],
        },

        {
          id: "b1",
          options: [
            {
              text: "Ok. Message me when he's done.",
              sends: "Ok. Message me when he's done.",
              say: [
                stamp("20 minutes later"),
                them("bro"),
                them(
                  "i just heard some really messed up stuff. he says these killings are not random. the heads are taken for a secret ceremony, every 20 years",
                  { typingMs: 4000 },
                ),
                them("its all on the recording. sending it now"),
                them("listen till the end. a jeep pulls up"),
              ],
              next: "s4a",
            },
            {
              text: "Any news? What's he saying?",
              sends: "Any news? What's he saying?",
              set: { hasRecording: "partial" },
              say: [
                stamp("A few minutes later"),
                them("bro what the hell"),
                them(
                  "your message made my phone buzz right in the middle of it",
                ),
                them('he heard it. "i told you no phones." walked off'),
                them("i only got the first few minutes on the recording"),
              ],
              next: "s4b",
            },
          ],
        },

        {
          id: "s4a",
          intro: [
            stamp("10:48 PM"),
            {
              from: "them",
              media: {
                kind: "audio",
                src: AUD("gopalan-recording.opus"),
                durationSec: 862,
              },
            },
            them("headphones on. don't skip the end"),
          ],
          options: [
            { text: "Playing it.", sends: "Playing it.", next: "s4a_play" },
            {
              text: "Just tell me the short version.",
              say: [them("nope. listen to it first. his voice matters")],
              next: "s4a_play",
            },
            {
              text: "Forward it to Menon sir first. He'd want to hear this.",
              set: { forwardedToMenon: true },
              say: [
                sys("Forwarded to R. Menon (Chief Editor)"),
                sys("Read · 10:49 PM"),
                them("menon sir? bro you could've listened to it first"),
              ],
              next: "s4a_play",
            },
          ],
        },
        {
          id: "s4a_play",
          intro: [
            them(
              "ok so. the old man is Gopalan. in the 80s he carried lamp oil up that hill for the tea estate. never asked why",
            ),
            them(
              "in 2006 his son Sudhakaran, a photographer, went up there with a reporter from kochi. only the reporter came back",
            ),
            them(
              "then the paper printed that his son was the killer. a madman who did all six. gopalan went to their office and said 'my son would never do that'",
            ),
            them(
              "they threw him out. after that he never spoke to anyone about it. not till tonight",
            ),
            flag({ infoLevel: "full" }),
            them("no photos, no proof. thats all he knows about the reporter"),
            // CHANGE: film roll now comes from Gopalan's recording, so the
            // "last roll of film" stall option in s11c_2 still works.
            them(
              "only thing he has left of his son is sudhakarans last roll of film. never developed it. too scared to",
            ),
            flag({ knowsRoll: true }),
            them(
              "then a jeep pulled up outside the shop tonight and he stopped talking",
            ),
          ],
          options: [
            {
              text: "A Kochi reporter. Which paper?",
              say: [
                them(
                  "he doesnt know. only that a kochi paper printed the story that closed the case in 2006",
                ),
                them("we have the archive. check ours first when you can"),
              ],
              next: "s5",
            },
            {
              text: "Why would he trust you with this?",
              say: [them("he doesnt. thats why he whispered the whole time")],
              next: "s5",
            },
            {
              text: "The police know about this?",
              say: [
                them(
                  "he says they are told what to write before the bodies are even cold",
                ),
                them("thats the part that scares me"),
              ],
              next: "s5",
            },
          ],
        },
        {
          id: "s4b",
          intro: [
            stamp("10:48 PM"),
            {
              from: "them",
              media: {
                kind: "audio",
                src: AUD("tea_stall_01_partial.m4a"),
                durationSec: 41,
              },
            },
            them(
              "thats all i got. he says it starts with lamps on the hill. and ends with a news story that closes the case",
            ),
            them(
              "a kochi paper printed that story. 2006. then your text buzzed",
            ),
          ],
          options: [
            {
              text: "A Kochi paper printed it? I'll check our archive.",
              say: [them("do it. dont tell anyone yet. not till we know who")],
              next: "s5",
            },
            {
              text: "Don't guess. Ask him again tomorrow.",
              say: [them("he's not coming back to that shop. you know that")],
              next: "s5",
            },
            {
              text: "Menon would know. He's been here forever.",
              say: [
                them("maybe. but i dont want to tell anyone till we know more"),
              ],
              next: "s5",
            },
          ],
        },
        {
          id: "s4c",
          intro: [
            them("all i've got is the hill, the 20 years, and the cops"),
            flag({ infoLevel: "medium", hasRecording: false }),
            stamp("10:48 PM"),
            them(
              'he said one more thing at the door. "ask the kochi papers what they printed in 2006"',
            ),
            them(
              "then he shut the shutters. i can still see his hands shaking",
            ),
          ],
          options: [
            {
              text: "Kochi papers? Pulling our 2006 archive.",
              set: { suspicion: { add: 1 } },
              say: [
                them("yeah. quietly"),
                them("i dont know who i can trust back there"),
              ],
              next: "s5",
            },
            {
              text: "Village talk, bro. Don't read into it.",
              say: [them("maybe. but he didn't say it like talk")],
              next: "s5",
            },
            {
              text: "Go back and ask him what he meant.",
              say: [
                them("shop is shut. lights off"),
                them("ill try the lodge owner. he'd know him"),
              ],
              next: "s5",
            },
          ],
        },
        {
          id: "s4d",
          intro: [
            stamp("10:48 PM"),
            them("back at the lodge. owner knows the old man. Gopalan"),
            them(
              'his son Sudhakaran died in 2006. "fell from the hill" they said. he was a photographer',
            ),
            them(
              "and the paper called him the killer. a madman. the whole town knows he wasnt. gopalan still says 'my son would never do that'",
            ),
            them(
              "owner says a kochi reporter was up here that same week. came back alone",
            ),
          ],
          options: [
            {
              text: "Sudhakaran. 2006. Let me search our archive.",
              say: [them("do it. ill keep digging here")],
              next: "s5",
            },
            {
              text: "First useful thing you've said all night.",
              say: [them("youre welcome sherlock")],
              next: "s5",
            },
            {
              text: "Why would a lodge owner remember that after 20 years?",
              say: [
                them("because nobody up here forgets what happened in 2006"),
                them("they just stopped talking about it"),
              ],
              next: "s5",
            },
          ],
        },
        {
          id: "s4e",
          intro: [
            stamp("10:48 PM"),
            them("update. went back to the shop"),
            them("shutters down. but theres a photo pinned under the counter"),
            pic(
              IMG("friends.avif"),
              'Two young men on a hill at dusk, one holding a camera. The other man\'s face has been scratched out with a pen. On the back: "Sudhakaran + the reporter. Vilakkumala. 2006."',
            ),
            them(
              "someone scratched the reporter's face out. the ink looks fresh",
            ),
          ],
          options: [
            {
              text: "Can you find out who the reporter is?",
              set: { suspicion: { add: 1 } },
              say: [
                them("not from here. but the date on the back is march 2006"),
                them("our paper's archive would have it"),
              ],
              next: "s5",
            },
            {
              text: "Put it back, bro. You're not supposed to have that.",
              say: [them("im not putting back the only proof we have")],
              next: "s5",
            },
            {
              text: "Send me a closer photo of the back.",
              say: [
                pic(
                  IMG("photo-back.avif"),
                  'Handwriting: "Sudhakaran + the reporter. Vilakkumala. March 2006."',
                ),
                them("march 2006. thats all it says"),
              ],
              next: "s5",
            },
          ],
        },

        {
          id: "s5",
          intro: [
            stamp("10:58 PM"),
            them("i know you're still at the office"),
            them(
              "have you got into the archive yet? even one headline from march 2006 would help",
            ),
          ],
          options: [
            {
              // CHANGE: the old "Menon sir is still in his cabin" line was
              // random, since it's the company's own archive and pulling old
              // issues is routine. Now the worry is about looking ordinary.
              text: "Going down to the archive room now. It's our own paper, nobody will ask.",
              sends:
                "Going down to the archive room now. It's our own paper, nobody will ask.",
              say: [
                them(
                  "true. if anyone asks, you're checking an old story for the desk",
                ),
                them(
                  "start with march 2006. just don't take anything out of the room",
                ),
              ],
              next: "s5_archive",
            },
            {
              text: "Give me five minutes. Print deadline.",
              sends: "Give me five minutes. Print deadline.",
              say: [them("ok but hurry. i dont like this")],
              next: "s5_archive",
            },
            {
              text: "Not sure where to even start. What do I search?",
              sends: "Not sure where to even start. What do I search?",
              say: [
                them("march 2006. vilakkumala. the killings"),
                them("look at the front pages first"),
              ],
              next: "s5_archive",
            },
          ],
        },
        {
          id: "s5_archive",
          intro: [
            stamp("11:04 PM"),
            flag({ sawArchive: true, knowsMenon: true }),
            clip(
              "paper",
              "MUNNAR KILLER FOUND DEAD ON VILAKKUMALA, CASE CLOSED",
              {
                byline: "By Raghavan Menon, Staff Reporter",
                body: "Suspect: Sudhakaran G., 28, photographer, described by police as unstable · Photographs: Police file · March 14, 2006",
              },
            ),
            clip(
              "paper",
              "MUNNAR KILLER FOUND DEAD ON HILL, POLICE CLOSE FILE",
              {
                byline: "By V. Thampi",
                body: "1986 · Suspect: Narayanan P., photographer · Photographs: Police file",
              },
            ),
            clip(
              "paper",
              "V. THAMPI STEPS DOWN AS CHIEF EDITOR. R. MENON TO TAKE OVER",
              {
                body: "Kochi, March 2006. Thampi cited personal reasons. He has left the city.",
              },
            ),
          ],
          options: [
            {
              text: "The 2006 story is Menon's. It names Sudhakaran as the killer.",
              sends:
                "The 2006 story is Menon's. It names Sudhakaran as the killer.",
              say: [
                them("menon sir??"),
                them(
                  "thats gopalan's son. the one he said would never do that",
                ),
                them("bro. he called me in himself today"),
              ],
              next: "s5_next",
            },
            {
              // CHANGE: replaced the old "Thampi stepped down, Menon took his
              // chair" option. Athul's reply no longer hints that Menon is
              // part of it. foundPattern is still set because the s10_menu
              // "Turn on him" option requires it.
              text: "The 1986 story has the same shape as 2006. A photographer named as the killer, a dead suspect on the hill, case closed.",
              set: { foundPattern: true },
              sends:
                "The 1986 story has the same shape as 2006. A photographer named as the killer, a dead suspect on the hill, case closed.",
              say: [
                them("same hill. same ending. twenty years apart"),
                them(
                  "so somebody hands the papers the same story every 20 years",
                ),
              ],
              next: "s5_next",
            },
            {
              text: "Menon sent you to Munnar on purpose, didn't he?",
              sends: "Menon sent you to Munnar on purpose, didn't he?",
              say: [
                them("...i think so"),
                them('he said it was my "big break"'),
              ],
              next: "s5_next",
            },
          ],
        },
        {
          id: "s5_next",
          options: [
            {
              text: "Photographing everything. I'm keeping copies.",
              sends: "Photographing all of it. I'm keeping copies.",
              set: { archivePhotos: true },
              say: [them("good. keep them where he cant reach")],
              next: "s6",
            },
            {
              text: "Going back to my desk. Menon said the front page is mine tonight.",
              sends:
                "I'm going back to my desk. Menon said the front page is mine tonight.",
              say: [
                them("ok"),
                them("...wait. thats strange"),
                them("because he told me that page was waiting for MY story"),
              ],
              next: "s6",
            },
            {
              text: "Putting it all back before someone sees.",
              sends: "Putting it all back before someone sees me.",
              say: [them("ok ok. hands shaking? mine too")],
              next: "s6",
            },
          ],
        },

        {
          id: "s6",
          intro: [
            stamp("11:12 PM"),
            them("going to vilakkumala now. the hill from the 2006 story"),
          ],
          options: [
            {
              text: "Stay on the main track. Don't wander off.",
              say: [
                them("yeah yeah. main path only"),
                them("midnight deadline bro. no other way to get this story"),
                them("relax. sherlock athul has got this"),
              ],
              next: "s6b",
            },
            {
              text: "Go. But share your live location with me.",
              set: { liveLocation: true },
              say: [
                sys("Athul is sharing his live location with you"),
                {
                  from: "them",
                  media: { kind: "location", label: "Athul · Live location" },
                },
                them("happy? dont stalk me"),
              ],
              next: "s6b",
            },
            {
              text: "Go. Record everything.",
              set: { ridgeRecording: true },
              say: [
                them("recorders on. phone in my chest pocket"),
                them("this time im not turning it off for anybody"),
              ],
              next: "s6b",
            },
          ],
        },
        {
          // CHANGE: Athul now narrates the situation (curious, then
          // surprised, then scared) before sending the video.
          id: "s6b",
          intro: [
            stamp("11:26 PM"),
            them("bro. you have to see this"),
            {
              from: "them",
              media: {
                kind: "video",
                src: VID("keepers.webm"),
                durationSec: 5,
                alt: "A black hillside at night. Six people in white robes walk in a slow line along the ridge, five of them carrying small oil lamps. The last one carries no lamp and reads aloud from a book held open in his hands.",
              },
            },
            them(
              "six of them. white robes. five carry lamps, the sixth walks at the back with no lamp, reading from a book",
            ),
            them(
              "out loud. low voice, same words again and again. i can hear it from here. like a prayer, but wrong",
            ),
            them(
              "theyre not hiding. theyre not even looking around. like they have done this walk before",
            ),
            them(
              "theyre going up the hill and my hands wont stop shaking. please tell me they cant see me",
            ),
          ],
          options: [
            {
              text: "Come back. Now.",
              say: [them("trying. cant see the track in this fog")],
              next: "s6c",
            },
            {
              text: "Take pictures. Zoom in.",
              set: { ridgePhoto: true },
              say: [
                pic(
                  IMG("keepers-zoomin.avif"),
                  "Six people in white robes walking in a line up the ridge, five of them carrying oil lamps. The last one carries no lamp and reads from a book in his hands.",
                ),
              ],
              next: "s6c",
            },
            {
              text: "Count them again.",
              say: [
                them("six of them. five lamps. all walking up toward the top"),
                them(
                  "the one at the back has no lamp. hes reading from a book. out loud, slow, every line the same rhythm",
                ),
                them("i only caught two words. 'the seventh'"),
              ],
              next: "s6c",
            },
          ],
        },
        {
          id: "s6c",
          intro: [
            them("bro"),
            them("the fog just closed in"),
            them("i cant see the track anymore"),
            them("someones behind me"),
            { from: "them", typingOnly: true, typingMs: 20000 },
          ],
          options: [],
          then: "s7",
        },

        {
          id: "s7",
          intro: [
            stamp("11:34 PM"),
            sys("Athul · last seen 11:30 PM"),
            flag({ suspicion: { add: 1 } }),
            goPillai,
          ],
          options: [],
          then: "s7_hold",
        },
        {
          // Athul stays silent until the Pillai chat is finished
          // (pillaiDone = true, set at the end of Pillai's step p2).
          id: "s7_hold",
          options: [
            {
              text: "Athul?? Where are you? Answer me.",
              when: f("pillaiDone"),
              sends: "Athul?? Where are you? Answer me.",
              say: [sys("Athul · online")],
              next: "s8",
            },
          ],
        },

        {
          id: "s8",
          intro: [
            stamp("11:41 PM"),
            them("I am fine. Do not worry."),
            them("The lamps are very beautiful from up here."),
          ],
          options: [
            {
              text: "Bro?? What happened? Who was behind you?",
              set: { suspicion: { add: 1 } },
              say: [them("Nobody. It was the wind. I am fine.")],
              next: "s8b",
            },
            {
              text: "Send me a picture of where you are.",
              set: { suspicion: { add: 1 } },
              say: [them("My phone camera is not working. The cold.")],
              next: "s8b",
            },
            {
              text: `Test him: "${TRAP_Q}"`,
              sends: TRAP_Q,
              say: trapReply,
              next: "s8e",
            },
            { text: "Call him.", sends: false, say: callAthul, next: "s8e" },
          ],
        },
        {
          id: "s8b",
          intro: [
            them(
              "Menon sir has messaged me. He says send the story by midnight.",
            ),
            them("It will be a big break for us."),
            them("It is a quiet night here. Around 9 o'clock."),
          ],
          options: [],
          then: "s8b_menu",
        },
        {
          id: "s8b_menu",
          options: [
            {
              text: "Hold on. It's nearly midnight.",
              when: not(f("askedClock")),
              set: { askedClock: true, suspicion: { add: 1 } },
              say: [them("My phone clock is wrong. The cold. Do not worry.")],
              next: "s8b_menu",
            },
            {
              text: "Okay bro. I'll send it.",
              say: [
                them("Good. Send it to Menon sir. Before midnight."),
                them("Then everything will be fine."),
                sys("Athul · offline"),
                flag({ caughtImpostor: false }),
                goMenon,
              ],
              next: END,
            },
            {
              text: "Ask him the Fort Kochi question.",
              sends: TRAP_Q,
              say: trapReply,
              next: "s8e",
            },
            { text: "Call him.", sends: false, say: callAthul, next: "s8e" },
          ],
        },
        {
          id: "s8e",
          options: [
            {
              text: 'Confront him: "You\'re not Athul. Who the fuck are you?"',
              sends: "You're not Athul. Who the fuck are you?",
              say: [
                { from: "them", typingOnly: true, typingMs: 2500 },
                { from: "them", typingOnly: true, typingMs: 2500 },
                them("Stay where you are. The guard will", { typingMs: 400 }),
                sys("Message not delivered"),
                sys("This number is no longer available"),
                flag({ gopalanAlly: false }),
                goMenon,
              ],
              next: END,
            },
            {
              text: "Play along. Keep him talking.",
              sends: "Okay. Keep me posted.",
              say: [
                them("Of course. I will keep you updated."),
                stamp("11:44 PM"),
              ],
              next: "s8f",
            },
            {
              text: "Say nothing. Screenshot everything.",
              sends: false,
              set: { archivePhotos: true },
              say: [stamp("11:44 PM")],
              next: "s8f",
            },
          ],
        },
        {
          // CHANGE: Athul no longer mentions the Keepers, the lamps, Gopalan
          // or the soul deal. He is just scared, knocked down, locked in a
          // room with a man guarding him.
          id: "s8f",
          intro: [
            ...[
              them("bro its really me. i have one minute, listen"),
              them(
                "im so scared. someone hit me from behind on the hill. everything went black",
              ),
              them(
                "i woke up in a small room. the door is locked, theres no window",
              ),
              them(
                "theres a man guarding me outside. he went to smoke and left my phone",
              ),
            ].map(rush),
          ],
          options: [
            {
              text: "Are you hurt? Where are you?",
              sends: "Are you hurt? Where are you?",
              say: [
                them("my head is bleeding a little. i dont know where i am"),
                them("i can hear wind, so its still somewhere on the hill"),
              ].map(rush),
              next: "s8g",
            },
            {
              text: "Who did this? Did you see his face?",
              sends: "Who did this? Did you see his face?",
              say: [
                them(
                  "no. it was dark and the fog was thick. i only felt the hit",
                ),
                them("the guard has a torch and a stick. thats all i know"),
              ].map(rush),
              next: "s8g",
            },
            {
              text: "Hold on. Slow down.",
              sends: "Hold on. Slow down.",
              say: [them("i cant bro. i dont have time. just listen")].map(
                rush,
              ),
              next: "s8g",
            },
          ],
        },
        {
          // CHANGE: gopalanAlly and knowsSignerRule are no longer set here.
          // Menon sets knowsSignerRule himself in s9_rule.
          id: "s8g",
          intro: [
            ...[
              them("bro im really afraid. i dont know what they want from me"),
              them("please help me. please do something"),
              { from: "them" as const, typingOnly: true, typingMs: 2000 },
              them("the guard is back"),
            ].map(rush),
            sys("This message was deleted"),
            sys("Athul · offline"),
            goMenon,
          ],
          options: [],
          then: END,
        },

        /* ─────────────────────────────────────────────────────────────
         * MERGED: the guard scene now lives inside this same Athul chat.
         * It is reached from Menon's ending (end3) with stepId "g1".
         * The guard is holding Athul's phone, so it is the same
         * conversation. He THREATENS FIRST, then the player answers.
         * ───────────────────────────────────────────────────────────── */
        {
          id: "g1",
          intro: [
            sys("Athul · online"),
            stamp("12:04 AM"),
            them("You. The one Menon sir calls his writer."),
            them("Menon sir is not answering. It is past midnight."),
            them("The lamp was to be lit for him. It has gone dark."),
            them(
              "Light the lamp for Menon sir. Or your friend Athul will not see morning.",
              { typingMs: 2500 },
            ),
            them("I will wait. Not for long."),
          ],
          options: [],
          then: "g1_menu",
        },
        {
          id: "g1_menu",
          options: [
            {
              text: "Why isn't Menon sir answering, even after midnight?",
              when: not(f("askedWhyGuard")),
              sends: "Why isn't Menon sir answering, even after midnight?",
              set: { askedWhyGuard: true },
              say: [
                them("I do not know. His phone has been dead since 11:58."),
                them(
                  "The lamp went dark at midnight. All seven wicks, at once.",
                ),
                them(
                  "That has never happened. That is why I am asking you, not him.",
                  { typingMs: 2500 },
                ),
              ],
              next: "g1_menu",
            },
            {
              text: "Your Menon sir is dead. Police are on their way. Run.",
              sends: "Your Menon sir is dead. Police are on their way. Run.",
              set: { guardBluff: true },
              say: [
                them("Dead."),
                them("You are lying. Or you are not."),
                them(
                  "If he is dead, who pays me? Who tells me what to do with the boy?",
                  { typingMs: 2500 },
                ),
              ],
              next: "g_resolve",
            },
            {
              text: "Let him walk out. Menon can't pay you anymore.",
              sends: "Let him walk out. Menon can't pay you anymore.",
              say: [
                them("It was never Menon who paid me."),
                them("He only held the pen."),
              ],
              next: "g_resolve",
            },
            {
              text: "Say nothing. Screenshot everything.",
              sends: false,
              set: { archivePhotos: true },
              say: [them("I can see you reading. Say something.")],
              next: "g_resolve",
            },
          ],
        },
        {
          id: "g_resolve",
          intro: [stamp("12:20 AM")],
          options: [],
          then: [
            { when: f("rescueCalled"), to: "g_saved" },
            { when: f("menonSoftened"), to: "g_saved" },
            {
              when: all(f("guardBluff"), f("sentLakshmi")),
              to: "g_saved",
            },
            { to: "g_lost" },
          ],
        },
        {
          id: "g_saved",
          intro: [
            when(
              them("There is a vehicle on the hill road. Blue lights."),
              f("rescueCalled"),
            ),
            when(
              them(
                "Menon sir sent word before the lamp went out. 'Let the boy walk.' I do not know why he would say that.",
              ),
              f("menonSoftened"),
            ),
            when(
              them("My phone is ringing. Delhi. Why is Delhi calling me."),
              all(not(f("rescueCalled")), not(f("menonSoftened"))),
            ),
            them("I was told this was one night of work."),
            them("I am not paid enough for this."),
            sys("Door unlocked · Athul's phone left on the floor"),
            flag({ athulSaved: true }),
            sys("Athul · offline"),
            goNewsroom,
          ],
          options: [],
          // Same chat: the ending messages follow right here
          then: "ae1",
        },
        {
          id: "g_lost",
          intro: [
            them("No."),
            them(
              "Menon sir is gone. The lamps are not. Someone with a stronger voice than yours will tell me what to do with the boy.",
              { typingMs: 3000 },
            ),
            them("Do not look for him on the hill."),
            sys("Message not delivered"),
            sys("This number is no longer available"),
            flag({ athulSaved: false }),
            goNewsroom,
            { startChat: { chatId: "unknown", delayMs: 15000 } },
          ],
          options: [],
          then: "ae1",
        },

        /* ─────────────────────────────────────────────────────────────
         * MERGED: the old "athul_end" chat. Same Athul, ending messages.
         * ───────────────────────────────────────────────────────────── */
        {
          id: "ae1",
          intro: [
            // sign ending
            when(them("bro"), isEnding("keeper")),
            when(them("dont blame yourself"), isEnding("keeper")),
            when(
              them(
                "you told me to get tea remember? funny how that turned out",
              ),
              all(isEnding("keeper"), f("sentForTea")),
            ),
            when(them("its warm here. the lamp is warm"), isEnding("keeper")),
            when(
              them("it knows your name now. it says it very nicely"),
              isEnding("keeper"),
            ),
            when(
              { from: "them", typingOnly: true, typingMs: 4000 },
              isEnding("keeper"),
            ),
            when(sys("This message was deleted"), isEnding("keeper")),
            when(sys("Athul · offline"), isEnding("keeper")),

            // quiet ending
            // Menon taken. Athul is only back if the guard let him go.
            when(stamp("5:48 AM"), all(isEnding("quiet"), f("athulSaved"))),
            when(them("bro?"), all(isEnding("quiet"), f("athulSaved"))),
            when(
              them("the door was open. the guard was gone. i just walked"),
              all(isEnding("quiet"), f("athulSaved")),
            ),
            when(
              them("bro i swear to god i need chai"),
              all(isEnding("quiet"), f("athulSaved")),
            ),
            when(
              them("ok. im ready for that tea now"),
              all(isEnding("quiet"), f("athulSaved"), f("sentForTea")),
            ),
            // The guard kept him.
            when(
              stamp("6:02 AM"),
              all(isEnding("quiet"), not(f("athulSaved"))),
            ),
            when(
              sys("Athul · last seen 11:30 PM"),
              all(isEnding("quiet"), not(f("athulSaved"))),
            ),
            when(
              sys("Message not delivered"),
              all(isEnding("quiet"), not(f("athulSaved"))),
            ),

            // hollow ending
            when(stamp("6:20 AM"), isEnding("hollow")),
            when(them("Sorry. Do I know you?"), isEnding("hollow")),
            when(
              them("Someone handed me a tea. I don't know why I wanted it."),
              all(isEnding("hollow"), f("sentForTea")),
            ),
            when(them("Wrong number, I think. Take care."), isEnding("hollow")),
            when(stamp("6:34 AM"), isEnding("hollow")),
            when(them("dont reply to this number"), isEnding("hollow")),
            when(
              them("i remember everything. theyre watching. im sorry"),
              isEnding("hollow"),
            ),

            // The quiet ending closes here (end1 / end4 close in Menon's chat)
            when(title("THE END."), isEnding("quiet")),
          ],
          options: [],
          then: END,
        },
      ],

      fallbackOptions: [{ text: "Athul?", reply: "Message not delivered." }],
    },

    {
      id: "boss",
      name: MENON_NAME,
      initials: "RM",
      avatarClass: "bg-orange-400/80",
      time: "9:08 PM",
      unread: 3,
      startHidden: true,
      initialMessages: [
        { id: 1, from: "system", variant: "stamp", text: "9:08 PM" },
        { id: 2, from: "them", text: "Where is my Munnar story?" },
        {
          id: 3,
          from: "them",
          text: "Six people are dead. Every other paper has written about it.",
        },
        {
          id: 4,
          from: "them",
          text: "And you have given me nothing. It has been many days.",
        },
      ],
      start: "b1",
      steps: [
        {
          id: "b1",
          options: [
            {
              text: "Sir, I'm still working on it.",
              say: [them("Still working. You said the same thing last week.")],
              next: "b2",
            },
            {
              text: "Athul is in Munnar right now, sir.",
              say: [
                them("I know. I sent him there."),
                them("I am asking YOU. Not Athul."),
              ],
              next: "b2",
            },
            {
              text: "The police are not telling us anything.",
              say: [them("Then find another way. That is the job.")],
              next: "b2",
            },
          ],
        },
        {
          id: "b2",
          intro: [
            stamp("9:16 PM"),
            them("The owners asked me why our best writer writes nothing."),
            them("Find something tonight, or you lose this job."),
            them(
              "Whatever Athul finds, you write it. The front page is empty for you. Print is at midnight.",
            ),
          ],
          options: [
            {
              text: "Yes sir. I'll have it ready.",
              say: [them("Good. Do not make me ask again.")],
              next: "b4",
            },
            {
              text: "Sir, you can't fire me over one story.",
              set: { suspicion: { add: 1 } },
              say: [them("Watch me.")],
              next: "b4",
            },
            {
              text: "Why are you pushing so hard, sir?",
              set: { suspicion: { add: 1 } },
              say: [
                them("Because I have waited long enough."),
                them("Do not ask me that again."),
              ],
              next: "b4",
            },
          ],
        },
        {
          id: "b4",
          intro: [flag({ menonDone: true }), sys("Menon sir · offline")],
          options: [],
          then: END,
        },

        {
          id: "s9",
          intro: [
            stamp("11:47 PM"),
            sys("Menon sir · online"),
            when(
              them(
                "Thank you for sending me the recording. Gopalan always did talk too much.",
              ),
              f("forwardedToMenon"),
            ),
            when(
              them(
                "You were rude to my guard. He was only minding Athul's phone. He's a sensitive man.",
              ),
              all(f("caughtImpostor"), not(f("gopalanAlly"))),
            ),
            when(them("I see Pillai has been talking."), f("sawLamp")),
            them("The front page is ready. I kept it empty for you."),
            them(
              "I need one more thing from you. A little of your blood, on the lamp.",
            ),
          ],
          options: [
            {
              text: "Where's Athul?",
              say: [
                them("Alive. Until midnight."),
                them("That part is up to you."),
              ],
              next: "s9_ask",
            },
            {
              text: "Open the door, Menon.",
              say: [
                them("No. We talk first."),
                them(
                  "I've waited twenty years to say this to someone who would understand.",
                ),
              ],
              next: "s9_reveal",
            },
            {
              text: "What happens at midnight?",
              say: [
                them("At midnight the paper goes to print."),
                them("Whatever is on the front page."),
              ],
              next: "s9_ask",
            },
          ],
        },
        {
          id: "s9_ask",
          options: [
            {
              text: "Up to me? What do you want from me?",
              sends: "Up to me? What do you want from me?",
              say: [
                them("Listen first. Then decide."),
                them("You deserve to know what you're bleeding for."),
              ],
              next: "s9_reveal",
            },
            {
              text: "Why are you doing this, Menon?",
              sends: "Why are you doing this, Menon?",
              say: [
                them("Because it was done to me."),
                them("Let me tell you how it began."),
              ],
              next: "s9_reveal",
            },
            {
              text: "Stop stalling. Just tell me.",
              sends: "Stop stalling. Just tell me.",
              say: [them("Fine. From the beginning.")],
              next: "s9_reveal",
            },
          ],
        },
        {
          id: "s9_reveal",
          intro: [
            them("I was 28. Twenty years ago.", { typingMs: 2000 }),
            them(
              "Sudhakaran was my best friend. He took the photos. I wrote the story.",
            ),
            them(
              "Our editor Thampi sent us up Vilakkumala hill. Just to check a rumour about lamps.",
            ),
            { from: "them", typingOnly: true, typingMs: 3000 },
            them("It was not a rumour."),
            them(
              "Six men in white. Six lamps on the ground. And six dead people lying in front of them.",
              { typingMs: 3000 },
            ),
            them("I can still see it. Every night. When I close my eyes."),
            { from: "them", typingOnly: true, typingMs: 2500 },
            them("They call themselves the Keepers."),
            them(
              "Six men, one lamp each. A retired police officer. An estate owner. A government officer. A doctor. A lawyer. A temple trustee.",
              { typingMs: 3000 },
            ),
            them("Good people. That is what the whole town thinks."),
            them(
              "They have a deal with something on that hill. It started in 1966. It is sixty years old.",
              { typingMs: 3000 },
            ),
            them("Every 20 years, six people must die. One lamp for each one."),
            them("And there is a seventh lamp. For the man who signs."),
            them("If you sign, you get anything you want. For 20 years."),
            { from: "them", typingOnly: true, typingMs: 2500 },
            them("Three men have signed so far."),
            them("Tonight will be the fourth."),
          ],
          options: [
            {
              text: "I... I don't understand. Why would anyone do that?",
              sends: "I... I don't understand. Why would anyone do that?",
              say: [
                them("You're frightened. Good. It means you are still honest."),
                them("Let me finish. Then you will understand."),
              ],
              next: "s9_rule",
            },
            {
              text: "Why are you telling me this?",
              sends: "Why are you telling me this?",
              say: [
                them(
                  "Because I've waited twenty years to tell someone who would understand.",
                ),
              ],
              next: "s9_rule",
            },
            {
              text: "Is any of this even real?",
              sends: "Is any of this even real?",
              say: [
                them(
                  "Ask the six families. Ask Gopalan. Ask Thampi, if he will still pick up the phone.",
                ),
              ],
              next: "s9_rule",
            },
          ],
        },
        {
          // CHANGE: the Keepers (not Menon) take the sacrifice. One of them
          // decides which of the two dies. The one who lives signs with his
          // OWN blood, spilled on the lamp. Sudhakaran's blood was never
          // the signature.
          id: "s9_rule",
          intro: [
            flag({ knowsSignerRule: true }),
            them(
              "They didn't let us leave. They said the bargain needs a seventh lamp, and one of us would burn on it.",
            ),
            them(
              "The Keepers decide who. No lots, no vote. One of them looks at the two of you and chooses. That night it was the retired police officer. He looked at Sudhakaran.",
              { typingMs: 3500 },
            ),
            them(
              "Sudhakaran didn't even look at them. He caught my arm and whispered, 'Let's go. This is dangerous. We'll find a way out, together.'",
              { typingMs: 3500 },
            ),
            them("He meant it. He would never have left me there."),
            them(
              "And I stayed. God help me, I wanted the chair more than I wanted my friend. I didn't run and I didn't speak. Two of them took him by the arms.",
              { typingMs: 4000 },
            ),
            them(
              "They laid him on the seventh lamp. They did it, not me. I only stood there and let them.",
              { typingMs: 3000 },
            ),
            them(
              "Then the officer turned to me. The one who lives signs. Not with ink. With his own blood, spilled on the lamp. Not Sudhakaran's. Mine.",
              { typingMs: 3500 },
            ),
            them(
              "I cut my thumb on the brass and let it fall on the seventh wick. That was my signature.",
              { typingMs: 3000 },
            ),
            them(
              "What you write signs nothing. The story is only paper, it gives the name its shape. The signature is the blood of the one who lives.",
              { typingMs: 3000 },
            ),
            them(
              "Six lamps for the six they kill. The seventh for the last sacrifice. Whoever burns on it is named as the killer of the other six.",
              { typingMs: 3500 },
            ),
            them(
              "I wrote what they gave me. That the killer was Sudhakaran. A madman, a dead suspect, case closed. My best friend, in my own words. My name was on it. It has been on it ever since.",
              { typingMs: 3500 },
            ),
            them(
              "And the world forgets. In a year it is one line in an old file.",
            ),
          ],
          options: [
            {
              text: "The seventh lamp.",
              sends: "The seventh lamp. That's the story, isn't it.",
              say: [
                them(
                  "Yes. The seventh lamp is lit by blood. The story that closes the case only gives the name its shape.",
                ),
                them(
                  "That is how you sell your soul to whatever answers on that hill. Call it the devil if you like.",
                ),
              ],
              next: "s9_name",
            },
            {
              text: "And Sudhakaran?",
              sends: "And Sudhakaran?",
              say: [
                them(
                  'I wrote that he was the killer, and that he "fell from the hill". Those are my lines.',
                ),
                them(
                  "His father came to my desk and said, 'My son would never do that.' I had him thrown out. He never came back.",
                ),
                them(
                  "Sudhakaran asked me to run with him. I stayed. That is the one line I cannot write over.",
                ),
              ],
              next: "s9_name",
            },
            {
              text: "You killed your best friend.",
              sends: "You killed your best friend.",
              say: [
                them(
                  "Not with my hand. The Keepers did that. I stood still and let them.",
                ),
                them(
                  "It comes to the same thing. I've had twenty years to find a better word for it than greed. I haven't.",
                ),
              ],
              next: "s9_name",
            },
          ],
        },
        {
          id: "s9_name",
          intro: [
            them(
              "Thampi signed in 1986. The man before him brought him up that hill with his own photographer, Narayanan. The Keepers chose Narayanan. Narayanan's name is on the 1986 story, as the killer. He did not come home.",
              { typingMs: 3500 },
            ),
            them(
              "When the bargain comes round again, whoever holds it brings the Keepers two people. A new writer and a friend. One of the Keepers decides which of the two is sacrificed. The one who lives signs with his own blood. In 2006 Thampi brought them me and Sudhakaran.",
              { typingMs: 3500 },
            ),
            them(
              "The moment my blood reached the seventh wick, Thampi's bargain ended and mine began. He walked away free. He stepped down as Chief Editor that same month and I took his chair. He has not spoken to me since.",
              { typingMs: 3500 },
            ),
            them("Tonight I bring them you and Athul."),
            them(
              "One of the Keepers has already chosen. It is Athul. You will not have to lift a hand against him. They do that. You only have to bleed on the lamp.",
              { typingMs: 3000 },
            ),
          ],
          options: [
            {
              text: "This is insane.",
              sends: "This is insane.",
              say: [them("It is. It has also worked for sixty years.")],
              next: "s9_last",
            },
            {
              text: "Why me?",
              sends: "Why me?",
              say: [
                them(
                  "You never leave the desk before midnight. I've read everything you've written. You're better than I ever was.",
                ),
                them(
                  "And Athul is your closest friend. The Keepers want a pair who would burn for each other. I chose carefully.",
                ),
              ],
              next: "s9_last",
            },
            {
              text: "Where is Athul right now?",
              sends: "Where is Athul right now?",
              say: [them("On the hill. Breathing. For now.")],
              next: "s9_last",
            },
          ],
        },
        {
          id: "s9_last",
          intro: [
            them("Athul is the price. You are the name."),
            them(
              "The story is ready. It says Athul is the killer, and it carries your name.",
            ),
            them(
              "Your name goes on the story. Your blood goes on the seventh wick. That is all it takes.",
            ),
            clip(
              "screen",
              "MUNNAR KILLER FOUND DEAD ON VILAKKUMALA. POLICE CLOSE CASE.",
              {
                byline: "By you",
                body: "The suspect, named as Athul K., 29, a reporter with this newspaper, was found dead on the hill beside objects linked to all six murders.",
              },
            ),
            them(
              "I haven't had a friend in twenty years. It's hard to keep one when you know how this ends.",
              { typingMs: 3000 },
            ),
            them(
              "Hear the rules before you choose. I won't lie to you tonight.",
            ),
            them(
              "Spill your blood on the lamp, and for twenty years you can have anything you want. My chair, money, a name every editor in Kerala fears. Athul is found on the hill, named as the killer. His mother reads it with her tea.",
              { typingMs: 3500 },
            ),
            stamp("11:52 PM"),
            them(
              "Eight minutes. Spill your blood on the lamp, and the story runs. Or don't.",
            ),
          ],
          options: [],
          then: "s10_menu",
        },

        {
          id: "s10_menu",
          options: [
            {
              text: "Spill my blood on the lamp. I live. Athul pays for it.",
              sends: "Fine. I'll spill my blood on the lamp.",
              next: "sign_blood",
            },
            {
              text: "What happens if I don't?",
              sends: "What happens if I don't?",
              when: not(f("askedConsequence")),
              next: "s11x",
            },
            {
              text: "Refuse. Walk to the door.",
              sends: "No. I'm leaving.",
              next: "s11a",
            },
            {
              text: 'Bargain: "Athul walks out alive or I don\'t spill my blood."',
              sends: "Athul walks out alive or I don't spill my blood.",
              when: not(f("bargained")),
              next: "s11b",
            },
            {
              // NEW: evidence option. Only available if the player worked
              // out from the archive that Thampi stepped down the month
              // Menon took his chair, and has real evidence in hand.
              text: 'Turn on him: "Thampi stepped down the month your story ran. I know what happens to you tonight."',
              sends:
                "Thampi stepped down the month your story ran, and you took his chair. Twenty years later, it's you. If I don't bleed on that lamp, they take YOU.",
              when: not(f("threatened")),
              requires: all(f("foundPattern"), evidenceReady),
              lockedHint: "You don't have the proof to say it yet.",
              next: "s11e",
            },
            {
              text: "Send everything to the outside world.",
              sends: false,
              when: not(f("usedSend")),
              requires: all(evidenceReady, not(f("forwardedToMenon"))),
              lockedHint: [
                {
                  when: f("forwardedToMenon"),
                  text: "No signal. The floor is jammed.",
                },
                { text: "You don't know enough yet." },
              ],
              next: "s11d",
            },
          ],
        },

        {
          // NEW: the player asks what happens if they refuse. Menon
          // manipulates. The truth (nobody signs = HE is taken) is hidden.
          id: "s11x",
          intro: [
            stamp("11:53 PM"),
            flag({ askedConsequence: true }),
            { from: "them", typingOnly: true, typingMs: 3500 },
            them("Then wait for the consequences."),
            them(
              "The story still runs. Your name is on it. Nothing needs your hand. The debt binds you anyway, only without the chair, the money, or anything you want.",
              { typingMs: 3000 },
            ),
            them(
              "The Keepers do not forgive an empty lamp. They come for the one who refused. Your family. Your flat. Your name in every editor's mouth.",
              { typingMs: 3000 },
            ),
            them(
              "And Athul? A man branded a murderer does not stay free for long. Maybe he walks down that hill. Maybe he doesn't.",
              { typingMs: 3000 },
            ),
            them("I am only telling you what I have seen."),
          ],
          options: [],
          then: "s10_menu",
        },

        {
          // CHANGE: refusing no longer ends with a debt on the player.
          // Menon bluffs about consequences, but with no signature the
          // truth arrives at midnight: he is the one who is taken.
          id: "s11a",
          intro: [
            stamp("11:54 PM"),
            them(
              "Pillai is standing at the stairs door. I can see him on the camera.",
            ),
            them("His hands are shaking. Do try."),
            them("Go on. Then wait for the consequences."),
          ],
          options: [
            {
              text: "Text Pillai: open the stairs. Please.",
              sends: "Pillai, open the stairs. Please.",
              say: [
                them("He won't answer you."),
                them(
                  "He was the office boy in 2006. He lit that lamp the morning after. He still does.",
                ),
                them("He knows what this is. He has always known."),
              ],
              next: "end3",
            },
            {
              text: "Pull the fire alarm.",
              sends: false,
              say: [
                sys("Fire alarm triggered · 11:56 PM"),
                sys("Fire alarm silenced · 11:56 PM"),
                them(
                  "It only rings in my cabin, I'm afraid. It was changed years ago.",
                ),
                them(
                  "The front page already has your name on it. You never touched it.",
                ),
              ],
              next: "end3",
            },
            {
              text: "Open the door or I'll break the glass.",
              sends: "Open the door or I break the glass.",
              say: [
                them(
                  "Break whatever you like. The paper goes to print at 11:59:30.",
                ),
                sys("System · Byline set automatically: You · 11:57 PM"),
                them("Look at the front page. That name will follow you."),
              ],
              next: "end3",
            },
          ],
        },

        {
          id: "s11b",
          intro: [
            stamp("11:54 PM"),
            flag({ bargained: true }),
            them("I can't save him. The Keepers decide. I only hold the pen."),
          ],
          options: [
            {
              text: "Then I spill my blood, and I tell everyone what you did.",
              say: [
                them("Tell them. Nobody believes the Chief Editor's writer."),
                them("Nobody believed me when I tried, in 2007."),
              ],
              next: "s11b_return",
            },
            {
              text: "Then you spill yours. Again.",
              say: [
                them("I can't. A soul can't be sold twice."),
                them(
                  "The Keepers need two people brought to the hill. One to be taken, one to bleed. I have no one left to bring them.",
                ),
              ],
              next: "s11b_return",
            },
            {
              text: "Then we both go down.",
              say: [
                them("You think I haven't thought of it?"),
                them(
                  "Two are needed. One taken, one who signs. That is how they count.",
                ),
                them("I just never had anyone left to put there."),
              ],
              next: "s11b_return",
            },
            {
              text: "...Fine. Tell me what you can do.",
              say: [
                them(
                  "Spill your blood on the lamp. I'll ask them to let Athul walk down the hill by morning.",
                ),
                them(
                  "He will say nothing, to anyone, ever. And he will not remember you. Not your name, not three years of covering for each other.",
                ),
                them(
                  "He walks down alive. A stranger. That is what they take instead.",
                ),
              ],
              next: "s11b_deal",
            },
          ],
        },
        {
          id: "s11b_deal",
          options: [
            {
              text: "Accept the deal.",
              sends: "Fine. Do it. I'll spill my blood on the lamp.",
              set: { dealSign: true },
              next: "sign_blood",
            },
            {
              text: "Refuse. Go back.",
              sends: "No. Not like that.",
              next: "s11b_return",
            },
          ],
        },
        {
          id: "s11b_return",
          intro: [stamp("11:55 PM")],
          options: [],
          then: "s10_menu",
        },

        {
          id: "s11d",
          intro: [
            stamp("11:53 PM"),
            them("Where did you go. You stopped answering."),
            sys("1 signal bar"),
          ],
          options: [
            {
              text: "Lakshmi Nair, an old college friend who runs a desk at a rival paper in Delhi.",
              sends: false,
              set: { evidenceSent: true, sentLakshmi: true, usedSend: true },
              say: [
                flag({ rescueCalled: true }, f("liveLocation")),
                goLakshmi,
                them("Who are you messaging."),
              ],
              next: "s10_menu",
            },
            {
              text: "The Munnar police.",
              sends: false,
              set: { evidenceSent: true, tippedKeepers: true, usedSend: true },
              say: [
                goPolice,
                them("Munnar just called me. Why would you do that?"),
              ],
              next: "s10_menu",
            },
            {
              text: "The all-staff mailing list.",
              sends: false,
              set: { usedSend: true },
              say: [
                sys("Mail delivery failed · blocked by administrator"),
                them("Cute."),
              ],
              next: "s10_menu",
            },
          ],
        },

        {
          // NEW: evidence confrontation. The player worked out that Thampi
          // stepped down the month Menon took his chair, so Menon's own
          // twenty years end tonight. If nobody bleeds on the lamp, they
          // take HIM. This is the truth Menon was hiding.
          id: "s11e",
          intro: [
            stamp("11:54 PM"),
            flag({ threatened: true }),
            { from: "them", typingOnly: true, typingMs: 4000 },
            them("..."),
            them("Who told you that."),
            them("Nobody was supposed to count the years."),
          ],
          options: [
            {
              text: "It's in the archive. Thampi stepped down in March 2006 and you took his chair. Your twenty years end tonight.",
              sends:
                "It's in the archive. Thampi stepped down in March 2006 and you took his chair. Your twenty years end tonight.",
              say: [
                them("Thampi walked away alive. Because I signed."),
                them(
                  "A bargain has to pass to someone. If it cannot pass, it takes the one who holds it.",
                ),
              ],
              next: "s11e_2",
            },
            {
              text: "So the consequences you threatened me with were lies. If I don't bleed on that lamp, they take YOU.",
              sends:
                "So the consequences you threatened me with were lies. If I don't bleed on that lamp, they take YOU.",
              say: [
                them("Yes."),
                them(
                  "I should have run down that hill with him twenty years ago. He asked me to.",
                ),
              ],
              next: "s11e_2",
            },
            {
              text: "Gopalan kept Sudhakaran's last roll of film. There's a photograph of you on the hill.",
              when: knowsRoll,
              set: { menonSoftened: true },
              sends:
                "Gopalan kept Sudhakaran's last roll of film. There's a photograph of you on the hill.",
              say: [
                them("...He took mine? I never saw one."),
                { from: "them", typingOnly: true, typingMs: 8000 },
                them("Was I smiling?"),
              ],
              next: "s11e_2",
            },
          ],
        },
        {
          id: "s11e_2",
          intro: [
            stamp("11:56 PM"),
            them(
              "Spill your blood on the lamp, and I will make you everything I became. Please.",
            ),
            them("I have never said please to anyone in twenty years."),
          ],
          options: [
            {
              text: "No. I'm not giving them Athul.",
              sends: "No. I'm not giving them Athul.",
              say: [
                them("Then I will not die kindly."),
                them("Do you understand what you are choosing?"),
              ],
              next: "s11e_end",
            },
            {
              text: "Call off your guard. Let Athul go. Now.",
              sends: "Call off your guard. Let Athul go. Now.",
              say: [
                them("I can't."),
                them("The guard doesn't answer to me. He answers to them."),
                them("I only ever held the pen."),
              ],
              next: "s11e_end",
            },
            {
              text: "I'll watch you go down.",
              sends: "I'll watch you go down.",
              say: [them("Then watch.")],
              next: "s11e_end",
            },
          ],
        },
        {
          id: "s11e_end",
          intro: [
            stamp("11:58 PM"),
            sys(
              "Lobby · the brass lamp flickers. All six flames lean toward the stairs.",
            ),
            them("They are here early."),
            them(
              "Do not answer the door. If it knocks in his voice, do not answer.",
            ),
          ],
          options: [],
          then: "end3",
        },

        {
          // CHANGE: the one who lives signs with his OWN blood, spilled on
          // the lamp. Menon says "spill your blood on the lamp" instead of
          // "sign".
          id: "sign_blood",
          intro: [
            stamp("11:55 PM"),
            them("Good."),
            them(
              "But ink means nothing to them. The one who lives signs with his own blood.",
            ),
            them(
              "Come down to the lobby. The brass lamp is on the floor where I set it down. Six wicks are lit. The seventh is waiting for you.",
              { typingMs: 3000 },
            ),
            them(
              "You will spill your own blood on the lamp. Not Athul's. Yours. Let it fall on the seventh wick.",
              { typingMs: 3000 },
            ),
            sys("Access control · Stairwell B unlocked"),
            them("Pillai will not stop you. Come. Quickly."),
          ],
          options: [
            {
              text: "Walk down to the lobby.",
              sends: false,
              say: [
                stamp("11:57 PM"),
                sys("Your footsteps echo down the empty stairwell."),
                sys(
                  "The lobby is dark. Pillai stands by the door with his eyes on the floor.",
                ),
                sys(
                  "The brass lamp stands on the floor in the middle of the room, where Menon set it down. Six flames. One dark wick.",
                ),
                them(
                  "There you are. Do not look at the door. Look at the lamp.",
                ),
                them(
                  "Cut your thumb on the sharp edge of the brass. Spill your blood on the seventh wick.",
                  { typingMs: 3000 },
                ),
              ],
              next: "sign_lobby",
            },
          ],
        },
        {
          id: "sign_lobby",
          options: [
            {
              text: "Cut your thumb on the lamp and spill your blood on the seventh wick.",
              sends: false,
              set: { bloodSigned: true },
              say: [
                sys("The brass bites into your thumb. Blood wells up."),
                sys("A drop of your blood falls onto the seventh wick."),
              ],
              next: "sign_done",
            },
            {
              text: "Think of Athul. Then spill your blood on the lamp.",
              sends: false,
              set: { bloodSigned: true },
              say: [
                sys(
                  "You think of Athul in the fog, laughing at his own blurry selfie.",
                ),
                sys(
                  "You press your thumb to the brass. Your blood falls onto the seventh wick.",
                ),
              ],
              next: "sign_done",
            },
            {
              text: "Spill your blood on the lamp. Don't look at anyone.",
              sends: false,
              set: { bloodSigned: true },
              say: [
                sys("Your hand is shaking. The blood falls anyway."),
                sys("It lands on the seventh wick without a sound."),
              ],
              next: "sign_done",
            },
          ],
        },
        {
          id: "sign_done",
          intro: [
            stamp("11:59 PM"),
            sys("The seventh wick catches fire by itself."),
            sys("Seven flames burn. The lobby goes very quiet."),
            them("It is done.", { typingMs: 1500 }),
            them("Go back up. The story runs at midnight."),
          ],
          options: [],
          then: [{ when: f("dealSign"), to: "end4" }, { to: "end1" }],
        },

        {
          id: "end1",
          intro: [
            flag({ ending: "keeper" }),
            stamp("12:00 AM"),
            sys("System · Signed in blood · SENT TO PRINT"),
            sys(
              "In the lobby, the seventh flame leans toward the stairs. Then toward you.",
            ),
            them("Thank you."),
            them("Do not wipe your thumb. It will not come off."),
            sys(
              "The cut on your thumb has closed. The blood on it is still wet.",
            ),
            them("It will feel small tonight. A name above a story."),
            them("It stops feeling small by morning."),
            sys("Your phone camera opens by itself."),
            sys(
              "Front camera · Six people in white stand behind you. A seventh place is empty. Their faces are not finished.",
            ),
            them("Do not turn around."),
            them("They are only counting."),
            them("They found him on the hill at 12:10. Now the story is true."),
            them("The chair is yours. The pen is theirs."),
            them(
              "From tomorrow, ask for anything. It will be given. That is how it starts.",
            ),
            { from: "them", typingOnly: true, typingMs: 4000 },
            them(
              "Every wish takes something small. You will notice only when you cannot remember a face.",
              { typingMs: 3000 },
            ),
            them("One day you will not remember his."),
            sys("Menon sir · offline"),
            sys("The lobby lamp burns without oil."),
            sys(
              "Somewhere above the ceiling, a voice begins to count twenty years aloud.",
            ),
            goAthulEnd,
            goNewsroom,
            title("THE END."),
            { startChat: { chatId: "unknown", delayMs: 12000 } },
          ],
          options: [],
          then: END,
        },
        {
          // CHANGE: this is now THE ending for "nobody bled on the lamp".
          // Menon's threats about consequences were a bluff. The truth:
          // with no signature, the bargain takes the one who holds it.
          id: "end3",
          intro: [
            flag({ ending: "quiet" }),
            stamp("12:00 AM"),
            them("It is midnight."),
            them("Nobody signed. Nobody bled on the lamp."),
            when(
              them("You knew. You counted the years. Then you let me burn."),
              f("threatened"),
            ),
            when(
              them(
                "I told you there would be consequences. I did not say for whom.",
              ),
              not(f("threatened")),
            ),
            sys(
              "In the lobby, the brass lamp goes out. All seven wicks at once.",
            ),
            them("I can smell wet earth."),
            them(
              "It is at my door. It is wearing his face. It is not Sudhakaran.",
              { typingMs: 3000 },
            ),
            them(
              "It does not want your blood. It wants the one who still owes.",
            ),
            sys("Something heavy drags across the floor of the cabin."),
            them(
              "It takes my soul tonight. And then it stops. The bargain ends with me.",
              { typingMs: 3000 },
            ),
            them(
              "The guard will keep Athul until they tell him otherwise. I cannot call him off anymore.",
            ),
            them("Not yet. Not y", { typingMs: 400 }),
            sys("Message not delivered"),
            sys("Raghavan Menon · last seen 12:00 AM"),
            goPillaiEnd,
            goGuard,
          ],
          options: [],
          then: END,
        },
        {
          id: "end4",
          intro: [
            flag({ ending: "hollow" }),
            sys("System · Signed · SENT TO PRINT"),
            them("They keep their word. In their way."),
            them("Do not wipe your thumb. It will not come off."),
            sys("Your reflection in the brass lamp is not looking at you."),
            goAthulEnd,
            goNewsroom,
            title("THE END."),
          ],
          options: [],
          then: END,
        },
      ],
      fallbackOptions: [{ text: "Sir?", reply: "Midnight. Do not forget." }],
    },

    {
      id: "pillai",
      name: "Pillai (Night Security)",
      initials: "P",
      avatarClass: "bg-slate-500/90",
      time: "11:34 PM",
      unread: 1,
      startHidden: true,
      initialMessages: [],
      start: "p1",
      steps: [
        {
          id: "p1",
          intro: [
            stamp("11:34 PM"),
            by("Pillai", "Sir, please read this. It is very important."),
            // CHANGE: removed "You don't know me". The player already knows
            // Pillai from the office, so he just introduces himself briefly.
            by(
              "Pillai",
              "It is Pillai, sir. Night security, in your office building.",
            ),
            by(
              "Pillai",
              "I see you working late every night. That is why I am telling you this.",
            ),
            by("Pillai", "Something is wrong tonight, sir. Very wrong."),
            // CHANGE: "vilaku" wording replaced with "lamp", and Menon is
            // clearly standing in front of the lamp.
            by(
              "Pillai",
              "Menon sir came down to the lobby at 10:30. He was holding a big brass lamp, sir. He lit it himself, and then he stood there holding it for an hour, talking on the phone",
            ),
            flag({ sawLamp: true }),
          ],
          options: [
            {
              text: "Send me a photo of it.",
              sends: "Send me a photo of it.",
              set: { lampPhoto: true },
              say: [
                by("Pillai", "Sir I cannot"),
                by("Pillai", "...", { typingMs: 3000 }),
                pic(
                  IMG("menon.avif"),
                  "A CCTV photo of the dark lobby. Menon stands alone holding a brass lamp in both hands, six flames lit, one left dark. A folded sheet of paper is tucked under his arm.",
                ),
                by("Pillai", "Sir please delete this chat after reading"),
              ],
              next: "p2",
            },
            {
              text: "Who was he talking to?",
              sends: "Who was he talking to?",
              say: [
                by("Pillai", "I only heard a little sir"),
                by(
                  "Pillai",
                  "He said, six are lit. The seventh is ready. Then he saw me and stopped talking",
                ),
              ],
              next: "p2",
            },
            {
              text: "How long has that lamp been there?",
              sends: "How long has that lamp been there?",
              say: [
                by(
                  "Pillai",
                  "Since the day this building opened sir. March 2006. Menon sir lit it himself, and nobody has moved it since",
                ),
                by(
                  "Pillai",
                  "Every morning I light one flame on it. Only one. He told me never to light more",
                ),
                by(
                  "Pillai",
                  "He said that one flame is for someone who is gone. I never asked who",
                ),
                by(
                  "Pillai",
                  "Tonight he lit six, sir. I don't know why. Six, and he was waiting for something",
                ),
              ],
              next: "p2",
            },
          ],
        },
        {
          id: "p2",
          intro: [
            by(
              "Pillai",
              "Sir, Menon sir has ordered me to lock the stairs and the main door. After 11:30 nobody can leave",
            ),
            by("Pillai", "I am very sorry sir. I have a daughter."),
            stamp("11:36 PM"),
            sys("Access control · Main door locked"),
            sys("Access control · Stairwell B locked"),
            by("Pillai", "Please be careful sir. I am not able to help you."),
            flag({ pillaiDone: true }),
          ],
          options: [],
          then: END,
        },
      ],
      fallbackOptions: [{ text: "Pillai?", reply: "Sir I am sorry." }],
    },

    {
      id: "pillai_end",
      name: "Pillai (Night Security)",
      initials: "P",
      avatarClass: "bg-slate-500/90",
      time: "12:01 AM",
      unread: 1,
      startHidden: true,
      initialMessages: [],
      start: "pe1",
      steps: [
        {
          id: "pe1",
          intro: [
            when(stamp("12:01 AM"), isEnding("quiet")),
            when(sys("Access control · Main door unlocked"), isEnding("quiet")),
            when(by("Pillai", "Sir the doors are open"), isEnding("quiet")),
            when(
              by(
                "Pillai",
                "Sir, the lamp went out. All seven flames at once. I have lit it every morning for twenty years",
              ),
              isEnding("quiet"),
            ),
            when(
              by(
                "Pillai",
                "Menon sir's cabin is open. Nobody inside. The carpet is wet and it smells like the hill. I will not go in",
              ),
              isEnding("quiet"),
            ),
          ],
          options: [],
          then: END,
        },
      ],
      fallbackOptions: [{ text: "Pillai?", reply: "Sir I am sorry." }],
    },

    {
      id: "lakshmi",
      name: "Lakshmi Nair",
      initials: "LN",
      avatarClass: "bg-pink-500/80",
      time: "11:56 PM",
      unread: 1,
      startHidden: true,
      initialMessages: [],
      start: "l1",
      steps: [
        {
          id: "l1",
          intro: [
            by("Lakshmi", "Got your files. Is this real??"),
            by(
              "Lakshmi",
              "Three front pages, an obituary, a recording. Where are you?",
            ),
            by("Lakshmi", "Sending to my editor now."),
            when(
              by(
                "Lakshmi",
                "I have your live location. Sent it to a police chief I trust. He's on his way.",
              ),
              f("liveLocation"),
            ),
            by("Lakshmi", "Stay alive."),
          ],
          options: [],
          then: END,
        },
      ],
      fallbackOptions: [{ text: "Lakshmi?", reply: "Typing…" }],
    },

    {
      id: "police",
      name: "Munnar Police Station",
      initials: "MP",
      avatarClass: "bg-blue-600/80",
      time: "11:56 PM",
      unread: 1,
      startHidden: true,
      initialMessages: [],
      start: "po1",
      steps: [
        {
          id: "po1",
          intro: [
            by("Munnar PS", "Thank you for the information."),
            by("Munnar PS", "Please stay where you are."),
          ],
          options: [],
          then: END,
        },
      ],
      fallbackOptions: [
        { text: "Hello?", reply: "Please stay where you are." },
      ],
    },

    {
      id: "newsroom",
      name: "Kerala Dispatch · Newsroom",
      initials: "KD",
      avatarClass: "bg-indigo-500/80",
      time: "7:40 AM",
      unread: 1,
      startHidden: true,
      initialMessages: [],
      start: "n1",
      steps: [
        {
          id: "n1",
          intro: [
            stamp("Next morning · 7:40 AM"),
            when(
              by(
                "Nisha (Features)",
                "Is it true about Athul?? Your story says he killed those people",
              ),
              f("ending", { is: "keeper" }),
            ),
            when(
              by("Nisha (Features)", "Nobody here believes it. Nobody."),
              f("ending", { is: "keeper" }),
            ),
            when(
              by(
                "Biju (Desk)",
                "Menon sir didn't come in. His cabin's empty. His chair too",
              ),
              f("ending", { is: "keeper" }),
            ),
            when(
              by(
                "HR",
                "Appointment order: Acting Chief Editor, starting today.",
              ),
              f("ending", { is: "keeper" }),
            ),
            when(
              by(
                "Biju (Desk)",
                "Menon sir's cabin was locked from inside. When they opened it the carpet was wet and the room smelled of lamp oil. Nobody was in it",
              ),
              f("ending", { is: "quiet" }),
            ),
            when(
              by(
                "Biju (Desk)",
                "Athul's mother called. He walked down the hill this morning. Alive.",
              ),
              all(f("ending", { is: "quiet" }), f("athulSaved")),
            ),
            when(
              by(
                "Biju (Desk)",
                "Athul never came down. The search party found his phone on the bare rock where the lamps were. Seven burn marks in a row",
              ),
              all(f("ending", { is: "quiet" }), not(f("athulSaved"))),
            ),
            when(
              by(
                "Nisha (Features)",
                "Police say he must have fallen. They said it before the search even began",
              ),
              all(f("ending", { is: "quiet" }), not(f("athulSaved"))),
            ),
            when(
              by(
                "Nisha (Features)",
                "Police met him at the bottom. Lakshmi's paper ran the 2006 front page with the story. Arrests today.",
              ),
              all(f("ending", { is: "quiet" }), cleanTip, f("rescueCalled")),
            ),
            when(
              by(
                "Biju (Desk)",
                "Story runs. But the men behind it ran away before any arrests. Vilakkumala is quiet. For now.",
              ),
              all(
                f("ending", { is: "quiet" }),
                cleanTip,
                not(f("rescueCalled")),
              ),
            ),
            when(
              by(
                "Biju (Desk)",
                "Nobody will ever know. It all stops with Menon. The men on the hill are still there.",
              ),
              all(f("ending", { is: "quiet" }), not(cleanTip)),
            ),
            when(
              by(
                "Nisha (Features)",
                "Welcome to the cabin, sir. Menon sir left you the key",
              ),
              f("ending", { is: "hollow" }),
            ),
            when(
              by(
                "Biju (Desk)",
                "Athul's back from Munnar. Resigned this morning. Won't talk to anybody.",
              ),
              f("ending", { is: "hollow" }),
            ),
            when(stamp("March 2046"), f("ending", { is: "keeper" })),
            when(
              sys(
                "Twenty years later. Your bargain is due tonight. Pass it on, or go down.",
              ),
              f("ending", { is: "keeper" }),
            ),
            // CHANGE: the 2046 ending. The sixth body is found near Munnar,
            // every other paper has run it, and Fathima asks whether to keep
            // Arjun at the desk to write it and send Vishnu to Munnar to cover it.
            when(
              by(
                "Intern Fathima",
                "Sir, the sixth body was found near Munnar this morning. Head missing, like the others.",
              ),
              f("ending", { is: "keeper" }),
            ),
            when(
              by(
                "Intern Fathima",
                "Every other paper has run it already. We have to cover it, sir.",
              ),
              f("ending", { is: "keeper" }),
            ),
            when(
              by(
                "Intern Fathima",
                "Shall I keep Arjun in the office to write it? I'll send Vishnu to Munnar tonight to cover it.",
              ),
              f("ending", { is: "keeper" }),
            ),
          ],
          options: [],
          then: END,
        },
      ],
      fallbackOptions: [{ text: "...", reply: "" }],
    },

    {
      id: "unknown",
      name: "Unknown number",
      initials: "?",
      avatarClass: "bg-zinc-500/90",
      time: "12:00 AM",
      unread: 1,
      startHidden: true,
      initialMessages: [
        { id: 1, from: "them", text: "bro finally reached munnar" },
        { id: 2, from: "them", text: "its like 9pm" },
      ],
      start: "silence",
      steps: [{ id: "silence", options: [], then: END }],
      fallbackOptions: [{ text: "Athul?", reply: "..." }],
    },
  ],
};

// ───────────────── DEBUG: jump straight to a chat / step ─────────────────
type JumpTarget = { chat: string; step?: string; flags?: Effects };

// Option A: hardcode a target here while testing (set back to null when done).
// e.g. { chat: "boss", step: "s10_menu" }
// To test the merged guard scene: { chat: "athul", step: "g1" }
const DEBUG_JUMP: JumpTarget | null = null;

// Option B: no code edit, use the URL in dev: ?jump=boss:s10_menu
// (the step is optional: ?jump=pillai)
// Guard scene: ?jump=athul:g1

// Flags the skipped steps would normally have set. Override per jump via `flags`.
const JUMP_FLAGS: Effects = {
  menonDone: true,
  pillaiDone: true,
  sawArchive: true,
  knowsMenon: true,
  hasRecording: true,
  archivePhotos: true,
  ridgePhoto: true,
  liveLocation: true,
  sawLamp: true,
  gopalanAlly: true,
  knowsSignerRule: true,
  foundPattern: true,
  suspicion: 3,
};

const readJump = (): JumpTarget | null => {
  const isDev = Boolean(
    (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV,
  );
  if (!isDev) return null;
  if (typeof window !== "undefined") {
    const q = new URLSearchParams(window.location.search).get("jump");
    if (q) {
      const [chat, step] = q.split(":");
      return { chat, step };
    }
  }
  return DEBUG_JUMP;
};

const withDebugJump = (cfg: GameConfig): GameConfig => {
  const t = readJump();
  if (!t) return cfg;

  const target = cfg.chats.find((c) => c.id === t.chat);
  if (!target) {
    console.warn(`[jump] no chat "${t.chat}"`);
    return cfg;
  }
  const stepId = t.step ?? target.start;
  if (!target.steps.some((s) => s.id === stepId)) {
    console.warn(`[jump] no step "${stepId}" in chat "${t.chat}"`);
    return cfg;
  }

  const patched = {
    ...target,
    startHidden: false,
    start: stepId,
    steps: target.steps.map((s) =>
      s.id === stepId
        ? {
            ...s,
            intro: [
              flag({ ...JUMP_FLAGS, ...(t.flags ?? {}) }),
              ...(s.intro ?? []),
            ],
          }
        : s,
    ),
  };

  // Put the target first so it's the one that opens.
  return {
    ...cfg,
    chats: [patched, ...cfg.chats.filter((c) => c.id !== t.chat)],
  };
};

export const sevenLamps: GameConfig = withDebugJump(withPacing(storyConfig));
