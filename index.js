const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ] 
});

// 🎨 Tema Warna Gradient
const gradientColors = ['#9B59B6', '#8A2BE2', '#C71585', '#4B0082', '#7B68EE', '#DDA0DD'];
const getRandomColor = () => gradientColors[Math.floor(Math.random() * gradientColors.length)];

// 📦 Settings Maps & RPG Data
const serverSettings = new Map();
const userSettings = new Map();
const activeTimers = new Map();
const rpgPlayers = new Map(); 

// Menyimpan status DM pengingat agar tidak spam
const notifiedSessions = new Map();

// 👑 MASUKKAN DISCORD USER ID LU DI SINI SUPAYA JADI OWNER UTAMA BOT!
const OWNER_IDS = ['MASUKKAN_ID_DISCORD_LU_DISINI']; 

function getServerConfig(guildId) {
    if (!serverSettings.has(guildId)) {
        serverSettings.set(guildId, {
            botPrefix: "!",
            owoPrefix: "w",
            owoMsg: "owo 🥳",
            huntMsg: "hunt 🎉",
            godMsg: "god hunt ⚡",
            prayMsg: "pray/curse 🙏",
            voteMsg: "🗳️ Waktunya vote OwO bot! Yuk vote sekarang biar dapet reward!"
        });
    }
    return serverSettings.get(guildId);
}

function getUserConfig(userId) {
    if (!userSettings.has(userId)) {
        userSettings.set(userId, {
            huntEnabled: true,
            godEnabled: true,
            prayEnabled: true,
            owoEnabled: true,
            voteEnabled: true,
            pingsEnabled: true,
            replyEnabled: true,
            owoMode: 'text',
            huntMode: 'text',
            godMode: 'text',
            prayMode: 'text',
            voteMode: 'text',
            owoGif: "https://cdn.discordapp.com/attachments/1511280356802957414/1540470284237410314/b8c64c28f86119317d2aa2ce417e4579.gif",
            huntGif: "https://cdn.discordapp.com/attachments/1511280356802957414/1540470284237410314/b8c64c28f86119317d2aa2ce417e4579.gif",
            godGif: "https://cdn.discordapp.com/attachments/1511280356802957414/1540470284237410314/b8c64c28f86119317d2aa2ce417e4579.gif",
            prayGif: "https://cdn.discordapp.com/attachments/1511280356802957414/1540470284237410314/b8c64c28f86119317d2aa2ce417e4579.gif",
            voteGif: "https://cdn.discordapp.com/attachments/1511280356802957414/1540470284237410314/b8c64c28f86119317d2aa2ce417e4579.gif"
        });
    }
    return userSettings.get(userId);
}

function getRpgPlayer(userId, username = "Hero") {
    if (!rpgPlayers.has(userId)) {
        // 👑 Khusus owner langsung dapet 100 Juta koin
        const initialBalance = OWNER_IDS.includes(userId) ? 100000000 : 1000;

        rpgPlayers.set(userId, {
            name: username,
            balance: initialBalance, 
            inventory: []
        });
    }
    return rpgPlayers.get(userId);
}

client.on('ready', () => {
    console.log(`✅ Bot ${client.user.tag} aktif & siap!`);
});

