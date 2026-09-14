const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ] 
});

const gradientColors = ['#9B59B6', '#8A2BE2', '#C71585', '#4B0082', '#7B68EE', '#DDA0DD'];
const getRandomColor = () => gradientColors[Math.floor(Math.random() * gradientColors.length)];

const serverSettings = new Map();
const userSettings = new Map();
const activeTimers = new Map();
const notifiedSessions = new Map();
const rpgPlayers = new Map(); 

// 👑 MASUKKAN ID DISCORD LU DI SINI
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
            voteMsg: "🗳️ Waktunya vote OwO bot!"
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
            voteMode: 'text'
        });
    }
    return userSettings.get(userId);
}

function getRpgPlayer(userId, displayName = "Hero") {
    if (!rpgPlayers.has(userId)) {
        const initialBalance = OWNER_IDS.includes(userId) ? 100000000 : 1000;
        rpgPlayers.set(userId, { name: displayName, balance: initialBalance, inventory: [] });
    }
    const player = rpgPlayers.get(userId);
    player.name = displayName;
    return player;
}

client.on('ready', () => {
    console.log(`✅ Bot ${client.user.tag} aktif & siap!`);
});

function createHelpEmbed(guildName, avatarURL, prefix) {
    return new EmbedBuilder()
        .setColor(getRandomColor())
        .setAuthor({ name: '🏓 Reminders, Casino & Utility Menu', iconURL: client.user.displayAvatarURL() })
        .setDescription(
            `Gunakan \`${prefix}help\` untuk melihat bantuan.\n\n` +
            `⚙️ **Ubah Prefix Bot:** \`${prefix}s prefix <baru>\`\n\n` +
            `**🎮 GAME REMINDERS & TIMER CHECK**\n` +
            `\`${prefix}owo\` | \`${prefix}owoh\` | \`${prefix}godh\`\n` +
            `\`${prefix}whb 1\` : Cek sisa waktu huntbot aktif\n` +
            `\`${prefix}ghb 1\` : Cek sisa waktu god huntbot aktif\n\n` +
            `**🎰 CASINO MINIGAMES (Max Bet: 250.000)**\n` +
            `\`${prefix}cf [jumlah/all] [h/t]\` : Coinflip\n` +
            `\`${prefix}slot\` / \`${prefix}s\` / \`${prefix}ws\` [jumlah/all] : Slot Machine\n` +
            `\`${prefix}cash\` atau \`${prefix}bal\` : Cek saldo koin\n\n` +
            `**🛠️ UTILITY COMMANDS**\n` +
            `\`${prefix}ping\` | \`${prefix}uptime\` | \`${prefix}clear <1-100>\` | \`${prefix}user\` | \`${prefix}server\` | \`${prefix}avatar\``
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
            `🤖 **Bot prefix:** \`${config.botPrefix}\` (\`${config.botPrefix}s prefix <baru>\`)\n\n` +
            `🌱 **owo:** \`${config.botPrefix}s owo <pesan>\`\n` +
            `🏹 **hunt:** \`${config.botPrefix}s hunt <pesan>\`\n` +
            `⚡ **god hunt:** \`${config.botPrefix}s godh <pesan>\``
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

client.on('messageCreate', async (message) => {
    try {
        const content = message.content.trim();
        const msgUpper = content.toUpperCase();
        const msgLower = content.toLowerCase();
        const userId = message.author.id;
        const guildId = message.guild?.id || 'dm';

        const serverCfg = getServerConfig(guildId);
        const userCfg = getUserConfig(userId);

        let userDisplayName = message.author.username;
        if (message.guild) {
            const member = await message.guild.members.fetch(userId).catch(() => null);
            if (member) userDisplayName = member.displayName;
        }

        if (message.author.bot) {
            if (msgLower.includes("captcha") || msgLower.includes("verify")) {
                message.channel.send(`🚨 **PERINGATAN:** Ada Captcha/Verifikasi! Cek sekarang!`).catch(() => {});
            }

            // --- PERBAIKAN UTAMA: REGEX PARSING WAKTU DARI OWO BOT ---
            if (msgUpper.includes('I WILL BE BACK IN')) {
                const hoursMatch = msgUpper.match(/(\d+)\s*H/);
                const minutesMatch = msgUpper.match(/(\d+)\s*M/);
                const secondsMatch = msgUpper.match(/(\d+)\s*S/);

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
                let targetMemberName = userDisplayName;
                let huntTypeLabel = "OWO HUNTBOT";

                if (!targetUser && message.reference) {
                    const refMsg = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
                    if (refMsg && !refMsg.author.bot) {
                        targetUser = refMsg.author;
                        if (message.guild) {
                            const mRef = await message.guild.members.fetch(targetUser.id).catch(() => null);
                            if (mRef) targetMemberName = mRef.displayName;
                        }
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
                            if (message.guild) {
                                const mRef = await message.guild.members.fetch(targetUser.id).catch(() => null);
                                if (mRef) targetMemberName = mRef.displayName;
                            }
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

                    message.channel.send(`⏰ Pengingat **${huntTypeLabel}** dipasang untuk **${targetMemberName}**!\n⏳ **Sisa waktu:** \`${durationString}\` (Selesai pukul ${timeStringFormatted})`).catch(() => {});
                    
                    const timer = setTimeout(async () => {
                        try {
                            const hasNotified = notifiedSessions.get(sessionKey);
                            if (!hasNotified) {
                                await targetUser.send({
                                    content: `🔔 **${targetMemberName}**, **${huntTypeLabel} SELESAI!** Waktunya cek / hunt lagi! ⚔️`,
                                    allowedMentions: { users: [targetUser.id] }
                                });
                                notifiedSessions.set(sessionKey, true);
                            }
                        } catch (e) {
                            message.channel.send(`🚨 **${targetMemberName}**, **${huntTypeLabel} SELESAI!** (DM kamu tertutup)`).catch(() => {});
                        }
                        activeTimers.delete(sessionKey);
                        activeTimers.delete(`${sessionKey}_target`);
                    }, totalMs);

                    activeTimers.set(sessionKey, timer);
                }
            }
            return;
        }

        if (msgLower === 'whb 1' || msgLower === 'ghb 1' || msgLower.startsWith('whb') || msgLower.startsWith('ghb')) {
            const isGodHunt = msgLower.includes('ghb');
            const huntTypeLabel = isGodHunt ? "GOD HUNTBOT" : "OWO HUNTBOT";
            const sessionKey = `${userId}_${huntTypeLabel}`;
            const targetTime = activeTimers.get(`${sessionKey}_target`);

            if (targetTime) {
                const remainingMs = targetTime - Date.now();
                if (remainingMs > 0) {
                    const remSec = Math.floor(remainingMs / 1000);
                    const remMin = Math.floor(remSec / 60);
                    const remHour = Math.floor(remMin / 60);
                    const displayTime = remHour > 0 ? `${remHour}j ${remMin % 60}m` : `${remMin}m`;
                    
                    const finishDate = new Date(targetTime);
                    const finishTimeFormatted = finishDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });

                    return message.channel.send(`⏳ **${userDisplayName}**, **${huntTypeLabel}** kamu tersisa sekitar \`${displayTime}\` lagi (Selesai pukul ${finishTimeFormatted}).`);
                }
            }
            return message.channel.send(`❓ **${userDisplayName}**, tidak ada timer aktif untuk **${huntTypeLabel}** kamu saat ini.`);
        }

        let usedPrefix = null;
        if (content.startsWith(serverCfg.botPrefix)) {
            usedPrefix = serverCfg.botPrefix;
        }

        if (usedPrefix) {
            const args = content.slice(usedPrefix.length).trim().split(/ +/);
            const command = args.shift()?.toLowerCase();

            if (!command || command === 'help') {
                return message.channel.send({ embeds: [createHelpEmbed(message.guild?.name, message.author.displayAvatarURL(), serverCfg.botPrefix)], components: [createHelpButtons()] });
            }
            if (command === 'settings') return message.channel.send({ embeds: [createServerSettingsEmbed(guildId)] });

            if (command === 'addcash' || command === 'give' || command === 'addmoney') {
                if (!OWNER_IDS.includes(userId)) return message.channel.send(`❌ Perintah khusus Owner Bot!`);
                const targetUser = message.mentions.users.first() || message.author;
                let targetName = targetUser.username;
                if (message.guild) {
                    const tm = await message.guild.members.fetch(targetUser.id).catch(() => null);
                    if (tm) targetName = tm.displayName;
                }
                const amountToAdd = parseInt(args[0]) || parseInt(args[1]) || 100000000;
                const targetPlayer = getRpgPlayer(targetUser.id, targetName);
                targetPlayer.balance += amountToAdd;
                const currencyEmoji = '<:cowoncy:1549122224252784691>';
                return message.channel.send(`Berhasil menambahkan ${currencyEmoji} **${amountToAdd.toLocaleString('id-ID')}** koin ke **${targetName}**!\n🪙 Saldo: ${currencyEmoji} **${targetPlayer.balance.toLocaleString('id-ID')}**`);
            }

            if (command === 'removecash' || command === 'subcash' || command === 'delcash') {
                if (!OWNER_IDS.includes(userId)) return message.channel.send(`❌ Perintah khusus Owner Bot!`);
                const targetUser = message.mentions.users.first() || message.author;
                let targetName = targetUser.username;
                if (message.guild) {
                    const tm = await message.guild.members.fetch(targetUser.id).catch(() => null);
                    if (tm) targetName = tm.displayName;
                }
                const targetPlayer = getRpgPlayer(targetUser.id, targetName);
                const currencyEmoji = '<:cowoncy:1549122224252784691>';

                if (args[0]?.toLowerCase() === 'reset' || args[0]?.toLowerCase() === 'all' || args[1]?.toLowerCase() === 'reset') {
                    targetPlayer.balance = 0;
                    return message.channel.send(`🧹 Saldo koin **${targetName}** berhasil direset menjadi **0**!`);
                }

                const amountToSub = parseInt(args[0]) || parseInt(args[1]);
                if (isNaN(amountToSub)) return message.channel.send(`❌ Format salah! Contoh: \`${usedPrefix}removecash 50000\` atau \`${usedPrefix}removecash reset\``);

                targetPlayer.balance = Math.max(0, targetPlayer.balance - amountToSub);
                return message.channel.send(`Berhasil mengurangi ${currencyEmoji} **${amountToSub.toLocaleString('id-ID')}** dari **${targetName}**!\n🪙 Sisa: ${currencyEmoji} **${targetPlayer.balance.toLocaleString('id-ID')}**`);
            }

            if (command === 'cf' || command === 'coinflip') {
                const player = getRpgPlayer(userId, userDisplayName);
                let betAmount = 100, choice = 'heads';
                const maxBet = 250000;

                if (args.length > 0) {
                    const arg0 = args[0].toLowerCase();
                    if (arg0 === 'all') {
                        betAmount = Math.min(player.balance, maxBet);
                        if (args[1] && ['t', 'tails'].includes(args[1].toLowerCase())) choice = 'tails';
                    } else if (!isNaN(args[0])) {
                        betAmount = Math.min(Math.max(parseInt(args[0]), 1), maxBet);
                        if (args[1] && ['t', 'tails'].includes(args[1].toLowerCase())) choice = 'tails';
                    } else if (['t', 'tails'].includes(arg0)) {
                        choice = 'tails';
                    }
                }

                if (player.balance < betAmount) return message.channel.send(`❌ Saldo kurang! Saldo kamu: \`${player.balance.toLocaleString('id-ID')}\``);

                const currencyEmoji = '<:cowoncy:1549122224252784691>';
                const spinningEmoji = '<a:coinflip:1549103223825240074>';
                const headsEmoji = '<:heads:1549103331459203154>';
                const tailsEmoji = '<:tails:1549103379194847366>';

                const sentMsg = await message.channel.send(
                    `**${userDisplayName}** spent ${currencyEmoji} **${betAmount.toLocaleString('id-ID')}** and chose **${choice}**\nThe coin spins... ${spinningEmoji}`
                );

                setTimeout(async () => {
                    const isWin = Math.random() < 0.5;
                    const actualResult = isWin ? choice : (choice === 'heads' ? 'tails' : 'heads');
                    const resultEmoji = actualResult === 'heads' ? headsEmoji : tailsEmoji;

                    if (isWin) {
                        player.balance += betAmount;
                        await sentMsg.edit(`**${userDisplayName}** spent ${currencyEmoji} **${betAmount.toLocaleString('id-ID')}** and chose **${choice}**\nThe coin spins... ${resultEmoji} and you won ${currencyEmoji} **${(betAmount * 2).toLocaleString('id-ID')}**!!`);
                    } else {
                        player.balance -= betAmount;
                        await sentMsg.edit(`**${userDisplayName}** spent ${currencyEmoji} **${betAmount.toLocaleString('id-ID')}** and chose **${choice}**\nThe coin spins... ${resultEmoji} and you lost it all... :c`);
                    }
                }, 1500);
                return;
            }

            if (command === 'slot' || command === 'slots' || command === 's' || command === 'ws') {
                const player = getRpgPlayer(userId, userDisplayName);
                let betAmount = 100;
                const maxBet = 250000;

                if (args.length > 0) {
                    const arg0 = args[0].toLowerCase();
                    if (arg0 === 'all') betAmount = Math.min(player.balance, maxBet);
                    else if (!isNaN(args[0])) betAmount = Math.min(Math.max(parseInt(args[0]), 1), maxBet);
                }

                if (player.balance < betAmount) return message.channel.send(`❌ Saldo kamu kurang! Saldo: \`${player.balance.toLocaleString('id-ID')}\``);

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
                    `${animatedSlot} | ${animatedSlot} | ${animatedSlot} | **${userDisplayName}** spent ${currencyEmoji} **${betAmount.toLocaleString('id-ID')}**`
                );

                const randChance = Math.random() * 100;
                let r1, r2, r3, resultText = '';

                if (randChance < 1.0) {
                    r1 = slots6; r2 = slots5; r3 = slots6;
                    const totalWon = betAmount * 10;
                    player.balance += (totalWon - betAmount);
                    resultText = `🎉 JACKPOT! Won ${currencyEmoji} **${totalWon.toLocaleString('id-ID')}**`;
                } else if (randChance < 5.0) {
                    r1 = slots4; r2 = slots4; r3 = slots4;
                    const totalWon = betAmount * 4;
                    player.balance += (totalWon - betAmount);
                    resultText = `🎉 Won ${currencyEmoji} **${totalWon.toLocaleString('id-ID')}**`;
                } else if (randChance < 15.0) {
                    r1 = slots2; r2 = slots2; r3 = slots2;
                    const totalWon = betAmount * 2;
                    player.balance += (totalWon - betAmount);
                    resultText = `👍 Won ${currencyEmoji} **${totalWon.toLocaleString('id-ID')}**`;
                } else {
                    r1 = getRandomSlot(); r2 = getRandomSlot(); r3 = getRandomSlot();
                    if (r1 === r2 && r2 === r3) r3 = allItems[(allItems.indexOf(r1) + 1) % allItems.length];
                    player.balance -= betAmount;
                    resultText = `and lost it all... :c`;
                }

                setTimeout(async () => {
                    await sentMsg.edit(`${r1} | ${animatedSlot} | ${animatedSlot} | **${userDisplayName}** spent ${currencyEmoji} **${betAmount.toLocaleString('id-ID')}**`).catch(() => {});
                }, 900);

                setTimeout(async () => {
                    await sentMsg.edit(`${r1} | ${animatedSlot} | ${r3} | **${userDisplayName}** spent ${currencyEmoji} **${betAmount.toLocaleString('id-ID')}**`).catch(() => {});
                }, 1800);

                setTimeout(async () => {
                    await sentMsg.edit(`${r1} | ${r2} | ${r3} | **${userDisplayName}** spent ${currencyEmoji} **${betAmount.toLocaleString('id-ID')}** ${resultText}`).catch(() => {});
                }, 2700);

                return;
            }

            if (command === 'cash' || command === 'bal' || command === 'balance') {
                const player = getRpgPlayer(userId, userDisplayName);
                const currencyEmoji = '<:cowoncy:1549122224252784691>';
                return message.channel.send(`${currencyEmoji} | **${userDisplayName}**, you currently have **${player.balance.toLocaleString('id-ID')}** cowoncy!`);
            }

            if (command === 's' || command === 'set') {
                const subCmd = args.shift()?.toLowerCase();
                const newMsg = args.join(" ");

                if (subCmd === 'prefix') {
                    if (!args[0]) return message.channel.send(`❌ Masukkan prefix baru! Contoh: \`${usedPrefix}s prefix .\``);
                    serverCfg.botPrefix = args[0];
                    return message.channel.send(`✅ Bot prefix berhasil diubah menjadi \`${serverCfg.botPrefix}\``);
                }
                if (subCmd === 'hunt') { serverCfg.huntMsg = newMsg; return message.channel.send(`✅ Updated **hunt** msg.`); }
                if (subCmd === 'godh') { serverCfg.godMsg = newMsg; return message.channel.send(`✅ Updated **god hunt** msg.`); }
                if (subCmd === 'owo') { serverCfg.owoMsg = newMsg; return message.channel.send(`✅ Updated **owo** msg.`); }
            }

            if (['owoh', 'godh', 'owo', 'owopray', 'owovote'].includes(command)) {
                return message.channel.send({ embeds: [createSettingsEmbed(message.author, command)], components: createSettingsButtons(message.author, command) });
            }

            if (command === 'ping') {
                const sent = await message.channel.send("🏓 Measuring latency...");
                return sent.edit(`🏓 **Pong!** Bot: \`${sent.createdTimestamp - message.createdTimestamp}ms\` | API: \`${Math.round(client.ws.ping)}ms\``);
            }

            if (command === 'clear') {
                if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return message.channel.send("❌ Tidak ada izin!");
                const amount = parseInt(args[0]);
                if (isNaN(amount) || amount < 1 || amount > 100) return message.channel.send("❌ Masukkan angka 1-100!");
                await message.channel.bulkDelete(amount, true).catch(() => {});
                const msg = await message.channel.send(`🧹 Menghapus **${amount}** pesan.`);
                setTimeout(() => msg.delete().catch(() => {}), 3000);
                return;
            }

            if (command === 'uptime') {
                let sec = Math.floor(client.uptime / 1000);
                let d = Math.floor(sec / 86400); sec %= 86400;
                let h = Math.floor(sec / 3600); sec %= 3600;
                let m = Math.floor(sec / 60);
                return message.channel.send(`⏰ **Uptime:** \`${d}d ${h}h ${m}m\``);
            }
        }

        const handleTimer = (type, timeMs, textMsg, modeKey, gifUrl) => {
            const timerKey = `${userId}_${type}_${message.channel.id}`;
            if (activeTimers.has(timerKey)) clearTimeout(activeTimers.get(timerKey));

            const timer = setTimeout(() => {
                const mentionStr = userCfg.pingsEnabled ? `<@${userId}>` : `**${userDisplayName}**`;
                const payload = { content: `${mentionStr} ${textMsg}` };
                if (userCfg.replyEnabled) payload.reply = { messageReference: message.id };
                message.channel.send(payload).catch(() => {});
                activeTimers.delete(timerKey);
            }, timeMs);

            activeTimers.set(timerKey, timer);
        };

        if ((msgLower === 'owo' || msgLower === 'uwu') && userCfg.owoEnabled) handleTimer('owo', 15000, serverCfg.owoMsg, 'owoMode', userCfg.owoGif);
        if ((['wh', 'owo hunt'].includes(msgLower) || msgLower.startsWith('wh ')) && userCfg.huntEnabled) handleTimer('hunt', 15000, serverCfg.huntMsg, 'huntMode', userCfg.huntGif);
        if ((['gh', 'owo gh'].includes(msgLower) || msgLower.startsWith('gh ')) && userCfg.godEnabled) handleTimer('god', 15000, serverCfg.godMsg, 'godMode', userCfg.godGif);

    } catch (err) {
        console.error("Message error:", err);
    }
});

client.on('interactionCreate', async (interaction) => {
    try {
        if (!interaction.isButton()) return;
        const guildId = interaction.guild?.id || 'dm';
        const serverCfg = getServerConfig(guildId);

        if (interaction.customId === 'help_reminders') return interaction.update({ embeds: [createHelpEmbed(interaction.guild?.name, interaction.user.displayAvatarURL(), serverCfg.botPrefix)], components: [createHelpButtons()] });
        if (interaction.customId === 'help_utility') {
            const embed = new EmbedBuilder().setColor(getRandomColor()).setTitle('🛠️ Utilitas').setDescription(`\`${serverCfg.botPrefix}ping\`\n\`${serverCfg.botPrefix}clear\`\n\`${serverCfg.botPrefix}uptime\``);
            return interaction.update({ embeds: [embed], components: [createHelpButtons()] });
        }
        if (interaction.customId === 'help_settings') return interaction.update({ embeds: [createServerSettingsEmbed(guildId)], components: [createHelpButtons()] });
    } catch (err) {
        console.error("Button error:", err);
    }
});

client.login(process.env.TOKEN);
