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
const OWNER_IDS = ['1435043081316466720']; 

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
            `⚙️ **Ubah Prefix Bot:** \`${prefix} s prefix <baru>\`\n\n` +
            `**👑 OWNER COMMANDS**\n` +
            `\`${prefix} addcash [jumlah] [@user]\` : Tambah koin\n` +
            `\`${prefix} removecash [jumlah] [@user]\` : Kurangi / reset koin\n\n` +
            `**🎮 GAME REMINDERS & TIMER CHECK**\n` +
            `\`${prefix} owo\` | \`${prefix} owoh\` | \`${prefix} godh\`\n` +
            `\`${prefix} whb 1\` : Cek sisa waktu huntbot aktif\n` +
            `\`${prefix} ghb 1\` : Cek sisa waktu god huntbot aktif\n\n` +
            `**🎰 CASINO MINIGAMES (Max Bet: 250.000)**\n` +
            `\`${prefix} cf [jumlah/all] [h/t]\` : Coinflip (OwO Style)\n` +
            `\`${prefix} slot\` / \`${prefix} s\` / \`${prefix} ws\` [jumlah/all] : Slot Machine\n` +
            `\`${prefix} m [jumlah/all] [bom]\` : Mines Game (Grid 3x3 Ala OwO)\n` +
            `\`${prefix} cash\` atau \`${prefix} bal\` : Cek saldo koin\n\n` +
            `**🛠️ UTILITY COMMANDS**\n` +
            `\`${prefix} ping\` | \`${prefix} uptime\` | \`${prefix} clear <1-100>\` | \`${prefix} user\` | \`${prefix} server\` | \`${prefix} avatar\``
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

function createSettingsEmbed(user, type) {
    const config = getUserConfig(user.id);
    const keyMap = { owoh: 'huntEnabled', godh: 'godEnabled', owo: 'owoEnabled', owopray: 'prayEnabled', owovote: 'voteEnabled' };
    const modeMap = { owoh: 'huntMode', godh: 'godMode', owo: 'owoMode', owopray: 'prayMode', owovote: 'voteMode' };
    const isEnabled = config[keyMap[type]];
    const currentMode = config[modeMap[type]];

    return new EmbedBuilder()
        .setColor(isEnabled ? getRandomColor() : '#F04747')
        .setAuthor({ name: `${user.username}'s ${type} settings`, iconURL: user.displayAvatarURL() })
        .setDescription(
            `${isEnabled ? '✅' : '❌'} **Reminder Enabled?**\n` +
            `${config.pingsEnabled ? '✅' : '❌'} **Pings Enabled?**\n` +
            `${config.replyEnabled ? '✅' : '❌'} **Inline Reply?**\n` +
            `💬 **Mode:** \`${currentMode?.toUpperCase() || 'TEXT'}\``
        );
}