// --- 🎨 EMBED HELP & SETTINGS ---
function createHelpEmbed(guildName, avatarURL, prefix) {
    return new EmbedBuilder()
        .setColor(getRandomColor())
        .setAuthor({ name: '🏓 Reminders, Casino & Utility Menu', iconURL: client.user.displayAvatarURL() })
        .setDescription(
            `Gunakan \`${prefix} help\` untuk melihat bantuan.\n\n` +
            `**👑 OWNER COMMANDS**\n` +
            `\`${prefix} addcash [jumlah] [@user]\` : Tambah saldo koin (Khusus Owner)\n\n` +
            `**🎮 GAME REMINDERS & TIMER CHECK**\n` +
            `\`${prefix} owo\` | \`${prefix} owoh\` | \`${prefix} godh\`\n` +
            `\`${prefix} whb 1\` : Cek sisa waktu huntbot aktif\n` +
            `\`${prefix} ghb 1\` : Cek sisa waktu god huntbot aktif\n\n` +
            `**🎰 CASINO MINIGAMES (Max Bet: 250.000)**\n` +
            `\`${prefix} cf [jumlah/all] [h/t]\` : Coinflip (OwO Style)\n` +
            `\`${prefix} slot\` / \`${prefix} s\` / \`${prefix} ws\` [jumlah/all] : Slot Machine (OwO Style)\n` +
            `\`${prefix} bal\` : Cek saldo koin\n\n` +
            `**🛠️ UTILITY COMMANDS**\n` +
            `\`${prefix} ping\` | \`${prefix} uptime\` | \`${prefix} clear <1-100>\``
        )
        .setFooter({ text: `Server ${guildName || 'OPPAI'}`, iconURL: avatarURL || client.user.displayAvatarURL() });
}

function createHelpButtons() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('help_reminders').setLabel('Reminders').setEmoji('🏓').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('help_utility').setLabel('Utilitas').setEmoji('🛠️').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('help_settings').setLabel('Settings').setEmoji('⚙️').setStyle(ButtonStyle.Secondary)
    );
}

function createServerSettingsEmbed(guildId) {
    const config = getServerConfig(guildId);
    return new EmbedBuilder()
        .setColor(getRandomColor())
        .setTitle('Server Settings')
        .setDescription(
            `⚙️ **OwO prefix:** \`${config.owoPrefix}\`\n` +
            `🤖 **Bot prefix:** \`${config.botPrefix}\` (\`${config.botPrefix} s prefix <baru>\`)\n\n` +
            `🌱 **owo:** \`${config.botPrefix} s owo <pesan>\`\n` +
            `🏹 **hunt:** \`${config.botPrefix} s hunt <pesan>\`\n` +
            `⚡ **god hunt:** \`${config.botPrefix} s godh <pesan>\`\n` +
            `☘️ **pray/curse:** \`${config.botPrefix} s pray <pesan>\`\n` +
            `🗳️ **vote:** \`${config.botPrefix} s vote <pesan>\``
        );
}

