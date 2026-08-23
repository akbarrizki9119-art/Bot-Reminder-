const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

const OWO_BOT_ID = "408785106942164992"; 
const GOD_BOT_ID = "1521044059643318443"; 

// --- ⚙️ SETTINGAN UTAMA ---
let defaultTrigger = "!pai";
let customPrefix = "";
let isHuntEnabled = true;
let isPrayEnabled = true;

// GIF Default jika user belum set GIF sendiri
const DEFAULT_GIF_HUNT = "https://cdn.discordapp.com/attachments/1511280356802957414/1540470284237410314/b8c64c28f86119317d2aa2ce417e4579.gif";
const DEFAULT_GIF_PRAY = "https://cdn.discordapp.com/attachments/1511280356802957414/1540470284237410314/b8c64c28f86119317d2aa2ce417e4579.gif";

// 📦 Penyimpanan Custom GIF Per User ID
const userCustomHunt = new Map(); // Menyimpan GIF Hunt per User
const userCustomPray = new Map(); // Menyimpan GIF Pray per User

let lastHunterId = null;
let lastPrayerId = null;

client.on('ready', () => {
    console.log(`✅ Bot ${client.user.tag} aktif & siap memantau!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.id === client.user.id) return;

    const content = message.content.trim();
    const msgLower = content.toLowerCase();

    let usedPrefix = null;
    if (msgLower.startsWith(defaultTrigger.toLowerCase())) {
        usedPrefix = defaultTrigger;
    } else if (customPrefix && msgLower.startsWith(customPrefix.toLowerCase())) {
        usedPrefix = customPrefix;
    }

    // --- 🛠️ LOGIKA COMMAND BOT ---
    if (usedPrefix) {
        const args = content.slice(usedPrefix.length).trim().split(/ +/);
        const command = args.shift()?.toLowerCase();
        const userId = message.author.id;

        // 1. !pai help
        if (command === 'help') {
            const userHuntGif = userCustomHunt.get(userId) || DEFAULT_GIF_HUNT;
            const userPrayGif = userCustomPray.get(userId) || DEFAULT_GIF_PRAY;

            const embedHelp = new EmbedBuilder()
                .setColor('#2B2D31')
                .setAuthor({ name: 'REMINDER PAII - PANDUAN BOT', iconURL: client.user.displayAvatarURL() })
                .setDescription('Setiap user bisa mengatur GIF kustom milik sendiri!')
                .addFields(
                    { 
                        name: '🎮 Command Pengaturan', 
                        value: `\`!pai help\` — Menampilkan menu panduan\n\`!pai prefix <prefix_baru>\` — Set prefix kustom tambahan`, 
                        inline: false 
                    },
                    { 
                        name: '🖼️ Set Custom GIF Milikmu sendiri', 
                        value: `\`!pai gif hunt <link_gif>\` — Set GIF Hunt khusus untukmu\n\`!pai gif pray <link_gif>\` — Set GIF Pray khusus untukmu`, 
                        inline: false 
                    },
                    { 
                        name: '⚙️ Setting Reminder Global', 
                        value: `\`!pai enable <hunt/pray/all>\` — Aktifkan reminder\n\`!pai disable <hunt/pray/all>\` — Matikan reminder`, 
                        inline: false 
                    },
                    { 
                        name: '📊 Custom GIF Milikmu Saat Ini', 
                        value: `• **GIF Hunt Kamu:** [Lihat GIF](${userHuntGif})\n• **GIF Pray Kamu:** [Lihat GIF](${userPrayGif})`, 
                        inline: false 
                    }
                )
                .setFooter({ text: 'Dibuat khusus untuk Server O P P A I', iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            return message.channel.send({ embeds: [embedHelp] });
        }

        // 2. !pai gif <hunt/pray> <link_gif> (Kustom Per User)
        if (command === 'gif') {
            const kategori = args[0]?.toLowerCase();
            const linkGif = args[1];

            if (!kategori || !linkGif) {
                return message.channel.send(`❌ Format salah! Gunakan: \`!pai gif <hunt/pray> <link_gif>\``);
            }

            if (!linkGif.startsWith('http://') && !linkGif.startsWith('https://')) {
                return message.channel.send(`❌ Link tidak valid! Pastikan diawali dengan \`https://\``);
            }

            if (kategori === 'hunt') {
                userCustomHunt.set(userId, linkGif);
                return message.channel.send(`✅ Custom GIF **OwO Hunt** milik <@${userId}> berhasil diperbarui!`);
            } else if (kategori === 'pray') {
                userCustomPray.set(userId, linkGif);
                return message.channel.send(`✅ Custom GIF **OwO Pray** milik <@${userId}> berhasil diperbarui!`);
            } else {
                return message.channel.send(`❌ Kategori tidak ditemukan! Pilih antara \`hunt\` atau \`pray\`.`);
            }
        }

        // 3. !pai enable
        if (command === 'enable') {
            const kat = args[0]?.toLowerCase();
            if (kat === 'hunt') isHuntEnabled = true;
            else if (kat === 'pray') isPrayEnabled = true;
            else if (kat === 'all') { isHuntEnabled = true; isPrayEnabled = true; }
            return message.channel.send(`🟢 Status Reminder diperbarui!`);
        }

        // 4. !pai disable
        if (command === 'disable') {
            const kat = args[0]?.toLowerCase();
            if (kat === 'hunt') isHuntEnabled = false;
            else if (kat === 'pray') isPrayEnabled = false;
            else if (kat === 'all') { isHuntEnabled = false; isPrayEnabled = false; }
            return message.channel.send(`🔴 Status Reminder diperbarui!`);
        }

        // 5. !pai prefix
        if (command === 'prefix') {
            const newPrefix = args[0];
            if (!newPrefix) return message.channel.send(`❌ Masukkan prefix baru! Contoh: \`!pai prefix .\``);
            customPrefix = newPrefix;
            return message.channel.send(`✅ Prefix tambahan diatur ke \`${customPrefix}\`!`);
        }
    }

    // --- 🎯 DETEKSI COMMAND OWO ---
    if (msgLower === 'wh' || msgLower === 'owo hunt' || msgLower.startsWith('owo h')) {
        lastHunterId = message.author.id;
    }

    if (msgLower.includes('wpray') || msgLower.includes('owo pray') || msgLower === 'wp' || msgLower === 'pr') {
        lastPrayerId = message.author.id;
    }

    // --- 🔔 DETEKSI PENGINGAT DARI OWO BOT ---
    if (message.author.id === OWO_BOT_ID) {
        
        // Reminder Hunt (15 Detik)
        if (isHuntEnabled && (message.content.includes("hunted") || message.content.includes("caught") || message.content.includes("found"))) {
            const hunterToMention = message.mentions.users.first()?.id || lastHunterId;

            setTimeout(() => {
                const targetText = hunterToMention ? `<@${hunterToMention}>` : "Hunter";
                
                // Ambil GIF kustom milik user yang bersangkutan, jika tidak ada pakai Default
                const userGif = userCustomHunt.get(hunterToMention) || DEFAULT_GIF_HUNT;

                const embedHunt = new EmbedBuilder()
                    .setColor('#2B2D31')
                    .setImage(userGif);

                message.channel.send({ 
                    content: `🔔 ${targetText} , waktunya untuk **owo hunt**!`, 
                    embeds: [embedHunt] 
                });
            }, 15000); 
        }

        // Reminder Pray (5 Menit)
        const owoText = message.content.toLowerCase();
        if (isPrayEnabled && (owoText.includes("prayed") || owoText.includes("blessed") || owoText.includes("cursed") || owoText.includes("luck point"))) {
            const prayerToMention = message.mentions.users.first()?.id || lastPrayerId;

            setTimeout(() => {
                const targetText = prayerToMention ? `<@${prayerToMention}>` : "Player";

                // Ambil GIF kustom milik user yang bersangkutan, jika tidak ada pakai Default
                const userGif = userCustomPray.get(prayerToMention) || DEFAULT_GIF_PRAY;

                const embedPray = new EmbedBuilder()
                    .setColor('#2B2D31')
                    .setImage(userGif);

                message.channel.send({ 
                    content: `🔔 ${targetText} , waktunya untuk **wpray**!`, 
                    embeds: [embedPray] 
                });
            }, 300000); 
        }
    }

    // --- 🤖 DETEKSI & REMINDER AUTOHUNT BOT GOD VIA DM ---
    if (message.author.id === GOD_BOT_ID || message.author.username.includes('GoD')) {
        
        // 1. Anti-Captcha Detector
        if (message.content.includes("captcha") || message.content.includes("verify")) {
            message.channel.send(`🚨 **PERINGATAN GOD:** Ada Captcha/Verifikasi! Cek sekarang!`);
        }

        // 2. Reminder Autohunt GoD
        if (message.content.includes('I WILL BE BACK IN')) {
            const hoursMatch = message.content.match(/(\d+)H/i);
            const minutesMatch = message.content.match(/(\d+)M/i);

            let totalMs = 0;
            if (hoursMatch) totalMs += parseInt(hoursMatch[1]) * 60 * 60 * 1000;
            if (minutesMatch) totalMs += parseInt(minutesMatch[1]) * 60 * 1000;

            // Mengambil User dari mention atau pesan GoD
            const targetUser = message.mentions.users.first() || client.users.cache.get(lastHunterId);

            if (totalMs > 0) {
                const hours = hoursMatch ? hoursMatch[1] : 0;
                const minutes = minutesMatch ? minutesMatch[1] : 0;

                const userTag = targetUser ? `<@${targetUser.id}>` : "kamu";
                message.channel.send(`⏰ **Pengingat Dipasang!** Aku bakal DM ${userTag} dalam **${hours} jam ${minutes} menit** lagi.`);

                setTimeout(async () => {
                    if (targetUser) {
                        try {
                            await targetUser.send(`🔔 **AUTOHUNT GOD SELESAI!** Waktunya ketik \`ghb 1d\` lagi di server!`);
                        } catch (error) {
                            message.channel.send(`🔔 <@${targetUser.id}> **AUTOHUNT GOD SELESAI!** (Gagal kirim DM, cek apakah DM server aktif).`);
                        }
                    } else {
                        message.channel.send(`🔔 **AUTOHUNT GOD SELESAI!** Waktunya ketik \`ghb 1d\` lagi!`);
                    }
                }, totalMs);
            }
        }
    }
});

client.login(process.env.TOKEN || TOKEN_BOT);
                        