function createSettingsButtons(user, type) {
    const config = getUserConfig(user.id);
    const keyMap = { owoh: 'huntEnabled', godh: 'godEnabled', owo: 'owoEnabled', owopray: 'prayEnabled', owovote: 'voteEnabled' };
    const modeMap = { owoh: 'huntMode', godh: 'godMode', owo: 'owoMode', owopray: 'prayMode', owovote: 'voteMode' };
    const isEnabled = config[keyMap[type]];

    return [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`toggle_enable_${type}_${user.id}`).setLabel(type).setEmoji('⚔️').setStyle(isEnabled ? ButtonStyle.Success : ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`toggle_ping_${type}_${user.id}`).setLabel('ping').setEmoji('🔴').setStyle(config.pingsEnabled ? ButtonStyle.Success : ButtonStyle.Secondary)
        ),
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`toggle_reply_${type}_${user.id}`).setLabel('reply').setEmoji('↩️').setStyle(config.replyEnabled ? ButtonStyle.Success : ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`toggle_mode_${type}_${user.id}`).setLabel(`mode: ${config[modeMap[type]]}`).setEmoji('🖼️').setStyle(ButtonStyle.Primary)
        )
    ];
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
                
                const finishDate = new Date(finishTimestamp);
                const timeStringFormatted = finishDate.toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: false 
                });

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
                    
                    const finishDate = new Date(targetTime);
                    const finishTimeFormatted = finishDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });

                    return message.channel.send(`⏳ **${huntTypeLabel}** kamu tersisa sekitar \`${displayTime}\` lagi (Selesai pukul ${finishTimeFormatted}).`);
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
                const currencyEmoji = '<:cowoncy:1549122224252784691>';

                return message.channel.send(`Berhasil menambahkan ${currencyEmoji} **${amountToAdd.toLocaleString('id-ID')}** koin ke akun <@${targetUser.id}>!\n🪙 Saldo sekarang: ${currencyEmoji} **${targetPlayer.balance.toLocaleString('id-ID')}**`);
            }

            // --- 👑 OWNER COMMAND: REMOVECASH / SUBCASH ---
            if (command === 'removecash' || command === 'subcash' || command === 'delcash') {
                if (!OWNER_IDS.includes(userId)) {
                    return message.channel.send(`❌ Perintah ini khusus untuk **Owner Bot**!`);
                }

                const targetUser = message.mentions.users.first() || message.author;
                const targetPlayer = getRpgPlayer(targetUser.id, targetUser.username);
                const currencyEmoji = '<:cowoncy:1549122224252784691>';

                if (args[0]?.toLowerCase() === 'reset' || args[0]?.toLowerCase() === 'all' || args[1]?.toLowerCase() === 'reset') {
                    targetPlayer.balance = 0;
                    return message.channel.send(`🧹 Berhasil mereset saldo koin <@${targetUser.id}> menjadi **0**!`);
                }

                const amountToSub = parseInt(args[0]) || parseInt(args[1]);
                if (isNaN(amountToSub)) {
                    return message.channel.send(`❌ Masukkan jumlah koin yang ingin dikurangi atau ketik \`reset\`! Contoh: \`${usedPrefix} removecash 50000\` atau \`${usedPrefix} removecash reset\``);
                }

                targetPlayer.balance = Math.max(0, targetPlayer.balance - amountToSub);
                return message.channel.send(`Berhasil mengurangi ${currencyEmoji} **${amountToSub.toLocaleString('id-ID')}** koin dari <@${targetUser.id}>!\n🪙 Sisa saldo: ${currencyEmoji} **${targetPlayer.balance.toLocaleString('id-ID')}**`);
            }

            // --- 🪙 MINIGAME: COINFLIP (!cf) ---
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
                        await sentMsg.edit(`<@${userId}> spent ${currencyEmoji} **${betAmount.toLocaleString('id-ID')}** and chose **${choice}**\nThe coin spins... ${resultEmoji} and you lost it all... :c`);
                    }
                }, 1500);
                return;
            }

            // --- 🎰 MINIGAME: SLOT MACHINE (!slot) ---
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

                const sentMsg = await message.channel.send(
                    `___SLOTS___\n` +
                    `${animatedSlot}  ${animatedSlot}  ${animatedSlot}     **${message.author.username}** bet ${currencyEmoji} **${betAmount.toLocaleString('id-ID')}**\n` +
                    `|                      |\n` +
                    `|                      |`
                );

                const randChance = Math.random() * 100;
                let r1, r2, r3;
                let multiplier = 0;
                let resultText = '';

                if (randChance < 1.0) {
                    r1 = slots6; r2 = slots5; r3 = slots6; 
                    multiplier = 10;
                    const totalWon = betAmount * multiplier;
                    player.balance += (totalWon - betAmount);
                    resultText = `and won ${currencyEmoji} **${totalWon.toLocaleString('id-ID')}**! 🎉 JACKPOT OWO!!`;
                } else if (randChance < 4.0) {
                    r1 = slots4; r2 = slots4; r3 = slots4;
                    multiplier = 4;
                    const totalWon = betAmount * multiplier;
                    player.balance += (totalWon - betAmount);
                    resultText = `and won ${currencyEmoji} **${totalWon.toLocaleString('id-ID')}**! 🎉`;
                } else if (randChance < 10.0) {
                    r1 = slots3; r2 = slots3; r3 = slots3;
                    multiplier = 3;
                    const totalWon = betAmount * multiplier;
                    player.balance += (totalWon - betAmount);
                    resultText = `and won ${currencyEmoji} **${totalWon.toLocaleString('id-ID')}**! 🎉`;
                } else if (randChance < 25.0) {
                    r1 = slots2; r2 = slots2; r3 = slots2;
                    multiplier = 2;
                    const totalWon = betAmount * multiplier;
                    player.balance += (totalWon - betAmount);
                    resultText = `and won ${currencyEmoji} **${totalWon.toLocaleString('id-ID')}**! 👍`;
                } else if (randChance < 45.0) {
                    r1 = slots1; r2 = slots1; r3 = slots1;
                    multiplier = 1;
                    const totalWon = betAmount * multiplier; 
                    resultText = `and won ${currencyEmoji} **${totalWon.toLocaleString('id-ID')}**! 👍`;
                } else {
                    r1 = getRandomSlot();
                    r2 = getRandomSlot();
                    r3 = getRandomSlot();
                    if (r1 === r2 && r2 === r3) {
                        r3 = allItems[(allItems.indexOf(r1) + 2) % allItems.length];
                    }
                    player.balance -= betAmount;
                    resultText = `and won nothing... :c`;
                }

                setTimeout(async () => {
                    await sentMsg.edit(
                        `___SLOTS___\n` +
                        `${r1}  ${animatedSlot}  ${animatedSlot}     **${message.author.username}** bet ${currencyEmoji} **${betAmount.toLocaleString('id-ID')}**\n` +
                        `|                      |\n` +
                        `|                      |`
                    ).catch(() => {});
                }, 900);

                setTimeout(async () => {
                    await sentMsg.edit(
                        `___SLOTS___\n` +
                        `${r1}  ${animatedSlot}  ${r3}     **${message.author.username}** bet ${currencyEmoji} **${betAmount.toLocaleString('id-ID')}**\n` +
                        `|                      |\n` +
                        `|                      |`
                    ).catch(() => {});
                }, 1800);

                setTimeout(async () => {
                    await sentMsg.edit(
                        `___SLOTS___\n` +
                        `${r1}  ${r2}  ${r3}     **${message.author.username}** bet ${currencyEmoji} **${betAmount.toLocaleString('id-ID')}**\n` +
                        `|                      |     ${resultText}\n` +
                        `|                      |`
                    ).catch(() => {});
                }, 2700);

                return;
            }

            // --- 💣 MINIGAME: MINES (!m / !mine) STYLE OWO EMBED ---
            if (command === 'm' || command === 'mine') {
                const player = getRpgPlayer(userId, message.author.username);
                const currencyEmoji = '<:cowoncy:1549122224252784691>';
                const maxBet = 250000;

                let betAmount = 100;
                let mineCount = 1;

                if (args.length > 0) {
                    const arg0 = args[0].toLowerCase();
                    if (arg0 === 'all') {
                        betAmount = Math.min(player.balance, maxBet);
                    } else if (!isNaN(args[0])) {
                        betAmount = parseInt(args[0]);
                        if (betAmount > maxBet) betAmount = maxBet;
                        if (betAmount < 1) betAmount = 1;
                    }

                    if (args[1] && !isNaN(args[1])) {
                        mineCount = parseInt(args[1]);
                        if (mineCount < 1) mineCount = 1;
                        if (mineCount > 8) mineCount = 8;
                    }
                }

                if (player.balance < betAmount) {
                    return message.channel.send(`❌ Saldo koin kamu kurang! Saldo kamu: ${currencyEmoji} \`${player.balance.toLocaleString('id-ID')}\``);
                }

                player.balance -= betAmount;

                let minePositions = [];
                while (minePositions.length < mineCount) {
                    let randPos = Math.floor(Math.random() * 9);
                    if (!minePositions.includes(randPos)) {
                        minePositions.push(randPos);
                    }
                }

                const minesSessionKey = `mines_${userId}`;
                
                const calculateMultiplier = (openedCount, mCount) => {
                    let mult = 1.0;
                    for (let i = 0; i < openedCount; i++) {
                        mult *= (9 - i) / (9 - mCount - i);
                    }
                    return Math.max(1.0, parseFloat((mult * 0.99).toFixed(2)));
                };

                const gameData = {
                    bet: betAmount,
                    mines: mineCount,
                    minePositions: minePositions,
                    opened: [],
                    gameOver: false,
                    messageRef: null
                };

                activeTimers.set(minesSessionKey, gameData);

                const buildMinesEmbed = (statusType, currentWin = 0, currentMult = 0.00, nextWin = 0, nextMult = 1.00) => {
                    let embedColor = '#2F3136'; 
                    let titleText = `💎 **<@${userId}>** started a mines game.`;
                    
                    if (statusType === 'cashout') {
                        embedColor = '#57F287';
                        titleText = `💎 **<@${userId}>** cashed out!`;
                    } else if (statusType === 'win') {
                        embedColor = '#57F287';
                        titleText = `👑 **<@${userId}>** cleared all safe spots! JACKPOT!!`;
                    } else if (statusType === 'lose') {
                        embedColor = '#ED4245';
                        titleText = `💥 **<@${userId}>** touched a mine!`;
                    }

                    let desc = 
                        `\`\`\`\n` +
                        `Bet:  ${betAmount.toLocaleString('id-ID')}   Mines: ${mineCount}\n` +
                        (statusType === 'lose' ? `Cash Out: 0 (0.00x)\n` : `Winnings: ${currentWin.toLocaleString('id-ID')} (${currentMult.toFixed(2)}x)\n`) +
                        (statusType === 'playing' ? `Next:     ${nextWin.toLocaleString('id-ID')} (${nextMult.toFixed(2)}x)\n` : ``) +
                        `\`\`\`\n` +
                        `────────────────────────`;

                    return new EmbedBuilder()
                        .setColor(embedColor)
                        .setDescription(`${titleText}\n${desc}`);
                };

                const generateMinesComponents = (isEnded = false) => {
                    let rows = [];
                    for (let r = 0; r < 3; r++) {
                        let rowComponents = new ActionRowBuilder();
                        for (let c = 0; c < 3; c++) {
                            let index = r * 3 + c;
                            let btnId = `mine_click_${userId}_${index}`;
                            let label = "?";
                            let style = ButtonStyle.Secondary;
                            let disabled = isEnded;

                            if (gameData.opened.includes(index)) {
                                label = "💎";
                                style = ButtonStyle.Success;
                                disabled = true;
                            } else if (isEnded) {
                                if (gameData.minePositions.includes(index)) {
                                    label = "💣";
                                    style = ButtonStyle.Danger;
                                } else {
                                    label = "💎";
                                    style = ButtonStyle.Secondary;
                                }
                                disabled = true;
                            }

                            rowComponents.addComponents(
                                new ButtonBuilder().setCustomId(btnId).setLabel(label).setStyle(style).setDisabled(disabled)
                            );
                        }
                        rows.push(rowComponents);
                    }

                    let currentOpened = gameData.opened.length;
                    let cashOutRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`mine_cashout_${userId}`)
                            .setLabel(`Cash Out`)
                            .setStyle(ButtonStyle.Success)
                            .setDisabled(isEnded || currentOpened === 0)
                    );

                    rows.push(cashOutRow);
                    return rows;
                };

                let initialNextMult = calculateMultiplier(1, mineCount);
                let initialNextWin = Math.floor(betAmount * initialNextMult);

                const sentGameMsg = await message.channel.send({
                    embeds: [buildMinesEmbed('playing', 0, 0.00, initialNextWin, initialNextMult)],
                    components: generateMinesComponents(false)
                });

                gameData.messageRef = sentGameMsg;
                return;
            }

            // --- 🪙 CEK SALDO (!cash) ---
            if (command === 'cash' || command === 'bal' || command === 'balance') {
                const player = getRpgPlayer(userId, message.author.username);
                const currencyEmoji = '<:cowoncy:1549122224252784691>';
                return message.channel.send(`${currencyEmoji} | **${message.author.username}**, you currently have **${player.balance.toLocaleString('id-ID')}** cowoncy!`);
            }

            // --- ⚙️ SERVER SETTINGS ---
            if (command === 's' || command === 'set') {
                const subCmd = args.shift()?.toLowerCase();
                const newMsg = args.join(" ");

                if (subCmd === 'prefix') {
                    if (!args[0]) return message.channel.send(`❌ Masukkan prefix baru! Contoh: \`${usedPrefix} s prefix .\``);
                    serverCfg.botPrefix = args[0];
                    return message.channel.send(`✅ Bot prefix berhasil diubah menjadi \`${serverCfg.botPrefix}\``);
                }
                if (subCmd === 'owoprefix') {
                    if (!args[0]) return message.channel.send(`❌ Masukkan owo prefix baru! Contoh: \`${usedPrefix} s owoprefix w\``);
                    serverCfg.owoPrefix = args[0];
                    return message.channel.send(`✅ OwO prefix berhasil diubah menjadi \`${serverCfg.owoPrefix}\``);
                }

                if (subCmd === 'hunt') { serverCfg.huntMsg = newMsg; return message.channel.send(`✅ Updated **hunt** msg.`); }
                if (subCmd === 'godh' || subCmd === 'god') { serverCfg.godMsg = newMsg; return message.channel.send(`✅ Updated **god hunt** msg.`); }
                if (subCmd === 'owo') { serverCfg.owoMsg = newMsg; return message.channel.send(`✅ Updated **owo** msg.`); }
                if (subCmd === 'pray') { serverCfg.prayMsg = newMsg; return message.channel.send(`✅ Updated **pray** msg.`); }
                if (subCmd === 'vote') { serverCfg.voteMsg = newMsg; return message.channel.send(`✅ Updated **vote** msg.`); }
            }

            if (['owoh', 'godh', 'owo', 'owopray', 'owovote'].includes(command)) {
                return message.channel.send({ embeds: [createSettingsEmbed(message.author, command)], components: createSettingsButtons(message.author, command) });
            }

            if (command === 'gif') {
                const kategori = args[0]?.toLowerCase();
                const linkGif = args[1];
                if (!kategori || !linkGif) return message.channel.send(`❌ Format: \`${usedPrefix} gif godh <link_gif>\``);
                if (kategori === 'owo') userCfg.owoGif = linkGif;
                else if (kategori === 'hunt' || kategori === 'owoh') userCfg.huntGif = linkGif;
                else if (kategori === 'godh' || kategori === 'god' || kategori === 'gh') userCfg.godGif = linkGif;
                else if (kategori === 'pray' || kategori === 'owopray') userCfg.prayGif = linkGif;
                else if (kategori === 'vote' || kategori === 'owovote') userCfg.voteGif = linkGif;
                return message.channel.send(`✅ GIF **${kategori}** diperbarui!`);
            }

            // --- 🛠️ UTILITY COMMANDS HANDLER ---
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

            if (command === 'user') {
                const targetUser = message.mentions.users.first() || message.author;
                const member = await message.guild.members.fetch(targetUser.id).catch(() => null);
                
                const embed = new EmbedBuilder()
                    .setColor(getRandomColor())
                    .setAuthor({ name: `User Info - ${targetUser.username}`, iconURL: targetUser.displayAvatarURL() })
                    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 512 }))
                    .addFields(
                        { name: '👤 Username', value: `${targetUser.tag}`, inline: true },
                        { name: '🆔 User ID', value: `\`${targetUser.id}\``, inline: true },
                        { name: '📅 Akun Dibuat', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`, inline: false }
                    );

                if (member) {
                    embed.addFields({ name: '📥 Masuk Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true });
                }

                return message.channel.send({ embeds: [embed] });
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

            if (command === 'server') {
                const guild = message.guild;
                const embed = new EmbedBuilder()
                    .setColor(getRandomColor())
                    .setTitle(`Server Info - ${guild.name}`)
                    .setThumbnail(guild.iconURL({ dynamic: true }))
                    .addFields(
                        { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
                        { name: '👥 Member Count', value: `\`${guild.memberCount}\` members`, inline: true },
                        { name: '📅 Server Dibuat', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: false }
                    );
                return message.channel.send({ embeds: [embed] });
            }

            if (command === 'avatar' || command === 'av') {
                const targetUser = message.mentions.users.first() || message.author;
                const avatarURL = targetUser.displayAvatarURL({ dynamic: true, size: 1024 });
                const embed = new EmbedBuilder()
                    .setColor(getRandomColor())
                    .setTitle(`Avatar - ${targetUser.username}`)
                    .setImage(avatarURL);
                return message.channel.send({ embeds: [embed] });
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
        const parts = interaction.customId.split('_');
        const guildId = interaction.guild?.id || 'dm';
        const serverCfg = getServerConfig(guildId);

        // --- 💣 INTERAKSI TOMBOL MINES ---
        if (interaction.customId.startsWith('mine_click_') || interaction.customId.startsWith('mine_cashout_')) {
            const actionType = parts[1]; 
            const ownerId = parts[2];
            
            if (interaction.user.id !== ownerId) {
                return interaction.reply({ content: '❌ Ini bukan game Mines kamu!', ephemeral: true });
            }

            const minesSessionKey = `mines_${ownerId}`;
            const gameData = activeTimers.get(minesSessionKey);

            if (!gameData || gameData.gameOver) {
                return interaction.update({ content: '❌ Game ini sudah selesai atau kedaluwarsa.', embeds: [], components: [] });
            }

            const player = getRpgPlayer(ownerId, interaction.user.username);

            const calculateMultiplier = (openedCount, mCount) => {
                let mult = 1.0;
                for (let i = 0; i < openedCount; i++) {
                    mult *= (9 - i) / (9 - mCount - i);
                }
                return Math.max(1.0, parseFloat((mult * 0.99).toFixed(2)));
            };

            const buildMinesEmbed = (statusType, currentWin = 0, currentMult = 0.00, nextWin = 0, nextMult = 1.00) => {
                let embedColor = '#2F3136';
                let titleText = `💎 **<@${ownerId}>** started a mines game.`;
                
                if (statusType === 'cashout') {
                    embedColor = '#57F287';
                    titleText = `💎 **<@${ownerId}>** cashed out!`;
                } else if (statusType === 'win') {
                    embedColor = '#57F287';
                    titleText = `👑 **<@${ownerId}>** cleared all safe spots! JACKPOT!!`;
                } else if (statusType === 'lose') {
                    embedColor = '#ED4245';
                    titleText = `💥 **<@${ownerId}>** touched a mine!`;
                }

                let desc = 
                    `\`\`\`\n` +
                    `Bet:  ${gameData.bet.toLocaleString('id-ID')}   Mines: ${gameData.mines}\n` +
                    (statusType === 'lose' ? `Cash Out: 0 (0.00x)\n` : `Winnings: ${currentWin.toLocaleString('id-ID')} (${currentMult.toFixed(2)}x)\n`) +
                    (statusType === 'playing' ? `Next:     ${nextWin.toLocaleString('id-ID')} (${nextMult.toFixed(2)}x)\n` : ``) +
                    `\`\`\`\n` +
                    `────────────────────────`;

                return new EmbedBuilder()
                    .setColor(embedColor)
                    .setDescription(`${titleText}\n${desc}`);
            };

            const generateEndedComponents = () => {
                let rows = [];
                for (let r = 0; r < 3; r++) {
                    let rowComponents = new ActionRowBuilder();
                    for (let c = 0; c < 3; c++) {
                        let index = r * 3 + c;
                        let label = "💎";
                        let style = ButtonStyle.Secondary;

                        if (gameData.minePositions.includes(index)) {
                            label = "💣";
                            style = ButtonStyle.Danger;
                        } else if (gameData.opened.includes(index)) {
                            label = "💎";
                            style = ButtonStyle.Success;
                        }

                        rowComponents.addComponents(
                            new ButtonBuilder().setCustomId(`disabled_${index}`).setLabel(label).setStyle(style).setDisabled(true)
                        );
                    }
                    rows.push(rowComponents);
                }
                return rows;
            };

            if (actionType === 'cashout') {
                gameData.gameOver = true;
                const openedCount = gameData.opened.length;
                const finalMult = calculateMultiplier(openedCount, gameData.mines);
                const totalWin = Math.floor(gameData.bet * finalMult);

                player.balance += totalWin;
                activeTimers.delete(minesSessionKey);

                return interaction.update({
                    embeds: [buildMinesEmbed('cashout', totalWin, finalMult)],
                    components: generateEndedComponents()
                });
            }

            if (actionType === 'click') {
                const index = parseInt(parts[3]);

                if (gameData.opened.includes(index)) {
                    return interaction.deferUpdate();
                }

                if (gameData.minePositions.includes(index)) {
                    gameData.gameOver = true;
                    activeTimers.delete(minesSessionKey);

                    let rows = [];
                    for (let r = 0; r < 3; r++) {
                        let rowComponents = new ActionRowBuilder();
                        for (let c = 0; c < 3; c++) {
                            let idx = r * 3 + c;
                            let label = "💎";
                            let style = ButtonStyle.Secondary;

                            if (idx === index) {
                                label = "💥";
                                style = ButtonStyle.Danger;
                            } else if (gameData.minePositions.includes(idx)) {
                                label = "💣";
                                style = ButtonStyle.Danger;
                            } else if (gameData.opened.includes(idx)) {
                                label = "💎";
                                style = ButtonStyle.Success;
                            }

                            rowComponents.addComponents(
                                new ButtonBuilder().setCustomId(`disabled_${idx}`).setLabel(label).setStyle(style).setDisabled(true)
                            );
                        }
                        rows.push(rowComponents);
                    }

                    return interaction.update({
                        embeds: [buildMinesEmbed('lose')],
                        components: rows
                    });
                }

                gameData.opened.push(index);
                const openedCount = gameData.opened.length;
                const maxSafeBoxes = 9 - gameData.mines;

                if (openedCount === maxSafeBoxes) {
                    gameData.gameOver = true;
                    const finalMult = calculateMultiplier(openedCount, gameData.mines);
                    const totalWin = Math.floor(gameData.bet * finalMult);
                    player.balance += totalWin;
                    activeTimers.delete(minesSessionKey);

                    return interaction.update({
                        embeds: [buildMinesEmbed('win', totalWin, finalMult)],
                        components: generateEndedComponents()
                    });
                }

                const currentMult = calculateMultiplier(openedCount, gameData.mines);
                const currentWin = Math.floor(gameData.bet * currentMult);
                
                const nextMult = calculateMultiplier(openedCount + 1, gameData.mines);
                const nextWin = Math.floor(gameData.bet * nextMult);

                let rows = [];
                for (let r = 0; r < 3; r++) {
                    let rowComponents = new ActionRowBuilder();
                    for (let c = 0; c < 3; c++) {
                        let idx = r * 3 + c;
                        let label = "?";
                        let style = ButtonStyle.Secondary;
                        let disabled = false;

                        if (gameData.opened.includes(idx)) {
                            label = "💎";
                            style = ButtonStyle.Success;
                            disabled = true;
                        }

                        rowComponents.addComponents(
                            new ButtonBuilder().setCustomId(`mine_click_${ownerId}_${idx}`).setLabel(label).setStyle(style).setDisabled(disabled)
                        );
                    }
                    rows.push(rowComponents);
                }

                rows.push(
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`mine_cashout_${ownerId}`)
                            .setLabel(`Cash Out`)
                            .setStyle(ButtonStyle.Success)
                    )
                );

                return interaction.update({
                    embeds: [buildMinesEmbed('playing', currentWin, currentMult, nextWin, nextMult)],
                    components: rows
                });
            }
        }

        if (interaction.customId === 'help_reminders') {
            return interaction.update({ embeds: [createHelpEmbed(interaction.guild?.name, interaction.user.displayAvatarURL(), serverCfg.botPrefix)], components: [createHelpButtons()] });
        }
        
        if (interaction.customId === 'help_utility') {
            const embed = new EmbedBuilder()
                .setColor(getRandomColor())
                .setTitle('🛠️ Commands Utilitas')
                .setDescription(
                    `\`${serverCfg.botPrefix} ping\` : Cek delay respon bot\n` +
                    `\`${serverCfg.botPrefix} clear <jumlah>\` : Hapus chat spam secara cepat\n` +
                    `\`${serverCfg.botPrefix} user [@user]\` : Tampilkan detail info user\n` +
                    `\`${serverCfg.botPrefix} uptime\` : Cek durasi bot menyala\n` +
                    `\`${serverCfg.botPrefix} server\` : Informasi server Discord\n` +
                    `\`${serverCfg.botPrefix} avatar [@user]\` : Ambil foto profil HD`
                );
            return interaction.update({ embeds: [embed], components: [createHelpButtons()] });
        }

        if (interaction.customId === 'help_settings') {
            return interaction.update({ embeds: [createServerSettingsEmbed(guildId)], components: [createHelpButtons()] });
        }

        if (parts[0] === 'toggle') {
            const [, key, type, ownerId] = parts;
            if (interaction.user.id !== ownerId) return interaction.reply({ content: '❌ Bukan settinganmu!', ephemeral: true });

            const config = getUserConfig(ownerId);
            const keyMap = { owoh: 'huntEnabled', godh: 'godEnabled', owo: 'owoEnabled', owopray: 'prayEnabled', owovote: 'voteEnabled' };
            const modeMap = { owoh: 'huntMode', godh: 'godMode', owo: 'owoMode', owopray: 'prayMode', owovote: 'voteMode' };

            if (key === 'enable') config[keyMap[type]] = !config[keyMap[type]];
            if (key === 'ping') config.pingsEnabled = !config.pingsEnabled;
            if (key === 'reply') config.replyEnabled = !config.replyEnabled;
            if (key === 'mode') config[modeMap[type]] = config[modeMap[type]] === 'text' ? 'gif' : 'text';

            return interaction.update({ embeds: [createSettingsEmbed(interaction.user, type)], components: createSettingsButtons(interaction.user, type) });
        }
    } catch (err) {
        console.error("Button error:", err);
    }
});

client.login(process.env.TOKEN);
