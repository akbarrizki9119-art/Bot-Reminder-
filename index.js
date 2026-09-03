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

// Helper sleep untuk animasi game
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

// 💰 Fungsi Ambil Saldo (Otomatis dapet 15 Juta kalau belum ada)
function getUserBalance(userId) {
    if (!userEconomy.has(userId)) {
        userEconomy.set(userId, 15000000); 
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
            `**🎲 MINI-GAMES (Gaya Bot Referensi)**\n` +
            `\`${prefix} slot [taruhan/all]\` : Mesin slot beranimasi 🍒💎\n` +
            `\`${prefix} cf [taruhan/all]\` : Lempar koin beranimasi 🪙\n` +
            `\`${prefix} bj [taruhan/all]\` : Blackjack minimalis interaktif 🃏\n` +
            `\`${prefix} fish\` : Mancing kolam air UwU interaktif 🎣\n\n` +
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
                const embed = new EmbedBuilder()
                    .setColor(getRandomColor())
                    .setAuthor({ name: `Dompet - ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
                    .setDescription(`💳 Saldo Kamu saat ini:\n💵 **${currentBal.toLocaleString()} Koin**`);
                return message.channel.send({ embeds: [embed] });
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

            // =========================================================
            // 🎰 1. MINI-GAME: SLOT (Gaya Animasi & Format God Bot)
            // =========================================================
            if (command === 'slot' || command === 'slt') {
                const balance = getUserBalance(userId);
                const betInput = args[0]?.toLowerCase();
                let bet = betInput === 'all' ? balance : parseInt(betInput);

                if (isNaN(bet) || bet <=0) return message.reply('Format taruhan salah! Contoh: `!pai slot 250000` atau `!pai slot all`');
                if (balance < bet) return message.reply('Saldo koin lu kurang, bro!');

                setUserBalance(userId, balance - bet);
                const slotItems = ['🍒', '🍋', '🍇', '🍉', '⭐', '💎'];

                let msg = await message.channel.send(`__SLOTS__\n| 🎰 | 🎰 | 🎰 |  ppai bet 🇽  ${bet.toLocaleString()}`);
                await sleep(700);

                let r1 = slotItems[Math.floor(Math.random() * slotItems.length)];
                let r2 = slotItems[Math.floor(Math.random() * slotItems.length)];
                let r3 = slotItems[Math.floor(Math.random() * slotItems.length)];

                await msg.edit(`__SLOTS__\n| ${r1} | 🎰 | 🎰 |  ppai bet 🇽  ${bet.toLocaleString()}`);
                await sleep(600);
                await msg.edit(`__SLOTS__\n| ${r1} | ${r2} | 🎰 |  ppai bet 🇽  ${bet.toLocaleString()}`);
                await sleep(600);

                let win = (r1 === r2 && r2 === r3);
                let payout = win ? bet * 3 : 0;
                let currentBal = getUserBalance(userId);

                if (win) {
                    setUserBalance(userId, currentBal + payout);
                    await msg.edit(`__SLOTS__\n| ${r1} | ${r2} | ${r3} |  ppai bet 🇽  ${bet.toLocaleString()}\n\n🎉 And won **${payout.toLocaleString()}** koin!`);
                } else {
                    await msg.edit(`__SLOTS__\n| ${r1} | ${r2} | ${r3} |  ppai bet 🇽  ${bet.toLocaleString()}\n\n❌ and won nothing... :c`);
                }
                return;
            }

            // =========================================================
            // 🪙 2. MINI-GAME: COINFLIP (Gaya Narasi God Bot)
            // =========================================================
            if (command === 'cf' || command === 'coinflip') {
                const balance = getUserBalance(userId);
                let betInput = args[0]?.toLowerCase();
                let bet = betInput === 'all' ? balance : parseInt(betInput);

                if (isNaN(bet) || bet <= 0) return message.reply('Format salah! Contoh: `!pai cf 250000` atau `!pai cf all`');
                if (balance < bet) return message.reply('Saldo koin kurang!');

                setUserBalance(userId, balance - bet);

                let msg = await message.channel.send(`🪙 ppai spent 🪙 **${bet.toLocaleString()}** and chose **heads**\nThe coin spins...`);
                await sleep(1200);

                let isWin = Math.random() < 0.5;
                let payout = isWin ? bet * 2 : 0;
                let currentBal = getUserBalance(userId);

                if (isWin) {
                    setUserBalance(userId, currentBal + payout);
                    await msg.edit(`🪙 ppai spent 🪙 **${bet.toLocaleString()}** and chose **heads**\nThe coin spins... 🪙, and you won **${payout.toLocaleString()}**!`);
                } else {
                    await msg.edit(`🪙 ppai spent 🪙 **${bet.toLocaleString()}** and chose **heads**\nThe coin spins... 🪙, and you lost.`);
                }
                return;
            }

            // =========================================================
            // 🃏 3. MINI-GAME: BLACKJACK (Gaya Minimalis God Bot)
            // =========================================================
            if (command === 'bj' || command === 'blackjack') {
                const balance = getUserBalance(userId);
                let betInput = args[0]?.toLowerCase();
                let bet = betInput === 'all' ? balance : parseInt(betInput);

                if (isNaN(bet) || bet <= 0) return message.reply('Format salah! Contoh: `!pai bj 250000` atau `!pai bj all`');
                if (balance < bet) return message.reply('Saldo tidak cukup!');

                setUserBalance(userId, balance - bet);

                let p1 = Math.floor(Math.random() * 8) + 2;
                let p2 = Math.floor(Math.random() * 8) + 2;
                let pTotal = p1 + p2;

                let d1 = Math.floor(Math.random() * 8) + 2;
                let dHidden = Math.floor(Math.random() * 8) + 2;

                let msg = await message.channel.send(
                    `🎰 **${message.author.username}**, you bet **${bet.toLocaleString()}** to play blackjack\n\n` +
                    `**Dealer [${d1}+?]**\n` +
                    `🃏 🃏\n\n` +
                    `**${message.author.username} [${pTotal}]**\n` +
                    `🃏 [${p1}] 🃏 [${p2}]`
                );

                await sleep(1500);

                let dTotal = d1 + dHidden;
                let win = pTotal <= 21 && (dTotal > 21 || pTotal > dTotal);
                let payout = win ? bet * 2 : 0;
                let currentBal = getUserBalance(userId);

                if (win) {
                    setUserBalance(userId, currentBal + payout);
                    await msg.edit(`🎰 **${message.author.username}**, you bet **${bet.toLocaleString()}** to play blackjack\n\n**Dealer [${dTotal}]**\n**${message.author.username} [${pTotal}]**\n\n🎉 - You won **${payout.toLocaleString()}** cowoncy!`);
                } else {
                    await msg.edit(`🎰 **${message.author.username}**, you bet **${bet.toLocaleString()}** to play blackjack\n\n**Dealer [${dTotal}]**\n**${message.author.username} [${pTotal}]**\n\n❌ - You lost your bet.`);
                }
                return;
            }

            // =========================================================
            // 🎣 4. MINI-GAME: FISHING (Gaya Kolam Air UwU Bot + Tombol Reel)
            // =========================================================
            if (command === 'fish' || command === 'mancing') {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`reel_${userId}`)
                        .setLabel('Reel')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🎣')
                );

                const fishText = 
                    `───────────────────────\n` +
                    `~~~~~~~~~~~~~~~~~~~~~~~\n` +
                    `  🐟                  \n` +
                    `~~~~~~~~~~~~~~~~~~~~~~~\n` +
                    `🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡\n\n` +
                    `**Press 🎣 Reel to hook it!**`;

                const msg = await message.channel.send({
                    content: `🎣 **@${message.author.username} — something is biting!**\n\n` + fishText,
                    components: [row]
                });

                const collector = msg.createMessageComponentCollector({ time: 10000 });

                collector.on('collect', async i => {
                    if (i.user.id !== userId) {
                        return i.reply({ content: 'Ini bukan pancingan lu, bro!', ephemeral: true });
                    }

                    const fishList = ['Cumi Raksasa (Rare)', 'Pari Kecil (Common)', 'Hiu Megalodon (Legendary 🔥)', 'Ikan Buntal (Uncommon)'];
                    const caught = fishList[Math.floor(Math.random() * fishList.length)];

                    await i.update({
                        content: `🎣 **Mancing Mania - Berhasil!**\n\n✨ Kamu berhasil dapat: 🐟 **${caught}**`,
                        components: []
                    });
                });

                collector.on('end', async collected => {
                    if (collected.size === 0) {
                        await msg.edit({
                            content: `⏰ **Waktu habis!** Ikan nya lepas karena terlalu lama ditarik.`,
                            components: []
                        }).catch(() => {});
                    }
                });
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

        // --- 🎯 AUTOMATIC REMINDERS (UTUH TIDAK BERUBAH) ---
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
                .setTitle('🎲 Utilitas & Mini-Games')
                .setDescription(
                    `\`${serverCfg.botPrefix} bal\` : Cek saldo koin\n` +
                    `\`${serverCfg.botPrefix} slot [all/jumlah]\` : Mesin slot beranimasi\n` +
                    `\`${serverCfg.botPrefix} cf [all/jumlah]\` : Lempar koin beranimasi\n` +
                    `\`${serverCfg.botPrefix} bj [all/jumlah]\` : Blackjack minimalis\n` +
                    `\`${serverCfg.botPrefix} fish\` : Mancing ikan interaktif\n` +
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
