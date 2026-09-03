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

// 📦 Settings & Economy Maps
const serverSettings = new Map();
const userSettings = new Map();
const userEconomy = new Map();
const activeTimers = new Map();

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

function getUserBalance(userId) {
    if (!userEconomy.has(userId)) {
        userEconomy.set(userId, 10000000); // Saldo awal 10 Juta
    }
    return userEconomy.get(userId);
}

function setUserBalance(userId, amount) {
    userEconomy.set(userId, Math.max(0, amount));
}

client.on('ready', () => {
    console.log(`✅ Bot ${client.user.tag} aktif & siap dengan Animasi OwO!`);
});

// --- 🎨 EMBED HELP & SETTINGS ---
function createHelpEmbed(guildName, avatarURL, prefix) {
    return new EmbedBuilder()
        .setColor(getRandomColor())
        .setAuthor({ name: '🏓 Reminders, Utility & Mini-Games Menu', iconURL: client.user.displayAvatarURL() })
        .setDescription(
            `Gunakan \`${prefix} help\` untuk melihat bantuan.\n\n` +
            `💰 **EKONOMI & SALDO**\n` +
            `\`${prefix} bal\` : Cek saldo koin kamu\n\n` +
            `**🎮 GAME REMINDERS**\n` +
            `\`${prefix} owo\` | \`${prefix} owoh\` | \`${prefix} godh\` | \`${prefix} owopray\` | \`${prefix} owovote\`\n\n` +
            `**🎲 MINI-GAMES (OwO Style + Live Animation)**\n` +
            `\`${prefix} slot [taruhan/all]\` : Mesin slot muter 🍒\n` +
            `\`${prefix} cf [head/tail/all] [taruhan]\` : Lempar koin muter 🪙\n` +
            `\`${prefix} bj [taruhan/all]\` : Blackjack interaktif 🃏\n` +
            `\`${prefix} fish\` : Mancing ikan 🎣\n\n` +
            `**🛠️ UTILITY**\n` +
            `\`${prefix} ping\` | \`${prefix} clear\` | \`${prefix} user\` | \`${prefix} uptime\` | \`${prefix} server\` | \`${prefix} avatar\``
        )
        .setFooter({ text: `Server ${guildName || 'OPPAI'}`, iconURL: avatarURL || client.user.displayAvatarURL() });
}

function createHelpButtons() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('help_reminders').setLabel('Reminders').setEmoji('🏓').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('help_utility').setLabel('Utilitas & Games').setEmoji('🎲').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('help_settings').setLabel('Settings').setEmoji('⚙️').setStyle(ButtonStyle.Secondary)
    );
}

function createServerSettingsEmbed(guildId) {
    const config = getServerConfig(guildId);
    return new EmbedBuilder()
        .setColor(getRandomColor())
        .setTitle('Server Settings')
        .setDescription(
            `⚙️ **Bot prefix:** \`${config.botPrefix}\` (\`${config.botPrefix} s prefix <baru>\`)\n` +
            `🌱 **owo:** \`${config.botPrefix} s owo <pesan>\`\n` +
            `🏹 **hunt:** \`${config.botPrefix} s hunt <pesan>\`\n` +
            `⚡ **god hunt:** \`${config.botPrefix} s godh <pesan>\`\n` +
            `☘️ **pray:** \`${config.botPrefix} s pray <pesan>\`\n` +
            `🗳️ **vote:** \`${config.botPrefix} s vote <pesan>\``
        );
}

