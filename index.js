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
const userEconomy = new Map(); // Untuk simpan saldo cash user
const activeTimers = new Map();

function getServerConfig(guildId) {
    if (!serverSettings.has(guildId)) {
        serverSettings.set(guildId, {
            botPrefix: "!",
            owoPrefix: "w",
            useDefaultPrefix: true,
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

// 💰 Fungsi Ambil Saldo (Otomatis dapet 10 Juta kalau belum ada)
function getUserBalance(userId) {
    if (!userEconomy.has(userId)) {
        userEconomy.set(userId, 10000000); // Saldo awal 10.000.000
    }
    return userEconomy.get(userId);
}

function setUserBalance(userId, amount) {
    userEconomy.set(userId, Math.max(0, amount));
}

client.on('ready', () => {
    console.log(`✅ Bot ${client.user.tag} aktif & siap!`);
});

// --- 🎨 EMBED HELP & SETTINGS ---
function createHelpEmbed(guildName, avatarURL, prefix) {
    return new EmbedBuilder()
        .setColor(getRandomColor())
        .setAuthor({ name: '🏓 Reminders, Utility & Mini-Games Menu', iconURL: client.user.displayAvatarURL() })
        .setDescription(
            `Gunakan \`${prefix} help\` untuk melihat bantuan.\n\n` +
            `💰 **EKONOMI & SALDO**\n` +
            `\`${prefix} bal\` atau \`${prefix} balance\` : Cek saldo koin kamu\n\n` +
            `**🎮 GAME REMINDERS**\n` +
            `\`${prefix} owo\` : Manage **owo/uwu** 🌿\n` +
            `\`${prefix} owoh\` : Manage **hunt (wh)** 🏹\n` +
            `\`${prefix} godh\` : Manage **god hunt (gh)** ⚡\n` +
            `\`${prefix} owopray\` : Manage **pray/curse** 🙏\n` +
            `\`${prefix} owovote\` : Manage **vote (12 jam)** 🗳️\n\n` +
            `**🎲 MINI-GAMES (OwO Style + Animasi)**\n` +
            `\`${prefix} slot [taruhan/all]\` : Mesin slot beranimasi 🍒\n` +
            `\`${prefix} cf [head/tail/all] [taruhan]\` : Lempar koin beranimasi 🪙\n` +
            `\`${prefix} bj [taruhan/all]\` : Blackjack interaktif pakai tombol 🃏\n` +
            `\`${prefix} fish\` : Mancing ikan beranimasi 🎣\n\n` +
            `**🛠️ UTILITY COMMANDS**\n` +
            `\`${prefix} ping\` : Cek latency bot\n` +
            `\`${prefix} clear <1-100>\` : Clear chat spam\n` +
            `\`${prefix} user [@user]\` : Cek info akun\n` +
            `\`${prefix} uptime\` : Cek berapa lama bot nyala\n` +
            `\`${prefix} server\` : Cek info server\n` +
            `\`${prefix} avatar [@user]\` : Ambil foto profil HD`
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

        // --- 🤖 DETEKSI PESAN DARI BOT ---
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

                if (!targetUser) {
                    const recentMsgs = await message.channel.messages.fetch({ limit: 6 }).catch(() => null);
                    if (recentMsgs) {
                        const huntKeywords = ['hb', 'ghb', 'whb', 'ah', 'w ah', 'autohunt', 'gah'];
                        const lastUserMsg = recentMsgs.find(m => !m.author.bot && huntKeywords.some(kw => m.content.toLowerCase().includes(kw)));
                        if (lastUserMsg) {
                            targetUser = lastUserMsg.author;
                            if (lastUserMsg.content.toLowerCase().includes('ghb') || lastUserMsg.content.toLowerCase().includes('gah')) {
                                huntTypeLabel = "GOD HUNTBOT";
                            }
                        }
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
                            message.channel.send(`🚨 <@${targetUser.id}> **${huntTypeLabel} SELESAI!** (DM kamu tertutup)`).catch(() => {});
                        }
                    }, totalMs);
                }
            }
            return;
        }

        // --- 🛠️ COMMAND HANDLER ---
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

            // --- 💰 CEK SALDO (BALANCE) ---
            if (command === 'bal' || command === 'balance') {
                const currentBal = getUserBalance(userId);
                return message.channel.send(`🪙 **|** <@${userId}>, you have **${currentBal.toLocaleString()}** cowoncy! :herb:`);
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

            // --- 🎰 MINI-GAME: SLOT (OwO Style + Animasi Muter) ---
            if (command === 'slot' || command === 'slt') {
                const betInput = args[0]?.toLowerCase();
                let betAmount = 100;
                const currentBal = getUserBalance(userId);

                if (betInput === 'all') {
                    betAmount = currentBal;
                } else if (betInput && !isNaN(parseInt(betInput))) {
                    betAmount = parseInt(betInput);
                }

                if (betAmount <= 0) return message.channel.send(`❌ Taruhan tidak valid!`);
                if (currentBal < betAmount) {
                    return message.channel.send(`🪙 **|** <@${userId}>, you don't have enough cowoncy! (Saldo: **${currentBal.toLocaleString()}** 🪙)`);
                }

                const fruits = [' :cherries: ', ' :lemon: ', ' :watermelon: ', ' :grapes: ', ' :gem: ', ' :star: ', ' :seven: '];
                const getRandomSpin = () => [
                    fruits[Math.floor(Math.random() * fruits.length)],
                    fruits[Math.floor(Math.random() * fruits.length)],
                    fruits[Math.floor(Math.random() * fruits.length)]
                ];

                const msg = await message.channel.send(`🎰 **[slot]**\n| :hourglass: | :hourglass: | :hourglass: |\n🪙 Spinning for <@${userId}>...`);

                setTimeout(async () => {
                    const spinFinal = getRandomSpin();
                    let reward = 0;
                    let resultMsg = "";

                    if (spinFinal[0] === spinFinal[1] && spinFinal[1] === spinFinal[2]) {
                        reward = betAmount * 5;
                        setUserBalance(userId, currentBal - betAmount + reward);
                        resultMsg = `🎉 **|** <@${userId}> won **${reward.toLocaleString()}** cowoncy! **JACKPOT!**`;
                    } else if (spinFinal[0] === spinFinal[1] || spinFinal[1] === spinFinal[2] || spinFinal[0] === spinFinal[2]) {
                        reward = Math.floor(betAmount * 1.5);
                        setUserBalance(userId, currentBal - betAmount + reward);
                        resultMsg = `✨ **|** <@${userId}> won **${reward.toLocaleString()}** cowoncy!`;
                    } else {
                        setUserBalance(userId, currentBal - betAmount);
                        resultMsg = `😢 **|** <@${userId}> lost **${betAmount.toLocaleString()}** cowoncy...`;
                    }

                    const finalBal = getUserBalance(userId);
                    await msg.edit(`🎰 **[slot]**\n|${spinFinal[0]}|${spinFinal[1]}|${spinFinal[2]}|\n${resultMsg}\n🪙 Balance: **${finalBal.toLocaleString()}**`).catch(() => {});
                }, 1000);
                return;
            }

            // --- 🪙 MINI-GAME: COINFLIP (OwO Style + Animasi Tossing) ---
            if (command === 'cf' || command === 'coinflip') {
                let choice = args[0]?.toLowerCase();
                let betInput = args[1]?.toLowerCase();
                let userChoice = 'h';
                let betAmount = 100;
                const currentBal = getUserBalance(userId);

                if (['head', 'heads', 'h'].includes(choice)) {
                    userChoice = 'h';
                } else if (['tail', 'tails', 't'].includes(choice)) {
                    userChoice = 't';
                } else if (choice === 'all') {
                    betAmount = currentBal;
                } else if (!isNaN(parseInt(choice))) {
                    betAmount = parseInt(choice);
                }

                if (betInput === 'all') {
                    betAmount = currentBal;
                } else if (betInput && !isNaN(parseInt(betInput))) {
                    betAmount = parseInt(betInput);
                }

                if (betAmount <= 0) return message.channel.send(`❌ Taruhan tidak valid!`);
                if (currentBal < betAmount) {
                    return message.channel.send(`🪙 **|** <@${userId}>, you don't have enough cowoncy! (Saldo: **${currentBal.toLocaleString()}** 🪙)`);
                }

                const msg = await message.channel.send(`🪙 **|** Tossing the coin for <@${userId}>... 🔄`);

                setTimeout(async () => {
                    const flipResult = Math.random() < 0.5 ? 'h' : 't';
                    const resultText = flipResult === 'h' ? '🪙 **HEADS**' : '🦅 **TAILS**';
                    const isWin = userChoice === flipResult;
                    let finalBal;

                    if (isWin) {
                        setUserBalance(userId, currentBal + betAmount);
                        finalBal = getUserBalance(userId);
                        await msg.edit(`🪙 **|** It's ${resultText}! <@${userId}> won **${betAmount.toLocaleString()}** cowoncy! 🎉\n🪙 Balance: **${finalBal.toLocaleString()}**`).catch(() => {});
                    } else {
                        setUserBalance(userId, currentBal - betAmount);
                        finalBal = getUserBalance(userId);
                        await msg.edit(`🪙 **|** It's ${resultText}! <@${userId}> lost **${betAmount.toLocaleString()}** cowoncy... 😢\n🪙 Balance: **${finalBal.toLocaleString()}**`).catch(() => {});
                    }
                }, 1000);
                return;
            }

            // --- 🃏 MINI-GAME: BLACKJACK INTERAKTIF PAKAI TOMBOL (OwO Style) ---
            if (command === 'bj' || command === 'blackjack') {
                const betInput = args[0]?.toLowerCase();
                let betAmount = 100;
                const currentBal = getUserBalance(userId);

                if (betInput === 'all') {
                    betAmount = currentBal;
                } else if (betInput && !isNaN(parseInt(betInput))) {
                    betAmount = parseInt(betInput);
                }

                if (betAmount <= 0) return message.channel.send(`❌ Taruhan tidak valid!`);
                if (currentBal < betAmount) {
                    return message.channel.send(`🪙 **|** <@${userId}>, you don't have enough cowoncy! (Saldo: **${currentBal.toLocaleString()}** 🪙)`);
                }

                const drawCard = () => Math.floor(Math.random() * 10) + 1;
                let pCards = [drawCard(), drawCard()];
                let dCards = [drawCard(), drawCard()];
                let pTotal = pCards.reduce((a, b) => a + b, 0);

                const getBjContent = (status = 'main', dTotalShow = '?', finalDcards = [dCards[0], '❓']) => {
                    let text = `🃏 **[Blackjack]** - <@${userId}> (Taruhan: **${betAmount.toLocaleString()}** 🪙)\n` +
                               `👤 Your Cards: \`[ ${pCards.join(' ] [ ')} ]\` (Total: **${pTotal}**)\n` +
                               `🤖 Dealer Cards: \`[ ${finalDcards.join(' ] [ ')} ]\` (Total: **${dTotalShow}**)\n\n`;
                    
                    if (status === 'win') text += `🎉 **YOU WIN! Won ${betAmount.toLocaleString()} cowoncy!**`;
                    else if (status === 'lose') text += `😢 **DEALER WINS! Lost ${betAmount.toLocaleString()} cowoncy.**`;
                    else if (status === 'push') text += `🤝 **PUSH (Tie)! Bet returned.**`;
                    else text += `Choose your move:`;
                    
                    return text;
                };

                const getBjButtons = (disabled = false) => {
                    return new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId(`bj_hit_${userId}_${betAmount}`).setLabel('Hit').setEmoji('➕').setStyle(ButtonStyle.Primary).setDisabled(disabled),
                        new ButtonBuilder().setCustomId(`bj_stand_${userId}_${betAmount}`).setLabel('Stand').setEmoji('🛑').setStyle(ButtonStyle.Danger).setDisabled(disabled)
                    );
                };

                const gameMsg = await message.channel.send({ content: getBjContent('main', '?', [dCards[0], '❓']), components: [getBjButtons(false)] });
                return;
            }

            // --- 🎣 MINI-GAME: MANCING (OwO Style + Animasi Fishing) ---
            if (command === 'fish' || command === 'mancing') {
                const fishes = [
                    { name: '🐟 Common Fish', reward: 50 },
                    { name: '🐠 Tropical Fish', reward: 100 },
                    { name: '🦈 Megalodon', reward: 1000 },
                    { name: '🦑 Giant Squid', reward: 500 },
                    { name: '🥾 Rusty Boot', reward: 10 },
                    { name: '💎 Rare Diamond', reward: 5000 }
                ];

                const msg = await message.channel.send(`🎣 **|** <@${userId}> casts their fishing rod... 🌊 *waiting for a bite...*`);

                setTimeout(async () => {
                    const caught = fishes[Math.floor(Math.random() * fishes.length)];
                    const currentBal = getUserBalance(userId);
                    setUserBalance(userId, currentBal + caught.reward);
                    const finalBal = getUserBalance(userId);

                    await msg.edit(`🎣 **|** <@${userId}> went fishing and caught a **${caught.name}**! Earned **${caught.reward.toLocaleString()}** cowoncy! 🌊\n🪙 Balance: **${finalBal.toLocaleString()}**`).catch(() => {});
                }, 1200);
                return;
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
                    return message.channel.send("❌ Masukkan jumlah pesan dari 1 sampai 100! Contoh: `!clear 10`");
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
        const guildId = interaction.guild?.id || 'dm';
        const serverCfg = getServerConfig(guildId);

        if (interaction.customId === 'help_reminders') {
            return interaction.update({ embeds: [createHelpEmbed(interaction.guild?.name, interaction.user.displayAvatarURL(), serverCfg.botPrefix)], components: [createHelpButtons()] });
        }
        
        if (interaction.customId === 'help_utility') {
            const embed = new EmbedBuilder()
                .setColor(getRandomColor())
                .setTitle('🎲 Utilitas & Mini-Games (OwO Style)')
                .setDescription(
                    `\`${serverCfg.botPrefix} bal\` : Cek saldo koin\n` +
                    `\`${serverCfg.botPrefix} slot [all/jumlah]\` : Mesin slot beranimasi\n` +
                    `\`${serverCfg.botPrefix} cf [head/tail/all]\` : Lempar koin beranimasi\n` +
                    `\`${serverCfg.botPrefix} bj [all/jumlah]\` : Blackjack interaktif\n` +
                    `\`${serverCfg.botPrefix} fish\` : Mancing ikan beranimasi\n` +
                    `\`${serverCfg.botPrefix} ping\` : Cek delay respon bot\n` +
                    `\`${serverCfg.botPrefix} clear <jumlah>\` : Hapus chat spam\n` +
                    `\`${serverCfg.botPrefix} user [@user]\` : Tampilkan info user\n` +
                    `\`${serverCfg.botPrefix} uptime\` : Cek durasi bot menyala\n` +
                    `\`${serverCfg.botPrefix} server\` : Informasi server\n` +
                    `\`${serverCfg.botPrefix} avatar [@user]\` : Ambil foto profil HD`
                );
            return interaction.update({ embeds: [embed], components: [createHelpButtons()] });
        }

        if (interaction.customId === 'help_settings') {
            return interaction.update({ embeds: [createServerSettingsEmbed(guildId)], components: [createHelpButtons()] });
        }

        const parts = interaction.customId.split('_');

        // --- BUTTON BLACKJACK (HIT / STAND) ---
        if (parts[0] === 'bj') {
            const action = parts[1]; // hit / stand
            const ownerId = parts[2];
            const betAmount = parseInt(parts[3]);

            if (interaction.user.id !== ownerId) {
                return interaction.reply({ content: '❌ Ini bukan game Blackjack kamu!', ephemeral: true });
            }

            const currentBal = getUserBalance(ownerId);
            const msgContent = interaction.message.content;
            
            // Ekstrak kartu user dari pesan teks
            const pMatch = msgContent.match(/👤 Your Cards: `\[ (.*?) \]` \(Total: \*\*(\d+)\*\*\)/);
            if (!pMatch) return interaction.update({ content: '❌ Terjadi kesalahan game.', components: [] });

            let pCards = pMatch[1].split(' ] [ ');
            let pTotal = parseInt(pMatch[2]);
            const drawCard = () => Math.floor(Math.random() * 10) + 1;

            if (action === 'hit') {
                const newCard = drawCard();
                pCards.push(newCard);
                pTotal += newCard;

                if (pTotal > 21) {
                    setUserBalance(ownerId, currentBal - betAmount);
                    const finalBal = getUserBalance(ownerId);
                    const text = `🃏 **[Blackjack]** - <@${ownerId}> (Taruhan: **${betAmount.toLocaleString()}** 🪙)\n` +
                                 `👤 Your Cards: \`[ ${pCards.join(' ] [ ')} ]\` (Total: **${pTotal}** - BUST! 💥)\n` +
                                 `🤖 Dealer Cards: \`[ Hidden ]\`\n\n` +
                                 `😢 **DEALER WINS! Lost ${betAmount.toLocaleString()} cowoncy.**\n` +
                                 `🪙 Balance: **${finalBal.toLocaleString()}**`;
                    return interaction.update({ content: text, components: [] });
                } else {
                    const text = `🃏 **[Blackjack]** - <@${ownerId}> (Taruhan: **${betAmount.toLocaleString()}** 🪙)\n` +
                                 `👤 Your Cards: \`[ ${pCards.join(' ] [ ')} ]\` (Total: **${pTotal}**)\n` +
                                 `🤖 Dealer Cards: \`[ ❓ ]\`\n\nChoose your move:`;
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

                let gameStatus = 'push';
                let resText = '';

                if (dTotal > 21 || pTotal > dTotal) {
                    gameStatus = 'win';
                    setUserBalance(ownerId, currentBal + betAmount);
                    resText = `🎉 **YOU WIN! Won ${betAmount.toLocaleString()} cowoncy!**`;
                } else if (pTotal < dTotal) {
                    gameStatus = 'lose';
                    setUserBalance(ownerId, currentBal - betAmount);
                    resText = `😢 **DEALER WINS! Lost ${betAmount.toLocaleString()} cowoncy.**`;
                } else {
                    gameStatus = 'push';
                    resText = `🤝 **PUSH (Tie)! Bet returned.**`;
                }

                const updatedBal = getUserBalance(ownerId);
                const text = `🃏 **[Blackjack]** - <@${ownerId}> (Taruhan: **${betAmount.toLocaleString()}** 🪙)\n` +
                             `👤 Your Cards: \`[ ${pCards.join(' ] [ ')} ]\` (Total: **${pTotal}**)\n` +
                             `🤖 Dealer Cards: \`[ ${dCards.join(' ] [ ')} ]\` (Total: **${dTotal}**)\n\n` +
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
        console.error("Button error:", err);
    }
});

client.login(process.env.TOKEN);