// --- 📩 MESSAGE EVENT HANDLER ---
client.on('messageCreate', async (message) => {
    try {
        const content = message.content.trim();
        const msgUpper = content.toUpperCase();
        const msgLower = content.toLowerCase();
        const userId = message.author.id;
        const guildId = message.guild?.id || 'dm';

        const serverCfg = getServerConfig(guildId);
        const userCfg = getUserConfig(userId);

        if (message.author.bot) {
            if (msgLower.includes("captcha") || msgLower.includes("verify")) {
                message.channel.send(`🚨 **PERINGATAN:** Ada Captcha/Verifikasi! Cek sekarang!`).catch(() => {});
            }

            if (msgUpper.includes('I WILL BE BACK IN')) {
                const hoursMatch = msgUpper.match(/(\d+)\s*H/i);
                const minutesMatch = msgUpper.match(/(\d+)\s*M/i);
                const secondsMatch = msgUpper.match(/(\d+)\s*S/i);

                let totalMs = 0;
                let durationParts = [];

                if (hoursMatch) { const h = parseInt(hoursMatch[1]); totalMs += h * 3600000; durationParts.push(`${h} Jam`); }
                if (minutesMatch) { const m = parseInt(minutesMatch[1]); totalMs += m * 60000; durationParts.push(`${m} Menit`); }
                if (secondsMatch) { const s = parseInt(secondsMatch[1]); totalMs += s * 1000; durationParts.push(`${s} Detik`); }

                const durationString = durationParts.join(' ') || 'beberapa saat';
                const finishTimestamp = Date.now() + totalMs;
                const timeStringFormatted = new Date(finishTimestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: true });

                let targetUser = message.mentions.users.first();
                let huntTypeLabel = "OWO HUNTBOT";

                if (!targetUser && message.reference) {
                    const refMsg = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
                    if (refMsg && !refMsg.author.bot) {
                        targetUser = refMsg.author;
                        if (refMsg.content.toLowerCase().includes('ghb') || refMsg.content.toLowerCase().includes('gah')) huntTypeLabel = "GOD HUNTBOT";
                    }
                }

                if (!targetUser) {
                    const recentMsgs = await message.channel.messages.fetch({ limit: 6 }).catch(() => null);
                    if (recentMsgs) {
                        const huntKeywords = ['hb', 'ghb', 'whb', 'ah', 'w ah', 'autohunt', 'gah'];
                        const lastUserMsg = recentMsgs.find(m => !m.author.bot && huntKeywords.some(kw => m.content.toLowerCase().includes(kw)));
                        if (lastUserMsg) {
                            targetUser = lastUserMsg.author;
                            if (lastUserMsg.content.toLowerCase().includes('ghb') || lastUserMsg.content.toLowerCase().includes('gah')) huntTypeLabel = "GOD HUNTBOT";
                        }
                    }
                }

                if (totalMs > 0 && targetUser) {
                    const sessionKey = `${targetUser.id}_${huntTypeLabel}`;
                    notifiedSessions.set(sessionKey, false);

                    if (activeTimers.has(sessionKey)) {
                        clearTimeout(activeTimers.get(sessionKey));
                    }

                    activeTimers.set(`${sessionKey}_target`, finishTimestamp);

                    message.channel.send(`⏰ Pengingat **${huntTypeLabel}** dipasang untuk <@${targetUser.id}>!\n⏳ **Sisa waktu:** \`${durationString}\` (Selesai pukul ${timeStringFormatted})`).catch(() => {});
                    
                    const timer = setTimeout(async () => {
                        try {
                            const hasNotified = notifiedSessions.get(sessionKey);
                            if (!hasNotified) {
                                await targetUser.send({
                                    content: `🔔 <@${targetUser.id}> **${huntTypeLabel} SELESAI!** Waktunya cek / hunt lagi! ⚔️`,
                                    allowedMentions: { users: [targetUser.id] }
                                });
                                notifiedSessions.set(sessionKey, true);
                            }
                        } catch (e) {
                            message.channel.send(`🚨 <@${targetUser.id}> **${huntTypeLabel} SELESAI!** (DM kamu tertutup)`).catch(() => {});
                        }
                        activeTimers.delete(sessionKey);
                        activeTimers.delete(`${sessionKey}_target`);
                    }, totalMs);

                    activeTimers.set(sessionKey, timer);
                }
            }
            return;
        }

        // --- COMMAND CEK TIMER MANUAL (whb 1 / ghb 1) ---
        if (msgLower.startsWith('whb 1') || msgLower.startsWith('ghb 1')) {
            const huntTypeLabel = msgLower.startsWith('ghb 1') ? "GOD HUNTBOT" : "OWO HUNTBOT";
            const sessionKey = `${userId}_${huntTypeLabel}`;
            const targetTime = activeTimers.get(`${sessionKey}_target`);

            if (targetTime) {
                const remainingMs = targetTime - Date.now();
                if (remainingMs > 0) {
                    const remSec = Math.floor(remainingMs / 1000);
                    const remMin = Math.floor(remSec / 60);
                    const remHour = Math.floor(remMin / 60);
                    const displayTime = remHour > 0 ? `${remHour}j ${remMin % 60}m` : `${remMin}m ${remSec % 60}d`;
                    return message.channel.send(`⏳ **${huntTypeLabel}** kamu tersisa sekitar \`${displayTime}\` lagi.`);
                }
            }
            return message.channel.send(`❓ Tidak ada timer aktif untuk **${huntTypeLabel}** kamu saat ini.`);
        }

        let usedPrefix = null;
        if (msgLower.startsWith('!pai')) {
            usedPrefix = '!pai';
        } else if (serverCfg.botPrefix && msgLower.startsWith(serverCfg.botPrefix.toLowerCase())) {
            usedPrefix = serverCfg.botPrefix;
        }

        if (usedPrefix) {
            const args = content.slice(usedPrefix.length).trim().split(/ +/);
            const command = args.shift()?.toLowerCase();

            if (!command || command === 'help') {
                return message.channel.send({ embeds: [createHelpEmbed(message.guild?.name, message.author.displayAvatarURL(), serverCfg.botPrefix)], components: [createHelpButtons()] });
            }
            if (command === 'settings') return message.channel.send({ embeds: [createServerSettingsEmbed(guildId)] });

            // --- 👑 OWNER COMMAND: ADD CASH (!addcash) ---
            if (command === 'addcash' || command === 'give' || command === 'addmoney') {
                if (!OWNER_IDS.includes(userId)) {
                    return message.channel.send(`❌ Perintah ini khusus untuk **Owner Bot**!`);
                }

                const targetUser = message.mentions.users.first() || message.author;
                const amountToAdd = parseInt(args[0]) || parseInt(args[1]) || 100000000;

                if (isNaN(amountToAdd)) {
                    return message.channel.send(`❌ Masukkan jumlah nominal koin yang valid! Contoh: \`${usedPrefix} addcash 100000000\``);
                }

                const targetPlayer = getRpgPlayer(targetUser.id, targetUser.username);
                targetPlayer.balance += amountToAdd;

                return message.channel.send(`👑 **[OWNER COMMAND]** Berhasil menambahkan \`${amountToAdd.toLocaleString('id-ID')}\` koin ke akun <@${targetUser.id}>!\n🪙 Saldo sekarang: \`${targetPlayer.balance.toLocaleString('id-ID')}\``);
            }

            // --- 🪙 MINIGAME: COINFLIP (!cf) OWO STYLE ---
            if (command === 'cf' || command === 'coinflip') {
                const player = getRpgPlayer(userId, message.author.username);
                
                let betAmount = 100; 
                let choice = 'heads';
                const maxBet = 250000;

                if (args.length > 0) {
                    const arg0 = args[0].toLowerCase();
                    if (arg0 === 'all') {
                        betAmount = Math.min(player.balance, maxBet);
                        if (args[1]) {
                            const cArg = args[1].toLowerCase();
                            if (cArg === 't' || cArg === 'tails') choice = 'tails';
                        }
                    } else if (!isNaN(args[0])) {
                        betAmount = parseInt(args[0]);
                        if (betAmount > maxBet) betAmount = maxBet;
                        if (betAmount < 1) betAmount = 1;

                        if (args[1]) {
                            const cArg = args[1].toLowerCase();
                            if (cArg === 't' || cArg === 'tails') choice = 'tails';
                        }
                    } else {
                        if (arg0 === 't' || arg0 === 'tails') choice = 'tails';
                    }
                }

                if (player.balance < betAmount) {
                    return message.channel.send(`❌ Saldo koin kamu tidak cukup! Saldo kamu saat ini: \`${player.balance.toLocaleString('id-ID')}\``);
                }

                // Emoji resmi OwO sesuai data
                const currencyEmoji = '<:cowoncy:1549122224252784691>';
                const spinningEmoji = '<a:coinflip:1549103223825240074>';
                const headsEmoji = '<:heads:1549103331459203154>';
                const tailsEmoji = '<:tails:1549103379194847366>';

                const sentMsg = await message.reply({
                    content: `<@${userId}> spent ${currencyEmoji} **${betAmount.toLocaleString('id-ID')}** and chose **${choice}**\nThe coin spins... ${spinningEmoji}`,
                    allowedMentions: { users: [userId] }
                });

                setTimeout(async () => {
                    const isWin = Math.random() < 0.5;
                    const actualResult = isWin ? choice : (choice === 'heads' ? 'tails' : 'heads');
                    const resultEmoji = actualResult === 'heads' ? headsEmoji : tailsEmoji;

                    if (isWin) {
                        player.balance += betAmount;
                        const winAmount = betAmount * 2;
                        await sentMsg.edit(`<@${userId}> spent ${currencyEmoji} **${betAmount.toLocaleString('id-ID')}** and chose **${choice}**\nThe coin spins... ${resultEmoji} and you won ${currencyEmoji} **${winAmount.toLocaleString('id-ID')}**!!`);
                    } else {
                        player.balance -= betAmount;
                        await sentMsg.edit(`<@${userId}> spent ${currencyEmoji} **${betAmount.toLocaleString('id-ID')}** and chose **${choice}**\nThe coin spins... ${resultEmoji} and you lost ${currencyEmoji} **${betAmount.toLocaleString('id-ID')}**!!`);
                    }
                }, 1500);
                return;
            }

            // --- 🎰 MINIGAME: SLOT MACHINE (!slot / !s) OWO STYLE ---
            if (command === 'slot' || command === 'slots' || command === 's' || command === 'ws') {
                const player = getRpgPlayer(userId, message.author.username);
                
                let betAmount = 100;
                const maxBet = 250000;

                if (args.length > 0) {
                    const arg0 = args[0].toLowerCase();
                    if (arg0 === 'all') {
                        betAmount = Math.min(player.balance, maxBet);
                    } else if (!isNaN(args[0])) {
                        betAmount = parseInt(args[0]);
                        if (betAmount > maxBet) betAmount = maxBet;
                        if (betAmount < 1) betAmount = 1;
                    }
                }

                if (player.balance < betAmount) {
                    return message.channel.send(`❌ Saldo koin kamu kurang! Saldo kamu: \`${player.balance.toLocaleString('id-ID')}\``);
                }

                // Emoji Resmi OwO & Slot dengan spasi rapi
                const currencyEmoji = '<:cowoncy:1549122224252784691>';
                const slots1 = '<:slots1:1549105223555883188>';
                const slots2 = '<:slots2:1549105269299089458>';
                const slots3 = '<:slots3:1549105305797918751>';
                const slots4 = '<:slots4:1549105355605287022>';
                const slots5 = '<:slots5:1549105397384609844>';
                const slots6 = '<:slots6:1549105439017541642>';
                const animatedSlot = '<a:slots:1549103089984999585>';

                const allItems = [slots1, slots2, slots3, slots4, slots5, slots6];
                const getRandomSlot = () => allItems[Math.floor(Math.random() * allItems.length)];

                // Pesan awal (animasi muter awal)
                const sentMsg = await message.channel.send(
                    `___SLOTS___\n${animatedSlot}  ${animatedSlot}  ${animatedSlot}     **${message.author.username}** bet ${currencyEmoji} **${betAmount.toLocaleString('id-ID')}**`
                );

                // Tentukan hasil akhir di awal
                const randChance = Math.random() * 100;
                let r1, r2, r3;
                let multiplier = 0;
                let resultType = '';

                if (randChance < 1.0) {
                    r1 = slots6; r2 = slots5; r3 = slots6; 
                    multiplier = 10;
                    const totalWon = betAmount * multiplier;
                    player.balance += totalWon - betAmount;
                    resultType = `and won ${currencyEmoji} **${totalWon.toLocaleString('id-ID')}**! 🎉 JACKPOT OWO!!`;
                } else if (randChance < 4.0) {
                    r1 = slots4; r2 = slots4; r3 = slots4;
                    multiplier = 4;
                    const totalWon = betAmount * multiplier;
                    player.balance += totalWon - betAmount;
                    resultType = `and won ${currencyEmoji} **${totalWon.toLocaleString('id-ID')}**! 🎉`;
                } else if (randChance < 10.0) {
                    r1 = slots3; r2 = slots3; r3 = slots3;
                    multiplier = 3;
                    const totalWon = betAmount * multiplier;
                    player.balance += totalWon - betAmount;
                    resultType = `and won ${currencyEmoji} **${totalWon.toLocaleString('id-ID')}**! 🎉`;
                } else if (randChance < 25.0) {
                    r1 = slots2; r2 = slots2; r3 = slots2;
                    multiplier = 2;
                    const totalWon = betAmount * multiplier;
                    player.balance += totalWon - betAmount;
                    resultType = `and won ${currencyEmoji} **${totalWon.toLocaleString('id-ID')}**! 👍`;
                } else if (randChance < 45.0) {
                    r1 = slots1; r2 = slots1; r3 = slots1;
                    multiplier = 1;
                    const totalWon = betAmount * multiplier; 
                    resultType = `and won ${currencyEmoji} **${totalWon.toLocaleString('id-ID')}**! 👍`;
                } else {
                    r1 = getRandomSlot();
                    r2 = getRandomSlot();
                    r3 = getRandomSlot();
                    if (r1 === r2 && r2 === r3) {
                        r3 = allItems[(allItems.indexOf(r1) + 2) % allItems.length];
                    }
                    player.balance -= betAmount;
                    resultType = `and won nothing... :c`;
                }

                // Animasi jeda bertahap (1 per 1 kotak) ala OwO
                setTimeout(async () => {
                    await sentMsg.edit(`___SLOTS___\n${r1}  ${animatedSlot}  ${animatedSlot}     **${message.author.username}** bet ${currencyEmoji} **${betAmount.toLocaleString('id-ID')}**`).catch(() => {});
                }, 700);

                setTimeout(async () => {
                    await sentMsg.edit(`___SLOTS___\n${r1}  ${r2}  ${animatedSlot}     **${message.author.username}** bet ${currencyEmoji} **${betAmount.toLocaleString('id-ID')}**`).catch(() => {});
                }, 1400);

                setTimeout(async () => {
                    await sentMsg.edit(`___SLOTS___\n${r1}  ${r2}  ${r3}     **${message.author.username}** bet ${currencyEmoji} **${betAmount.toLocaleString('id-ID')}**\n${resultType}`).catch(() => {});
                }, 2100);

                return;
            }

            // --- 🪙 CEK SALDO (!bal) ---
            if (command === 'bal' || command === 'balance') {
                const player = getRpgPlayer(userId, message.author.username);
                const currencyEmoji = '<:cowoncy:1549122224252784691>';
                return message.channel.send(`🪙 Saldo koin **${message.author.username}**: ${currencyEmoji} \`${player.balance.toLocaleString('id-ID')}\``);
            }

            // --- 🛠️ UTILITY COMMANDS ---
            if (command === 'ping') {
                const sent = await message.channel.send("🏓 Measuring latency...");
                const latency = sent.createdTimestamp - message.createdTimestamp;
                const apiLatency = Math.round(client.ws.ping);
                return sent.edit(`🏓 **Pong!**\n📡 **Latency Bot:** \`${latency}ms\`\n⚡ **API Latency:** \`${apiLatency}ms\``);
            }

            if (command === 'clear') {
                if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                    return message.channel.send("❌ Kamu tidak memiliki izin `Manage Messages`!");
                }
                const amount = parseInt(args[0]);
                if (isNaN(amount) || amount < 1 || amount > 100) {
                    return message.channel.send("❌ Masukkan jumlah pesan dari 1 sampai 100!");
                }
                await message.channel.bulkDelete(amount, true).catch(() => {});
                const msg = await message.channel.send(`🧹 Berhasil menghapus **${amount}** pesan.`);
                setTimeout(() => msg.delete().catch(() => {}), 3000);
                return;
            }

            if (command === 'uptime') {
                let totalSeconds = (client.uptime / 1000);
                let days = Math.floor(totalSeconds / 86400);
                totalSeconds %= 86400;
                let hours = Math.floor(totalSeconds / 3600);
                totalSeconds %= 3600;
                let minutes = Math.floor(totalSeconds / 60);
                let seconds = Math.floor(totalSeconds % 60);

                return message.channel.send(`⏰ **Bot Uptime:** \`${days}d ${hours}h ${minutes}m ${seconds}s\``);
            }
        }

        // --- 🎯 AUTOMATIC REMINDERS ---
        const handleTimer = (type, timeMs, textMsg, modeKey, gifUrl) => {
            const timerKey = `${userId}_${type}_${message.channel.id}`;
            if (activeTimers.has(timerKey)) clearTimeout(activeTimers.get(timerKey));

            const timer = setTimeout(() => {
                const mentionStr = userCfg.pingsEnabled ? `<@${userId}>` : `**${message.author.username}**`;
                const payload = { content: `${mentionStr} ${textMsg}` };
                
                if (userCfg.replyEnabled) payload.reply = { messageReference: message.id };
                
                if (userCfg[modeKey] === 'gif') {
                    payload.embeds = [
                        new EmbedBuilder()
                            .setColor(getRandomColor())
                            .setImage(gifUrl)
                    ];
                }

                message.channel.send(payload).catch(() => {});
                activeTimers.delete(timerKey);
            }, timeMs);

            activeTimers.set(timerKey, timer);
        };

        if ((msgLower === 'owo' || msgLower === 'uwu') && userCfg.owoEnabled) {
            handleTimer('owo', 15000, serverCfg.owoMsg, 'owoMode', userCfg.owoGif);
            return;
        }

        const isHunt = ['wh', 'owo hunt', 'owo h'].includes(msgLower) || msgLower.startsWith('wh ') || msgLower.startsWith('owo h ');
        if (isHunt && userCfg.huntEnabled) {
            handleTimer('hunt', 15000, serverCfg.huntMsg, 'huntMode', userCfg.huntGif);
            return;
        }

        const isGod = ['gh', 'owo gh'].includes(msgLower) || msgLower.startsWith('gh ') || msgLower.startsWith('owo gh ');
        if (isGod && userCfg.godEnabled) {
            handleTimer('god', 15000, serverCfg.godMsg, 'godMode', userCfg.godGif);
            return;
        }

        const isPray = msgLower.includes('wpray') || msgLower.includes('owo pray') || msgLower === 'wp' || msgLower === 'pr';
        if (isPray && userCfg.prayEnabled) {
            handleTimer('pray', 300000, serverCfg.prayMsg, 'prayMode', userCfg.prayGif);
            return;
        }

        const isVote = ['owo vote', 'w vote', 'vote'].includes(msgLower) || msgLower.startsWith('ov') || msgLower.startsWith('wv');
        if (isVote && userCfg.voteEnabled) {
            const voteTimeMs = 12 * 60 * 60 * 1000;
            handleTimer('vote', voteTimeMs, serverCfg.voteMsg, 'voteMode', userCfg.voteGif);
            message.channel.send(`✅ <@${userId}> Pengingat vote 12 jam berhasil dipasang! 🗳️`).catch(() => {});
            return;
        }

    } catch (err) {
        console.error("Message error:", err);
    }
});

// --- 🔘 BUTTON INTERACTION HANDLER ---
client.on('interactionCreate', async (interaction) => {
    try {
        if (!interaction.isButton()) return;
        const guildId = interaction.guild?.id || 'dm';
        const serverCfg = getServerConfig(guildId);

        if (interaction.customId === 'help_reminders') {
            return interaction.update({ embeds: [createHelpEmbed(interaction.guild?.name, interaction.user.displayAvatarURL(), serverCfg.botPrefix)], components: [createHelpButtons()] });
        }
        
        if (interaction.customId === 'help_utility') {
            const embed = new EmbedBuilder()
                .setColor(getRandomColor())
                .setTitle('🛠️ Commands Utilitas')
                .setDescription(`\`${serverCfg.botPrefix} ping\` | \`${serverCfg.botPrefix} uptime\` | \`${serverCfg.botPrefix} clear <jumlah>\``);
            return interaction.update({ embeds: [embed], components: [createHelpButtons()] });
        }

        if (interaction.customId === 'help_settings') {
            return interaction.update({ embeds: [createServerSettingsEmbed(guildId)], components: [createHelpButtons()] });
        }
    } catch (err) {
        console.error("Button error:", err);
    }
});

client.login(process.env.TOKEN);
