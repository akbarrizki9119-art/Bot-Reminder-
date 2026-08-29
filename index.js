const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

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

// 📦 Settings Maps
const serverSettings = new Map();
const userSettings = new Map();
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
            prayMsg: "pray/curse 🙏"
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
            pingsEnabled: true,
            replyEnabled: true,
            
            owoMode: 'text',
            huntMode: 'text',
            godMode: 'text',
            prayMode: 'text',

            owoGif: "https://cdn.discordapp.com/attachments/1511280356802957414/1540470284237410314/b8c64c28f86119317d2aa2ce417e4579.gif",
            huntGif: "https://cdn.discordapp.com/attachments/1511280356802957414/1540470284237410314/b8c64c28f86119317d2aa2ce417e4579.gif",
            godGif: "https://cdn.discordapp.com/attachments/1511280356802957414/1540470284237410314/b8c64c28f86119317d2aa2ce417e4579.gif",
            prayGif: "https://cdn.discordapp.com/attachments/1511280356802957414/1540470284237410314/b8c64c28f86119317d2aa2ce417e4579.gif"
        });
    }
    return userSettings.get(userId);
}

client.on('ready', () => {
    console.log(`✅ Bot ${client.user.tag} aktif & siap!`);
});

// --- 🎨 EMBED HELP & SETTINGS ---
function createHelpEmbed(guildName, avatarURL, prefix) {
    return new EmbedBuilder()
        .setColor(getRandomColor())
        .setAuthor({ name: '🏓 Reminders Menu', iconURL: client.user.displayAvatarURL() })
        .setDescription(
            `Gunakan \`${prefix} help\` untuk melihat bantuan.\n\n` +
            `\`owo\`\nDo \`${prefix} owo\` to manage **owo/uwu** 🌿\n\n` +
            `\`owoh\`\nDo \`${prefix} owoh\` to manage **hunt (wh)** 🏹\n\n` +
            `\`godh\`\nDo \`${prefix} godh\` to manage **god hunt (gh)** ⚡\n\n` +
            `\`owopray\`\nDo \`${prefix} owopray\` to manage **pray/curse** 🙏`
        )
        .setFooter({ text: `Server ${guildName || 'OPPAI'}`, iconURL: avatarURL || client.user.displayAvatarURL() });
}

function createHelpButtons() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('help_reminders').setLabel('Reminders').setEmoji('🏓').setStyle(ButtonStyle.Primary),
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
            `☘️ **pray/curse:** \`${config.botPrefix} s pray <pesan>\``
        );
}