function createSettingsEmbed(user, type) {
    const config = getUserConfig(user.id);
    const keyMap = { owoh: 'huntEnabled', godh: 'godEnabled', owo: 'owoEnabled', owopray: 'prayEnabled', owovote: 'voteEnabled' };
    const modeMap = { owoh: 'huntMode', godh: 'godMode', owo: 'owoMode', owopray: 'prayMode', owovote: 'voteMode' };
    const isEnabled = config[keyMap[type]];

    return new EmbedBuilder()
        .setColor(isEnabled ? getRandomColor() : '#F04747')
        .setAuthor({ name: `${user.username}'s ${type} settings`, iconURL: user.displayAvatarURL() })
        .setDescription(
            `${isEnabled ? '✅' : '❌'} **Enabled?** | ${config.pingsEnabled ? '✅' : '❌'} **Ping?** | ${config.replyEnabled ? '✅' : '❌'} **Reply?**\n` +
            `💬 **Mode:** \`${config[modeMap[type]]?.toUpperCase() || 'TEXT'}\``
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
                let targetUser = message.mentions.users.first();
                let huntTypeLabel = "OWO HUNTBOT";

                if (!targetUser && message.reference) {
                    const refMsg = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
                    if (refMsg && !refMsg.author.bot) {
                        targetUser = refMsg.author;
                        if (refMsg.content.toLowerCase().includes('ghb') || refMsg.content.toLowerCase().includes('gah')) huntTypeLabel = "GOD HUNTBOT";
                    }
                }

                if (totalMs > 0 && targetUser) {
                    message.channel.send(`⏰ Pengingat **${huntTypeLabel}** dipasang untuk <@${targetUser.id}>!\n⏳ **Sisa waktu:** \`${durationString}\``).catch(() => {});
                    setTimeout(async () => {
                        try {
                            await targetUser.send({
                                content: `🔔 <@${targetUser.id}> **${huntTypeLabel} SELESAI!** Waktunya cek / hunt lagi! ⚔️`,
                                allowedMentions: { users: [targetUser.id] }
                            });
                        } catch (e) {
                            message.channel.send(`🚨 <@${targetUser.id}> **${huntTypeLabel} SELESAI!** (DM tertutup)`).catch(() => {});
                        }
                    }, totalMs);
                }
            }
            return;
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

            if (command === 'bal' || command === 'balance') {
                const currentBal = getUserBalance(userId);
                return message.channel.send(`🪙 **|** <@${userId}>, you have **${currentBal.toLocaleString()}** cowoncy! :herb:`);
            }

            if (command === 's' || command === 'set') {
                const subCmd = args.shift()?.toLowerCase();
                const newMsg = args.join(" ");
                if (subCmd === 'prefix') {
                    if (!args[0]) return message.channel.send(`❌ Masukkan prefix baru!`);
                    serverCfg.botPrefix = args[0];
                    return message.channel.send(`✅ Bot prefix diubah ke \`${serverCfg.botPrefix}\``);
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

            // --- 🎰 SLOT DENGAN LIVE EDIT ANIMASI MUTER (Persis OwO Bot) ---
            if (command === 'slot' || command === 'slt') {
                const betInput = args[0]?.toLowerCase();
                let betAmount = 100;
                const currentBal = getUserBalance(userId);

                if (betInput === 'all') betAmount = currentBal;
                else if (betInput && !isNaN(parseInt(betInput))) betAmount = parseInt(betInput);

                if (betAmount <= 0) return message.channel.send(`❌ Taruhan tidak valid!`);
                if (currentBal < betAmount) return message.channel.send(`🪙 **|** <@${userId}>, saldo kurang! (Punya: **${currentBal.toLocaleString()}** 🪙)`);

                const fruits = [' :cherries: ', ' :lemon: ', ' :watermelon: ', ' :grapes: ', ' :gem: ', ' :star: ', ' :seven: '];
                const getRandomFruit = () => fruits[Math.floor(Math.random() * fruits.length)];

                // Kirim pesan awal slot
                const msg = await message.channel.send(`🎲 **__SLOTS__**\n| :hourglass: | :hourglass: | :hourglass: |\n<@${userId}> bet **${betAmount.toLocaleString()}** 🪙`);

                // Animasi putaran 1 (Edit setelah 500ms)
                setTimeout(async () => {
                    await msg.edit(`🎲 **__SLOTS__**\n|${getRandomFruit()}|${getRandomFruit()}|${getRandomFruit()}|\n<@${userId}> bet **${betAmount.toLocaleString()}** 🪙`).catch(() => {});
                }, 500);

                // Animasi putaran 2 (Edit setelah 1000ms)
                setTimeout(async () => {
                    await msg.edit(`🎲 **__SLOTS__**\n|${getRandomFruit()}|${getRandomFruit()}|${getRandomFruit()}|\n<@${userId}> bet **${betAmount.toLocaleString()}** 🪙`).catch(() => {});
                }, 1000);

                // Hasil Akhir (Edit setelah 1500ms)
                setTimeout(async () => {
                    const finalFruits = [getRandomFruit(), getRandomFruit(), getRandomFruit()];
                    let reward = 0;
                    let resultText = "";

                    if (finalFruits[0] === finalFruits[1] && finalFruits[1] === finalFruits[2]) {
                        reward = betAmount * 5;
                        setUserBalance(userId, currentBal - betAmount + reward);
                        resultText = `and won **${reward.toLocaleString()}** cowoncy! **JACKPOT!** 🎉`;
                    } else if (finalFruits[0] === finalFruits[1] || finalFruits[1] === finalFruits[2] || finalFruits[0] === finalFruits[2]) {
                        reward = Math.floor(betAmount * 1.5);
                        setUserBalance(userId, currentBal - betAmount + reward);
                        resultText = `and won **${reward.toLocaleString()}** cowoncy! ✨`;
                    } else {
                        setUserBalance(userId, currentBal - betAmount);
                        resultText = `and won nothing... :c`;
                    }

                    const finalBal = getUserBalance(userId);
                    await msg.edit(`🎲 **__SLOTS__**\n|${finalFruits.join('|')}|\n<@${userId}> bet **${betAmount.toLocaleString()}** 🪙\n${resultText}\n🪙 Balance: **${finalBal.toLocaleString()}**`).catch(() => {});
                }, 1500);
                return;
            }

            // --- 🪙 COINFLIP DENGAN LIVE EDIT ANIMASI TOSSING ---
            if (command === 'cf' || command === 'coinflip') {
                let choice = args[0]?.toLowerCase();
                let betInput = args[1]?.toLowerCase();
                let userChoice = 'h';
                let betAmount = 100;
                const currentBal = getUserBalance(userId);

                if (['head', 'heads', 'h'].includes(choice)) userChoice = 'h';
                else if (['tail', 'tails', 't'].includes(choice)) userChoice = 't';
                else if (choice === 'all') betAmount = currentBal;
                else if (!isNaN(parseInt(choice))) betAmount = parseInt(choice);

                if (betInput === 'all') betAmount = currentBal;
                else if (betInput && !isNaN(parseInt(betInput))) betAmount = parseInt(betInput);

                if (betAmount <= 0) return message.channel.send(`❌ Taruhan tidak valid!`);
                if (currentBal < betAmount) return message.channel.send(`🪙 **|** <@${userId}>, saldo kurang!`);

                const choiceName = userChoice === 'h' ? 'heads' : 'tails';
                const msg = await message.channel.send(`<@${userId}> spent **${betAmount.toLocaleString()}** 🪙 and chose **${choiceName}**\nThe coin spins... 🔄`);

                setTimeout(async () => {
                    await msg.edit(`<@${userId}> spent **${betAmount.toLocaleString()}** 🪙 and chose **${choiceName}**\nThe coin spins... 🪙✨`).catch(() => {});
                }, 800);

                setTimeout(async () => {
                    const flipResult = Math.random() < 0.5 ? 'h' : 't';
                    const resultWord = flipResult === 'h' ? 'heads' : 'tails';
                    const isWin = userChoice === flipResult;
                    let finalBal;

                    if (isWin) {
                        setUserBalance(userId, currentBal + betAmount);
                        finalBal = getUserBalance(userId);
                        await msg.edit(`<@${userId}> spent **${betAmount.toLocaleString()}** 🪙 and chose **${choiceName}**\nThe coin spins... 🪙 and you won **${betAmount.toLocaleString()}**!! 🎉\n🪙 Balance: **${finalBal.toLocaleString()}**`).catch(() => {});
                    } else {
                        setUserBalance(userId, currentBal - betAmount);
                        finalBal = getUserBalance(userId);
                        await msg.edit(`<@${userId}> spent **${betAmount.toLocaleString()}** 🪙 and chose **${choiceName}**\nThe coin spins... 🦅 and you lost... 😢\n🪙 Balance: **${finalBal.toLocaleString()}**`).catch(() => {});
                    }
                }, 1500);
                return;
            }

            // --- 🃏 BLACKJACK INTERAKTIF (OwO Style) ---
            if (command === 'bj' || command === 'blackjack') {
                const betInput = args[0]?.toLowerCase();
                let betAmount = 100;
                const currentBal = getUserBalance(userId);

                if (betInput === 'all') betAmount = currentBal;
                else if (betInput && !isNaN(parseInt(betInput))) betAmount = parseInt(betInput);

                if (betAmount <= 0) return message.channel.send(`❌ Taruhan tidak valid!`);
                if (currentBal < betAmount) return message.channel.send(`🪙 **|** Saldo tidak cukup!`);

                const drawCard = () => Math.floor(Math.random() * 10) + 1;
                let pCards = [drawCard(), drawCard()];
                let dCards = [drawCard(), drawCard()];
                let pTotal = pCards.reduce((a, b) => a + b, 0);

                const getBjButtons = (disabled = false) => {
                    return new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId(`bj_hit_${userId}_${betAmount}`).setLabel('Hit').setEmoji('➕').setStyle(ButtonStyle.Primary).setDisabled(disabled),
                        new ButtonBuilder().setCustomId(`bj_stand_${userId}_${betAmount}`).setLabel('Stand').setEmoji('🛑').setStyle(ButtonStyle.Danger).setDisabled(disabled)
                    );
                };

                const contentText = `<@${userId}>, you bet **${betAmount.toLocaleString()}** to play blackjack\n` +
                                    `Dealer [ 1+ ]\n` +
                                    `> 🃏 [ ${dCards[0]} ] [ ❓ ]\n` +
                                    `<@${userId}> [ ${pTotal} ]\n` +
                                    `> 🃏 [ ${pCards.join(' ] [ ')} ]`;

                await message.channel.send({ content: contentText, components: [getBjButtons(false)] });
                return;
            }

            // --- 🎣 MANCING (FISH) DENGAN LIVE ANIMASI ---
            if (command === 'fish' || command === 'mancing') {
                const msg = await message.channel.send(`<@${userId}> casts their fishing rod... 🎣 🌊`);

                setTimeout(async () => {
                    await msg.edit(`<@${userId}> casts their fishing rod... 🎣 🌊 *waiting for a bite...*`).catch(() => {});
                }, 1000);

                setTimeout(async () => {
                    const fishes = [
                        { name: '🐟 Common Fish', reward: 50 },
                        { name: '🐠 Tropical Fish', reward: 100 },
                        { name: '🦈 Megalodon', reward: 1000 },
                        { name: '🦑 Giant Squid', reward: 500 },
                        { name: '💎 Rare Diamond', reward: 5000 }
                    ];
                    const caught = fishes[Math.floor(Math.random() * fishes.length)];
                    const currentBal = getUserBalance(userId);
                    setUserBalance(userId, currentBal + caught.reward);
                    const finalBal = getUserBalance(userId);

                    await msg.edit(`<@${userId}> caught a **${caught.name}** and got **${caught.reward.toLocaleString()}** cowoncy! 🎣🎉\n🪙 Balance: **${finalBal.toLocaleString()}**`).catch(() => {});
                }, 2000);
                return;
            }

            // --- UTILITY COMMANDS ---
            if (command === 'ping') {
                const sent = await message.channel.send("🏓 Measuring...");
                const latency = sent.createdTimestamp - message.createdTimestamp;
                return sent.edit(`🏓 **Pong!** \`${latency}ms\``);
            }

            if (command === 'clear') {
                if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return message.channel.send("❌ No permission!");
                const amount = parseInt(args[0]) || 5;
                await message.channel.bulkDelete(amount, true).catch(() => {});
                const m = await message.channel.send(`🧹 Cleared **${amount}** messages.`);
                setTimeout(() => m.delete().catch(() => {}), 3000);
                return;
            }

            if (command === 'user') {
                const target = message.mentions.users.first() || message.author;
                return message.channel.send(`👤 **User:** ${target.tag} (\`${target.id}\`)`);
            }

            if (command === 'uptime') {
                let s = Math.floor(client.uptime / 1000);
                let m = Math.floor(s / 60); s %= 60;
                let h = Math.floor(m / 60); m %= 60;
                return message.channel.send(`⏰ **Uptime:** \`${h}h ${m}m ${s}s\``);
            }

            if (command === 'server') {
                return message.channel.send(`🏰 **Server:** ${message.guild.name} (\`${message.guild.memberCount} members\`)`);
            }

            if (command === 'avatar' || command === 'av') {
                const target = message.mentions.users.first() || message.author;
                return message.channel.send(target.displayAvatarURL({ size: 1024 }));
            }
        }

        // --- AUTOMATIC REMINDERS ---
        const handleTimer = (type, timeMs, textMsg, modeKey, gifUrl) => {
            const timerKey = `${userId}_${type}_${message.channel.id}`;
            if (activeTimers.has(timerKey)) clearTimeout(activeTimers.get(timerKey));

            const timer = setTimeout(() => {
                const mentionStr = userCfg.pingsEnabled ? `<@${userId}>` : `**${message.author.username}**`;
                const payload = { content: `${mentionStr} ${textMsg}` };
                if (userCfg.replyEnabled) payload.reply = { messageReference: message.id };
                if (userCfg[modeKey] === 'gif') {
                    payload.embeds = [new EmbedBuilder().setColor(getRandomColor()).setImage(gifUrl)];
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
            handleTimer('vote', 12 * 3600000, serverCfg.voteMsg, 'voteMode', userCfg.voteGif);
            message.channel.send(`✅ <@${userId}> Reminder vote 12 jam dipasang! 🗳️`).catch(() => {});
            return;
        }

    } catch (err) {
        console.error(err);
    }
});

// --- BUTTON INTERACTION HANDLER ---
client.on('interactionCreate', async (interaction) => {
    try {
        if (!interaction.isButton()) return;
        const guildId = interaction.guild?.id || 'dm';
        const serverCfg = getServerConfig(guildId);

        if (interaction.customId === 'help_reminders') {
            return interaction.update({ embeds: [createHelpEmbed(interaction.guild?.name, interaction.user.displayAvatarURL(), serverCfg.botPrefix)], components: [createHelpButtons()] });
        }
        if (interaction.customId === 'help_utility') {
            const embed = new EmbedBuilder().setColor(getRandomColor()).setTitle('🎲 Utilitas & Mini-Games').setDescription(`Gunakan command prefix bot.`);
            return interaction.update({ embeds: [embed], components: [createHelpButtons()] });
        }
        if (interaction.customId === 'help_settings') {
            return interaction.update({ embeds: [createServerSettingsEmbed(guildId)], components: [createHelpButtons()] });
        }

        const parts = interaction.customId.split('_');

        if (parts[0] === 'bj') {
            const action = parts[1];
            const ownerId = parts[2];
            const betAmount = parseInt(parts[3]);

            if (interaction.user.id !== ownerId) return interaction.reply({ content: '❌ Bukan game kamu!', ephemeral: true });

            const currentBal = getUserBalance(ownerId);
            const msgContent = interaction.message.content;
            const pMatch = msgContent.match(/> 🃏 \[ (.*?) \]/g);
            if (!pMatch) return interaction.update({ content: '❌ Error game.', components: [] });

            let pCardsRaw = pMatch[pMatch.length - 1].replace('> 🃏 [ ', '').replace(' ]', '').split(' ] [ ');
            let pTotal = pCardsRaw.reduce((a, b) => a + (isNaN(b) ? 10 : parseInt(b)), 0);
            const drawCard = () => Math.floor(Math.random() * 10) + 1;

            if (action === 'hit') {
                const newCard = drawCard();
                pCardsRaw.push(newCard);
                pTotal = pCardsRaw.reduce((a, b) => a + parseInt(b), 0);

                if (pTotal > 21) {
                    setUserBalance(ownerId, currentBal - betAmount);
                    const finalBal = getUserBalance(ownerId);
                    return interaction.update({
                        content: `<@${ownerId}>, BUST! 💥 You lost **${betAmount.toLocaleString()}** cowoncy.\n🪙 Balance: **${finalBal.toLocaleString()}**`,
                        components: []
                    });
                } else {
                    const text = `<@${ownerId}>, you bet **${betAmount.toLocaleString()}** to play blackjack\n` +
                                 `Dealer [ 1+ ]\n> 🃏 [ ❓ ] [ ❓ ]\n` +
                                 `<@${ownerId}> [ ${pTotal} ]\n> 🃏 [ ${pCardsRaw.join(' ] [ ')} ]`;
                    return interaction.update({ content: text, components: [interaction.message.components[0]] });
                }
            }

            if (action === 'stand') {
                let dCards = [drawCard(), drawCard()];
                let dTotal = dCards.reduce((a, b) => a + b, 0);
                while (dTotal < 17) {
                    dCards.push(drawCard());
                    dTotal = dCards.reduce((a, b) => a + b, 0);
                }

                let resText = '';
                if (dTotal > 21 || pTotal > dTotal) {
                    setUserBalance(ownerId, currentBal + betAmount);
                    resText = `🎉 **You won ${betAmount.toLocaleString()} cowoncy!**`;
                } else if (pTotal < dTotal) {
                    setUserBalance(ownerId, currentBal - betAmount);
                    resText = `😢 **Dealer wins! Lost ${betAmount.toLocaleString()} cowoncy.**`;
                } else {
                    resText = `🤝 **Push (Tie)!**`;
                }

                const updatedBal = getUserBalance(ownerId);
                const text = `<@${ownerId}> Blackjack Result:\n` +
                             `Dealer [ ${dTotal} ] -> \`[ ${dCards.join(' ] [ ')} ]\`\n` +
                             `You [ ${pTotal} ] -> \`[ ${pCardsRaw.join(' ] [ ')} ]\`\n\n` +
                             `${resText}\n🪙 Balance: **${updatedBal.toLocaleString()}**`;

                return interaction.update({ content: text, components: [] });
            }
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
        console.error(err);
    }
});

client.login(process.env.TOKEN);
