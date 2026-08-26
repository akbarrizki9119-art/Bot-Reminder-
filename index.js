const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

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
let isOwoCmdEnabled = true;

// GIF Default
const DEFAULT_GIF_HUNT = "https://cdn.discordapp.com/attachments/1511280356802957414/1540470284237410314/b8c64c28f86119317d2aa2ce417e4579.gif";
const DEFAULT_GIF_PRAY = "https://cdn.discordapp.com/attachments/1511280356802957414/1540470284237410314/b8c64c28f86119317d2aa2ce417e4579.gif";

// 📦 Map Storage
const userCustomHunt = new Map();
const userCustomPray = new Map();
const userReminderMode = new Map(); // 'gif' atau 'text'

const lastHunterByChannel = new Map();
const lastPrayerByChannel = new Map();
const lastOwoUserByChannel = new Map();

client.on('ready', () => {
    console.log(`✅ Bot ${client.user.tag} aktif & siap memantau!`);
});

// --- 🎨 EMBED HELP GENERATOR ---
function createHelpEmbed(category, user) {
    if (category === 'reminders') {
        return new EmbedBuilder()
            .setColor('#2B2D31')
            .setAuthor({ name: '🏓 Reminders', iconURL: client.user.displayAvatarURL() })
            .setDescription(`Gunakan \`!pai help\` untuk melihat bantuan.\n\n` +
                `\`owo / god / owoh\`\n> Mengatur pengingat **owo / owoh / god** (15d) 🌿⚔️\n\n` +
                `\`owopray\`\n> Mengatur pengingat **pray / curse** (5m) 🙏👻\n\n` +
                `\`mode\`\n> Pilih tipe reminder: \`!pai mode gif\` atau \`!pai mode text\` 💬\n\n` +
                `\`gif\`\n> Atur GIF kustom: \`!pai gif hunt <link>\` atau \`!pai gif pray <link>\` 🖼️\n\n` +
                `\`godhb\`\n> Pengingat Otomatis Autohunt GoD bot via DM ⏰`
            )
            .setFooter({ text: 'Dibuat khusus untuk Server O P P A I', iconURL: user.displayAvatarURL() });
    } else if (category === 'util') {
        return new EmbedBuilder()
            .setColor('#2B2D31')
            .setAuthor({ name: '⚙️ Utilities', iconURL: client.user.displayAvatarURL() })
            .setDescription(`\`!pai enable <hunt/pray/all>\` — Aktifkan reminder\n` +
                `\`!pai disable <hunt/pray/all>\` — Matikan reminder\n` +
                `\`!pai prefix <prefix_baru>\` — Ubah prefix kustom tambahan`
            )
            .setFooter({ text: 'Dibuat khusus untuk Server O P P A I', iconURL: user.displayAvatarURL() });
    }
}

function createHelpButtons(activeCategory) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('help_reminders')
            .setLabel('Reminders')
            .setEmoji('🏓')
            .setStyle(activeCategory === 'reminders' ? ButtonStyle.Primary : ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('help_util')
            .setLabel('Util')
            .setEmoji('⚙️')
            .setStyle(activeCategory === 'util' ? ButtonStyle.Primary : ButtonStyle.Secondary)
    );
}