function createSettingsEmbed(user, type) {
    const config = getUserConfig(user.id);
    const keyMap = { owoh: 'huntEnabled', godh: 'godEnabled', owo: 'owoEnabled', owopray: 'prayEnabled' };
    const modeMap = { owoh: 'huntMode', godh: 'godMode', owo: 'owoMode', owopray: 'prayMode' };
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
    const keyMap = { owoh: 'huntEnabled', godh: 'godEnabled', owo: 'owoEnabled', owopray: 'prayEnabled' };
    const modeMap = { owoh: 'huntMode', godh: 'godMode', owo: 'owoMode', owopray: 'prayMode' };
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

        // --- 🤖 AUTO HUNT BOT DETECT & CAPTCHA ---
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

                if (hoursMatch) {
                    const h = parseInt(hoursMatch[1]);
                    totalMs += h * 3600000;
                    durationParts.push(`${h} Jam`);
                }
                if (minutesMatch) {
                    const m = parseInt(minutesMatch[1]);
                    totalMs += m * 60000;
                    durationParts.push(`${m} Menit`);
                }
                if (secondsMatch) {
                    const s = parseInt(secondsMatch[1]);
                    totalMs += s * 1000;
                    durationParts.push(`${s} Detik`);
                }

                const durationString = durationParts.join(' ') || 'beberapa saat';

                let targetUser = message.mentions.users.first();
                let huntTypeLabel = "OWO HUNTBOT";

                if (message.reference) {
                    const refMsg = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
                    if (refMsg) {
                        if (!targetUser) targetUser = refMsg.author;
                        if (refMsg.content.toLowerCase().includes('ghb')) huntTypeLabel = "GOD HUNTBOT";
                    }
                }

                if (!targetUser) {
                    const recentMsgs = await message.channel.messages.fetch({ limit: 10 }).catch(() => null);
                    if (recentMsgs) {
                        const lastUserMsg = recentMsgs.find(m => !m.author.bot && (
                            m.content.toLowerCase().includes('hb') || m.content.toLowerCase().includes('ghb')
                        ));
                        if (lastUserMsg) {
                            targetUser = lastUserMsg.author;
                            if (lastUserMsg.content.toLowerCase().includes('ghb')) huntTypeLabel = "GOD HUNTBOT";
                        }
                    }
                }

                if (totalMs > 0 && targetUser) {
                    message.channel.send(`⏰ Pengingat **${huntTypeLabel}** dipasang untuk <@${targetUser.id}>!\n⏳ **Sisa waktu:** \`${durationString}\``).catch(() => {});
                    
                    setTimeout(async () => {
                        try {
                            await targetUser.send(`🔔 <@${targetUser.id}>, **${huntTypeLabel} SELESAI!** Waktunya cek lagi! ⚔️`);
                        } catch (e) {
                            message.channel.send(`🔔 <@${targetUser.id}>, **${huntTypeLabel} SELESAI!** (DM kamu tertutup)`).catch(() => {});
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
            }

            if (['owoh', 'godh', 'owo', 'owopray'].includes(command)) {
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
                return message.channel.send(`✅ GIF **${kategori}** diperbarui!`);
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

        // 1. OWO / UWU (15 Detik)
        if ((msgLower === 'owo' || msgLower === 'uwu') && userCfg.owoEnabled) {
            handleTimer('owo', 15000, serverCfg.owoMsg, 'owoMode', userCfg.owoGif);
            return;
        }

        // 2. HUNT BIASA: wh / owo hunt / owo h (15 Detik)
        const isHunt = ['wh', 'owo hunt', 'owo h'].includes(msgLower) || msgLower.startsWith('wh ') || msgLower.startsWith('owo h ');
        if (isHunt && userCfg.huntEnabled) {
            handleTimer('hunt', 15000, serverCfg.huntMsg, 'huntMode', userCfg.huntGif);
            return;
        }

        // 3. GOD HUNT: gh / owo gh (15 Detik)
        const isGod = ['gh', 'owo gh'].includes(msgLower) || msgLower.startsWith('gh ') || msgLower.startsWith('owo gh ');
        if (isGod && userCfg.godEnabled) {
            handleTimer('god', 15000, serverCfg.godMsg, 'godMode', userCfg.godGif);
            return;
        }

        // 4. PRAY / CURSE (5 Menit)
        const isPray = msgLower.includes('wpray') || msgLower.includes('owo pray') || msgLower === 'wp' || msgLower === 'pr';
        if (isPray && userCfg.prayEnabled) {
            handleTimer('pray', 300000, serverCfg.prayMsg, 'prayMode', userCfg.prayGif);
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

        if (interaction.customId === 'help_reminders') {
            return interaction.update({ embeds: [createHelpEmbed(interaction.guild?.name, interaction.user.displayAvatarURL(), serverCfg.botPrefix)], components: [createHelpButtons()] });
        }
        if (interaction.customId === 'help_settings') {
            return interaction.update({ embeds: [createServerSettingsEmbed(guildId)], components: [createHelpButtons()] });
        }

        if (parts[0] === 'toggle') {
            const [, key, type, ownerId] = parts;
            if (interaction.user.id !== ownerId) return interaction.reply({ content: '❌ Bukan settinganmu!', ephemeral: true });

            const config = getUserConfig(ownerId);
            const keyMap = { owoh: 'huntEnabled', godh: 'godEnabled', owo: 'owoEnabled', owopray: 'prayEnabled' };
            const modeMap = { owoh: 'huntMode', godh: 'godMode', owo: 'owoMode', owopray: 'prayMode' };

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
