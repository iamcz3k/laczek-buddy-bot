export type CommandCategory = {
  name: string;
  commands: string[];
};

const commands = (value: string) => value.trim().split(/\s+/);

export const commandCategories: CommandCategory[] = [
  { name: "Tools", commands: commands("remini happy heart angry sad shy moon confused hot nikal fancy removebg removebg2 removebg3 simdata screenshot boost hashtag") },
  { name: "AI", commands: commands("gpt35 gpt4 gpt4o claude claudeopus gemini geminipro grok grokbeta deepseek deepseekcoder llama llama2 llama3 perplexity mistral codellama bard copilot copilotpro chatgpt chatgptplus ai21 jurassic commandr commandrplus mixtral phi phi2 phi3 qwen yi yi34b starcoder wizard vicuna alpaca falcon bloom gptneox dolly stablelm redpajama openchat neuralchat solar orca wizardcoder codet5 starling grammar islamcity kimi lumin mathgpt spellcheck correct grammarly proofread islam hadith quran fiqh sunnah kiamiga moonshot kimihelp kimir lumina lightai luminchat luminai math calculator algebra geometry perplex askai brain think") },
  { name: "Anime", commands: commands("ba waifu neko kitsune husbando animegirl animeboy catgirl foxgirl kawaii otaku manga cosplay schoolgirl maid uniform fantasy warrior samurai ninja magical demon angel vampire elf princess prince chibi idol gamer cyberpunk aesthetic vintage sport winter summer spring autumn moonlight starlight sunset rainy cloudy ocean mountain forest cherry dragon phoenix spirit mystic anime") },
  { name: "Owner", commands: commands("vv block unblock blocklist leave hidetag ik pair countx count") },
  { name: "Admin", commands: commands("antistatusmention antitag del") },
  { name: "Group", commands: commands("autoapprove chreact gcstatus2 gcstatus unmute mute tagall kick promote demote gcpp revoke link ginfo updategdesc updategname poll out newgc end join invite tag acceptall rejectall requests accept reject add") },
  { name: "Download", commands: commands("autodownload apk drama fb mega tiktok wastatus modapk pinterest tgsticker tiktokphoto tiktokgirl tts play video") },
  { name: "Main", commands: commands("bomb bot uptime fetch owner alive ping ping2 menu repo") },
  { name: "Boy DP", commands: Array.from({ length: 22 }, (_, index) => `boydp${index + 1}`) },
  { name: "Girl DP", commands: Array.from({ length: 22 }, (_, index) => `girldp${index + 1}`) },
  { name: "WhatsApp", commands: commands("cid") },
  { name: "Other", commands: commands("weather getpp") },
  { name: "Image", commands: commands("couplepp pies dewatermark") },
  { name: "Downloader", commands: commands("instagram mediafire") },
  { name: "Search", commands: commands("img pinterestimg hotgirl smexy hotcouple hotdp hotimg kissimg lyrics searchsticker") },
  { name: "Fun", commands: commands("ringtone compatibility aura roast 8ball compliment lovetest emoji quote bacha bachi marige ship breakup husband wife propose crush kiss2 hack cry cuddle bully hug awoo lick pat smug bonk yeet blush handhold highfive nom wave smile wink glomp bite poke cringe dance kill slap kiss confy eevee fluff lay pout tail tickle roll coinflip flip pick shapar rate joke flirt2 truth dare fact pickupline character repeat send") },
  { name: "Fun Text", commands: commands("ishqmeter andhaishq lafzmohabbat pehlinazar dillagi khoobsurat dhadkan pehlaakhat ziddidil yaadaata taubatauba pehlamuhabbat wafaimtihaan donokikahani gulabbhejo aankhein shayarban dushmandost tangkarna smilechurao jaan qismatwala jhoothpyaar siyaanibaat mohabbatqarz nazarutarao romanticbakwaas aashiqanaaward mohabbatteri dilkhol gussapyaar jasoos tangaphanda muftadvice nakhrebaaz anokhapyaar bhaaggaya khushnaseebi ronewala waqtguzarna chandsa dostyadildar galatfehmi perfectmatch raazkhola mohabbatdarjaa dua khwaabon akela bewafa chakkar ullubanana taalibajao neendurai chatpata waitingroom taj lafangaa chocolatewala baatkaatna palat gaanasunao haaththamna chuprahna phoolonkahaar ghoordekhna bahaana tarkeeb hassichhupa mobileband pagalpancert donobaat kaanpakadna taqdir kapkapi taarifcommit captioncontest zyadasocha ghazab onlinedekhna dushmankadushman buraanamano mirrormirror merahero natkhat pareshan interview kheltamam rishtapakka pyaardukaan zabaansambhlo jhootawada sonawala gossip funnyrishtedar aankheband alvidanahi personalitytest superpower pastlife darksecret celebmatch lifebattery desimom desidad khanajudge rishtaaunt challenge friendtype pakoraweather result cricketcomm shadiprediction stresslevel motivationalslap wikifact animepersonality weathermood taunt gharkawifi lovecalc2 problems hugkr mildroast wisdomcookie monsterenergy socialmedia whatanimal typingspeed nightowl pizzaorbiryani emotionaldamage complainbox numbergame naammatlab compliment2 examseason pakfact storygenerate botroast weeklyreport soulcolor shukria desiwisdom kindness newcmds alizy") },
  { name: "Gaaliyan", commands: commands("madarchod behenchod gandu randi bhosdike chutiya harami lavda kamina suar") },
  { name: "News", commands: commands("news") },
  { name: "Stalker", commands: commands("github pinsearch") },
  { name: "Menu", commands: commands("githubstalk menu2") },
  { name: "Media", commands: commands("hdvideo") },
  { name: "Maker", commands: commands("iphonechat") },
  { name: "Hot", commands: commands("china indo korea thailand vietnam loli pap japan anhnsfw anhmoe bluearchive boypic car cat china2 dog randomgirl hijabgirl indonesia2 japan2 korean2 malaysia profilepics vietnam2 romantic couple romance intimate firstnight suhagraat bedroom passionate lovers romancing together private closeness embrace tender affection lovescene cozy warmth chemistry spark desire attraction temptation seduction enchant allure captivate mesmerize infatuation fascination charm romance1 romance2 romance3 lovebirds sweethearts darling beloved sweetheart mylove myjaan heartbeat soulmate forever eternal passion intense") },
  { name: "Logo Name", commands: commands("advglow amongus bplogo bpstyle cartoon deletetxt clouds flag3d freecreate galaxy galaxywp glitch glow gradient lightfx logomaker luxurygold neon papercut pixelglitch royal sand typography beach underwater watercolor write") },
  { name: "Settings", commands: commands("statuslike botdp welcome goodbye setwelcome setgoodbye banlist ban unban sudo delsudo listsudo antiedit editpath autoread antilink antidelete recording statusview autoreact anticall anticallmsg adminaction autotyping online mode prefix botname ownername ownernumber description stickername delpath reactemojis owneremojis settings") },
  { name: "Utility", commands: commands("msg rcolor binary dbinary base64 unbase64 urlencode urldecode timenow date url") },
  { name: "Convert", commands: commands("npm readmore") },
  { name: "Information", commands: commands("praytime") },
  { name: "Respect", commands: commands("respect salute salam adab jazakallah thankyou sorry maafi tazeem izzat qadr ahsan mehrbani nawaz salaam tasleem shandar zabardast kamaal lajawab mashallah subhanallah barkatein duain khidmat ehtram appreciation proud grateful karam inayat lutf mihr shafqat rahmat naimat congratulations mubarak badhai tahseen afreen wah khushi dilse legend hero superstar rockstar champion boss king queen gem diamond precious valuable deserving inspiration rolemodel mentor genius talent skillful awesome wonderful fantastic excellence perfect blessed") },
  { name: "Sticker", commands: commands("take sticker") },
  { name: "Utilities", commands: commands("calculate") },
  { name: "Unban", commands: [...Array.from({ length: 47 }, (_, index) => `unban${index + 2}`), "unbanlist", "unbanguide"] },
  { name: "Misc", commands: commands("vv3") },
];

export const totalCommands = commandCategories.reduce(
  (total, category) => total + category.commands.length,
  0,
);