// --- 📩 MESSAGE CREATED EVENT ---
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

    // --- 🛠️ COMMAND HANDLER ---
    if (usedPrefix) {
        const args = content.slice(usedPrefix.length).trim().split(/ +/);
        const command = args.shift()?.toLowerCase();
        const userId = message.author.id;

        if (command === 'help') {
            const embed = createHelpEmbed('reminders', message.author);
            const row = createHelpButtons('reminders');
            return message.channel.send({ embeds: [embed], components: [row] });
        }

        if (command === 'mode') {
            const pilihan = args[0]?.toLowerCase();
            if (pilihan === 'gif' || pilihan === 'text') {
                userReminderMode.set(userId, pilihan);
                return message.channel.send(`✅ Mode reminder diubah ke: **${pilihan.toUpperCase()}**!`);
            } else {
                return message.channel.send(`❌ Gunakan: \`!pai mode gif\` atau \`!pai mode text\``);
            }
        }

        if (command === 'gif') {
            const kategori = args[0]?.toLowerCase();
            const linkGif = args[1];
            if (!kategori || !linkGif || (!linkGif.startsWith('http://') && !linkGif.startsWith('https://'))) {
                return message.channel.send(`❌ Format salah! Contoh: \`!pai gif hunt <link_gif>\``);
            }
            if (kategori === 'hunt') {
                userCustomHunt.set(userId, linkGif);
                return message.channel.send(`✅ Custom GIF **Hunt** milik <@${userId}> disimpan!`);
            } else if (kategori === 'pray') {
                userCustomPray.set(userId, linkGif);
                return message.channel.send(`✅ Custom GIF **Pray** milik <@${userId}> disimpan!`);
            }
        }

        if (command === 'enable') {
            const kat = args[0]?.toLowerCase();
            if (kat === 'hunt') isHuntEnabled = true;
            else if (kat === 'pray') isPrayEnabled = true;
            else if (kat === 'all') { isHuntEnabled = true; isPrayEnabled = true; }
            return message.channel.send(`🟢 Status Reminder di-enable!`);
        }

        if (command === 'disable') {
            const kat = args[0]?.toLowerCase();
            if (kat === 'hunt') isHuntEnabled = false;
            else if (kat === 'pray') isPrayEnabled = false;
            else if (kat === 'all') { isHuntEnabled = false; isPrayEnabled = false; }
            return message.channel.send(`🔴 Status Reminder di-disable!`);
        }

        if (command === 'prefix') {
            const newPrefix = args[0];
            if (!newPrefix) return message.channel.send(`❌ Masukkan prefix baru! Contoh: \`!pai prefix .\``);
            customPrefix = newPrefix;
            return message.channel.send(`✅ Prefix kustom diatur ke \`${customPrefix}\`!`);
        }
    }

    // --- 🎯 DETEKSI COMMAND DARI USER ---
    if (msgLower === 'wh' || msgLower === 'owo hunt' || msgLower.startsWith('owo h ') || msgLower.startsWith('wh ')) {
        lastHunterByChannel.set(message.channel.id, message.author.id);
    }

    // NEW: Deteksi khusus command "owo" dan "god"
    if (msgLower === 'owo' || msgLower === 'god' || msgLower === 'uwu') {
        lastOwoUserByChannel.set(message.channel.id, message.author.id);
    }

    if (msgLower.includes('wpray') || msgLower.includes('owo pray') || msgLower === 'wp' || msgLower === 'pr') {
        lastPrayerByChannel.set(message.channel.id, message.author.id);
    }

    // --- 🔔 DETEKSI BOT RESPON (OWO BOT & REACTION BOT) ---
    if (message.author.id === OWO_BOT_ID || message.author.username.toLowerCase().includes('reaction')) {
        
        // 1. Reminder Hunt / Owo / God (15 Detik)
        if (isHuntEnabled) {
            const isHuntMsg = message.content.includes("hunted") || message.content.includes("caught") || message.content.includes("found");
            const isOwoMsg = message.content.toLowerCase().includes("owo") || message.content.toLowerCase().includes("hunt");

            if (isHuntMsg || isOwoMsg) {
                const targetUser = message.mentions.users.first()?.id 
                    || lastHunterByChannel.get(message.channel.id)
                    || lastOwoUserByChannel.get(message.channel.id);

                if (targetUser) {
                    // Hapus dari tracker biar ga double
                    lastHunterByChannel.delete(message.channel.id);
                    lastOwoUserByChannel.delete(message.channel.id);

                    setTimeout(() => {
                        const userMode = userReminderMode.get(targetUser) || 'gif';

                        if (userMode === 'text') {
                            message.channel.send({ content: `🔔 <@${targetUser}> , waktunya untuk **owo / hunt**!` });
                        } else {
                            const userGif = userCustomHunt.get(targetUser) || DEFAULT_GIF_HUNT;
                            const embedHunt = new EmbedBuilder().setColor('#2B2D31').setImage(userGif);

                            message.channel.send({ 
                                content: `🔔 <@${targetUser}> , waktunya untuk **owo / hunt**!`, 
                                embeds: [embedHunt] 
                            });
                        }
                    }, 15000); 
                }
            }
        }

        // 2. Reminder Pray (5 Menit)
        const owoText = message.content.toLowerCase();
        if (isPrayEnabled && (owoText.includes("prayed") || owoText.includes("blessed") || owoText.includes("cursed") || owoText.includes("luck point") || owoText.includes("pray"))) {
            const prayerToMention = message.mentions.users.first()?.id 
                || lastPrayerByChannel.get(message.channel.id);

            if (prayerToMention) {
                lastPrayerByChannel.delete(message.channel.id);

                setTimeout(() => {
                    const userMode = userReminderMode.get(prayerToMention) || 'gif';

                    if (userMode === 'text') {
                        message.channel.send({ content: `🔔 <@${prayerToMention}> , waktunya untuk **wpray**!` });
                    } else {
                        const userGif = userCustomPray.get(prayerToMention) || DEFAULT_GIF_PRAY;
                        const embedPray = new EmbedBuilder().setColor('#2B2D31').setImage(userGif);

                        message.channel.send({ 
                            content: `🔔 <@${prayerToMention}> , waktunya untuk **wpray**!`, 
                            embeds: [embedPray] 
                        });
                    }
                }, 300000); 
            }
        }
    }

    // --- 🤖 REMINDER GOD BOT VIA DM ---
    if (message.author.id === GOD_BOT_ID || message.author.username.includes('GoD')) {
        if (message.content.includes("captcha") || message.content.includes("verify")) {
            message.channel.send(`🚨 **PERINGATAN GOD:** Ada Captcha/Verifikasi! Cek sekarang!`);
        }

        if (message.content.includes('I WILL BE BACK IN')) {
            const hoursMatch = message.content.match(/(\d+)H/i);
            const minutesMatch = message.content.match(/(\d+)M/i);

            let totalMs = 0;
            if (hoursMatch) totalMs += parseInt(hoursMatch[1]) * 60 * 60 * 1000;
            if (minutesMatch) totalMs += parseInt(minutesMatch[1]) * 60 * 1000;

            const targetUser = message.mentions.users.first() 
                || (message.reference ? (await message.fetchReference().catch(() => null))?.author : null);

            if (totalMs > 0 && targetUser) {
                const hours = hoursMatch ? hoursMatch[1] : 0;
                const minutes = minutesMatch ? minutesMatch[1] : 0;

                message.channel.send(`⏰ **Pengingat Dipasang!** Aku bakal DM <@${targetUser.id}> dalam **${hours} jam ${minutes} menit** lagi.`);

                setTimeout(async () => {
                    try {
                        await targetUser.send(`🔔 **AUTOHUNT GOD SELESAI!** Waktunya ketik \`ghb 1d\` lagi di server!`);
                    } catch (error) {
                        message.channel.send(`🔔 <@${targetUser.id}> **AUTOHUNT GOD SELESAI!** (Gagal kirim DM, cek apakah DM server aktif).`);
                    }
                }, totalMs);
            }
        }
    }
});

// --- 🔘 BUTTON INTERACTION HANDLER ---
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'help_reminders') {
        const embed = createHelpEmbed('reminders', interaction.user);
        const row = createHelpButtons('reminders');
        await interaction.update({ embeds: [embed], components: [row] });
    } else if (interaction.customId === 'help_util') {
        const embed = createHelpEmbed('util', interaction.user);
        const row = createHelpButtons('util');
        await interaction.update({ embeds: [embed], components: [row] });
    }
});

client.login(process.env.TOKEN);
                       
