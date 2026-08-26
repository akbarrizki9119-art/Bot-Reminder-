const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ] 
});

const GOD_BOT_ID = "1521044059643318443"; 

// 📦 Settings Per Server
const serverSettings = new Map();

function getServerConfig(guildId) {
    if (!serverSettings.has(guildId)) {
        serverSettings.set(guildId, {
            botPrefix: "!pai",
            owoPrefix: "w",
            useDefaultPrefix: true,
            owoMsg: "owo 🥳",
            huntMsg: "hunt/battle 🎉",
            prayMsg: "pray/curse 🙏"
        });
    }
    return serverSettings.get(guildId);
}

// 📦 Settings Per User
const userSettings = new Map();

function getUserConfig(userId) {
    if (!userSettings.has(userId)) {
        userSettings.set(userId, {
            huntEnabled: true,
            prayEnabled: true,
            owoEnabled: true,
            pingsEnabled: true,
            replyEnabled: true,
            mode: 'text', // 'text' atau 'gif'
            huntGif: "https://cdn.discordapp.com/attachments/1511280356802957414/1540470284237410314/b8c64c28f86119317d2aa2ce417e4579.gif",
            prayGif: "https://cdn.discordapp.com/attachments/1511280356802957414/1540470284237410314/b8c64c28f86119317d2aa2ce417e4579.gif"
        });
    }
    return userSettings.get(userId);
}

// Storage timer reminder agar tidak duplikat
const activeTimers = new Map();

client.on('ready', () => {
    console.log(`✅ Bot ${client.user.tag} aktif & siap memantau!`);
});

// --- 🎨 EMBED UTAMA: HELP MENU ---
function createHelpEmbed(guildName, avatarURL) {
    return new EmbedBuilder()
        .setColor('#5865F2')
        .setAuthor({ name: '🏓 Reminders', iconURL: client.user.displayAvatarURL() })
        .setDescription(
            `Gunakan \`!pai help\` untuk melihat bantuan.\n\n` +
            `\`owo\`\n` +
            `Do \`!pai owo\` to manage your **owo/uwu** 🌿 reminder\n\n` +
            `\`owoh\`\n` +
            `Do \`!pai owoh\` to manage your **owoh/owob** 🌿⚔️ reminder\n\n` +
            `\`owopray\`\n` +
            `Do \`!pai owopray\` to manage your **pray/curse** 🙏👻 reminder`
        )
        .setFooter({ text: `Dibuat khusus untuk Server ${guildName || 'OPPAI'}`, iconURL: avatarURL });
}

function createHelpButtons() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('help_reminders')
            .setLabel('Reminders')
            .setEmoji('🏓')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('help_settings')
            .setLabel('Settings')
            .setEmoji('⚙️')
            .setStyle(ButtonStyle.Secondary)
    );
}

// --- 🎨 EMBED SERVER SETTINGS ---
function createServerSettingsEmbed(guildId) {
    const config = getServerConfig(guildId);

    return new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('Server Settings')
        .setDescription(
            `⚙️ **OwO bot prefix**\n` +
            `\`\`\`\n${config.owoPrefix}\n\`\`\`\n` +
            `do \`owoprefix\` to update\n\n` +
            `🤖 **reaction bot prefix**\n` +
            `\`\`\`\n${config.botPrefix}\n\`\`\`\n` +
            `\`${config.botPrefix} s prefix <prefix_baru>\` to update\n\n` +
            `🔄 **use default prefix !pai**\n` +
            `${config.useDefaultPrefix ? '✅' : '❌'}\n` +
            `\`${config.botPrefix} s default\` to update\n\n` +
            `🌱 **owo reminder**\n` +
            `\`${config.botPrefix} s owo <pesan>\` to update\n` +
            `\`{USER} ${config.owoMsg}\`\n\n` +
            `🌱 **hunt/battle reminder**\n` +
            `\`${config.botPrefix} s hunt <pesan>\` to update\n` +
            `\`{USER} ${config.huntMsg}\`\n\n` +
            `☘️ **pray/curse reminder**\n` +
            `\`${config.botPrefix} s pray <pesan>\` to update\n` +
            `\`{USER} ${config.prayMsg}\``
        );
}

// --- 🎨 EMBED USER SETTINGS ---
function createSettingsEmbed(user, type) {
    const config = getUserConfig(user.id);
    let isEnabled = type === 'owoh' ? config.huntEnabled : (type === 'owo' ? config.owoEnabled : config.prayEnabled);
    let title = `${user.username}'s${type === 'owoh' ? 'hunt/battle' : (type === 'owo' ? 'owo/uwu' : 'pray/curse')} reminder settings`;

    return new EmbedBuilder()
        .setColor(isEnabled ? '#43B581' : '#F04747')
        .setAuthor({ name: title, iconURL: user.displayAvatarURL() })
        .setDescription(
            `${isEnabled ? '✅' : '❌'} **Is this reminder enabled?**\n\n` +
            `${config.pingsEnabled ? '✅' : '❌'} **Pings / mentions enabled?**\n` +
            `${config.replyEnabled ? '✅' : '❌'} **Use inline replies?**\n` +
            `💬 **Current Mode:** \`${config.mode.toUpperCase()}\``
        );
}

function createSettingsButtons(user, type) {
    const config = getUserConfig(user.id);
    let isEnabled = type === 'owoh' ? config.huntEnabled : (type === 'owo' ? config.owoEnabled : config.prayEnabled);

    return [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`toggle_enable_${type}_${user.id}`)
                .setLabel(type === 'owoh' ? 'hunt/battle' : type)
                .setEmoji('⚔️')
                .setStyle(isEnabled ? ButtonStyle.Success : ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`toggle_ping_${type}_${user.id}`)
                .setLabel('ping')
                .setEmoji('🔴')
                .setStyle(config.pingsEnabled ? ButtonStyle.Success : ButtonStyle.Secondary)
        ),
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`toggle_reply_${type}_${user.id}`)
                .setLabel('reply')
                .setEmoji('↩️')
                .setStyle(config.replyEnabled ? ButtonStyle.Success : ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`toggle_mode_${type}_${user.id}`)
                .setLabel(`mode: ${config.mode}`)
                .setEmoji('🖼️')
                .setStyle(ButtonStyle.Primary)
        )
    ];
}

// --- 📩 MESSAGE EVENT HANDLER ---
client.on('messageCreate', async (message) => {
    if (message.author.bot && message.author.id !== GOD_BOT_ID && !message.author.username.includes('GoD')) return;

    const content = message.content.trim();
    const msgLower = content.toLowerCase();
    const userId = message.author.id;
    const guildId = message.guild?.id || 'dm';

    const serverCfg = getServerConfig(guildId);
    const userCfg = getUserConfig(userId);

    // Cek apakah pesan menggunakan prefix default (!pai) atau prefix custom server
    let usedPrefix = null;
    if (msgLower.startsWith('!pai')) {
        usedPrefix = '!pai';
    } else if (serverCfg.botPrefix && msgLower.startsWith(serverCfg.botPrefix.toLowerCase())) {
        usedPrefix = serverCfg.botPrefix;
    }

    // --- 🛠️ COMMAND HANDLER ---
    if (usedPrefix && !message.author.bot) {
        const args = content.slice(usedPrefix.length).trim().split(/ +/);
        const command = args.shift()?.toLowerCase();

        // 📌 1. MENU HELP & SETTINGS
        if (!command || command === 'help') {
            const helpEmbed = createHelpEmbed(message.guild?.name, message.author.displayAvatarURL());
            const helpButtons = createHelpButtons();
            return message.channel.send({ embeds: [helpEmbed], components: [helpButtons] });
        }

        if (command === 'settings') {
            const embed = createServerSettingsEmbed(guildId);
            return message.channel.send({ embeds: [embed] });
        }

        // 📌 2. UBAH PREFIX (!pai prefix <prefix_baru>)
        if (command === 'prefix') {
            const newPrefix = args[0];
            if (!newPrefix) {
                return message.channel.send(`❌ Masukkan prefix baru! Contoh: \`${usedPrefix} prefix ?\` atau \`${usedPrefix} prefix !r\``);
            }
            serverCfg.botPrefix = newPrefix;
            return message.channel.send(`✅ Prefix bot untuk server ini berhasil diubah menjadi: \`${newPrefix}\``);
        }

        // 📌 3. SERVER SETTINGS COMMAND (!pai s)
        if (command === 's' || command === 'set') {
            const subCmd = args.shift()?.toLowerCase();

            if (!subCmd) {
                const embed = createServerSettingsEmbed(guildId);
                return message.channel.send({ embeds: [embed] });
            }

            // Ganti Prefix via !pai s prefix <prefix>
            if (subCmd === 'prefix') {
                const newPrefix = args[0];
                if (!newPrefix) return message.channel.send(`❌ Masukkan prefix baru! Contoh: \`${usedPrefix} s prefix ?\``);
                serverCfg.botPrefix = newPrefix;
                return message.channel.send(`✅ Prefix bot berhasil diubah menjadi: \`${newPrefix}\``);
            }

            // Ganti pesan owo
            if (subCmd === 'owo') {
                if (args[0]?.toLowerCase() === 'set') args.shift();
                const newMsg = args.join(" ");
                if (!newMsg) return message.channel.send({ content: `<@${userId}>${serverCfg.owoMsg}` });
                serverCfg.owoMsg = newMsg;
                return message.channel.send(`✅ Updated **owo/uwu** reminder for this server.`);
            }

            // Ganti pesan hunt
            if (subCmd === 'hunt' || subCmd === 'owoh') {
                if (args[0]?.toLowerCase() === 'set') args.shift();
                const newMsg = args.join(" ");
                if (!newMsg) return message.channel.send({ content: `<@${userId}>${serverCfg.huntMsg}` });
                serverCfg.huntMsg = newMsg;
                return message.channel.send(`✅ Updated **hunt/battle** reminder for this server.`);
            }

            // Ganti pesan pray
            if (subCmd === 'pray' || subCmd === 'owopray') {
                if (args[0]?.toLowerCase() === 'set') args.shift();
                const newMsg = args.join(" ");
                if (!newMsg) return message.channel.send({ content: `<@${userId}>${serverCfg.prayMsg}` });
                serverCfg.prayMsg = newMsg;
                return message.channel.send(`✅ Updated **pray/curse** reminder for this server.`);
            }
        }

        // 📌 4. SHORTCUT PANEL SETTING USER (!pai owo, !pai owoh, !pai owopray)
        if (command === 'owoh' || command === 'owo' || command === 'owopray') {
            const embed = createSettingsEmbed(message.author, command);
            const components = createSettingsButtons(message.author, command);
            return message.channel.send({ embeds: [embed], components });
        }

        // 📌 5. ATUR GIF KUSTOM (!pai gif hunt <link> / !pai gif pray <link>)
        if (command === 'gif') {
            const kategori = args[0]?.toLowerCase();
            const linkGif = args[1];
            if (!kategori || !linkGif || (!linkGif.startsWith('http://') && !linkGif.startsWith('https://'))) {
                return message.channel.send(`❌ Format salah! Contoh: \`${usedPrefix} gif hunt <link_gif>\``);
            }
            if (kategori === 'hunt' || kategori === 'owoh') userCfg.huntGif = linkGif;
            else if (kategori === 'pray' || kategori === 'owopray') userCfg.prayGif = linkGif;

            return message.channel.send(`✅ GIF **${kategori}** diperbarui!`);
        }
    }

    // --- 🤖 DM AUTOHUNT GOD BOT FIX ---
    if (message.author.id === GOD_BOT_ID || message.author.username.includes('GoD')) {
        // Warning Captcha
        if (msgLower.includes("captcha") || msgLower.includes("verify")) {
            message.channel.send(`🚨 **PERINGATAN GOD BOT:** Ada Captcha/Verifikasi! Cek sekarang!`);
        }

        // Deteksi pesan timer "I WILL BE BACK IN..."
        if (message.content.toUpperCase().includes('I WILL BE BACK IN')) {
            const hoursMatch = message.content.match(/(\d+)\s*H/i);
            const minutesMatch = message.content.match(/(\d+)\s*M/i);
            const secondsMatch = message.content.match(/(\d+)\s*S/i);

            let totalMs = 0;
            if (hoursMatch) totalMs += parseInt(hoursMatch[1]) * 60 * 60 * 1000;
            if (minutesMatch) totalMs += parseInt(minutesMatch[1]) * 60 * 1000;
            if (secondsMatch) totalMs += parseInt(secondsMatch[1]) * 1000;

            // Cari user yang ditargetkan (User yang di-mention atau direply)
            let targetUser = message.mentions.users.first();
            if (!targetUser && message.reference) {
                const referencedMsg = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
                if (referencedMsg) targetUser = referencedMsg.author;
            }

            if (totalMs > 0 && targetUser) {
                const displayH = hoursMatch ? hoursMatch[1] : 0;
                const displayM = minutesMatch ? minutesMatch[1] : 0;

                message.channel.send(`⏰ **Pengingat GoD Dipasang!** Aku bakal DM <@${targetUser.id}> dalam **${displayH} jam${displayM} menit** lagi.`);

                setTimeout(async () => {
                    try {
                        await targetUser.send(`🔔 **AUTOHUNT GOD SELESAI!** Waktunya ketik \`ghb 1d\` lagi di server!`);
                        console.log(`✅ DM Auto-hunt terkirim ke ${targetUser.tag}`);
                    } catch (error) {
                        // Jika DM ditutup, kirim ping di channel server
                        message.channel.send(`🔔 <@${targetUser.id}> **AUTOHUNT GOD SELESAI!** (Gagal kirim DM karena DM ditutup).`);
                    }
                }, totalMs);
            }
        }
        return;
    }

    // --- 🎯 AUTOMATIC REMINDERS (15 DETIK / 5 MENIT) ---

    // 1. owo / uwu
    if ((msgLower === 'owo' || msgLower === 'uwu') && userCfg.owoEnabled) {
        const timerKey = `${userId}_owo_${message.channel.id}`;
        if (activeTimers.has(timerKey)) clearTimeout(activeTimers.get(timerKey));

        const timer = setTimeout(() => {
            const mentionStr = userCfg.pingsEnabled ? `<@${userId}>` : `**${message.author.username}**`;
            const payload = { content: `${mentionStr}${serverCfg.owoMsg}` };
            if (userCfg.replyEnabled) payload.reply = { messageReference: message.id };
            if (userCfg.mode === 'gif') payload.embeds = [new EmbedBuilder().setColor('#2B2D31').setImage(userCfg.huntGif)];

            message.channel.send(payload).catch(() => {});
            activeTimers.delete(timerKey);
        }, 15000);

        activeTimers.set(timerKey, timer);
        return;
    }

    // 2. wh / owoh
    if ((msgLower === 'wh' || msgLower === 'owo hunt' || msgLower.startsWith('wh ') || msgLower.startsWith('owo h ')) && userCfg.huntEnabled) {
        const timerKey = `${userId}_hunt_${message.channel.id}`;
        if (activeTimers.has(timerKey)) clearTimeout(activeTimers.get(timerKey));

        const timer = setTimeout(() => {
            const mentionStr = userCfg.pingsEnabled ? `<@${userId}>` : `**${message.author.username}**`;
            const payload = { content: `${mentionStr}${serverCfg.huntMsg}` };
            if (userCfg.replyEnabled) payload.reply = { messageReference: message.id };
            if (userCfg.mode === 'gif') payload.embeds = [new EmbedBuilder().setColor('#2B2D31').setImage(userCfg.huntGif)];

            message.channel.send(payload).catch(() => {});
            activeTimers.delete(timerKey);
        }, 15000);

        activeTimers.set(timerKey, timer);
        return;
    }

    // 3. wpray / owopray (5 Menit)
    if ((msgLower.includes('wpray') || msgLower.includes('owo pray') || msgLower === 'wp' || msgLower === 'pr') && userCfg.prayEnabled) {
        const timerKey = `${userId}_pray_${message.channel.id}`;
        if (activeTimers.has(timerKey)) clearTimeout(activeTimers.get(timerKey));

        const timer = setTimeout(() => {
            const mentionStr = userCfg.pingsEnabled ? `<@${userId}>` : `**${message.author.username}**`;
            const payload = { content: `${mentionStr}${serverCfg.prayMsg}` };
            if (userCfg.replyEnabled) payload.reply = { messageReference: message.id };
            if (userCfg.mode === 'gif') payload.embeds = [new EmbedBuilder().setColor('#2B2D31').setImage(userCfg.prayGif)];

            message.channel.send(payload).catch(() => {});
            activeTimers.delete(timerKey);
        }, 300000);

        activeTimers.set(timerKey, timer);
        return;
    }
});

// --- 🔘 INTERACTION BUTTON HANDLER ---
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const customId = interaction.customId;

    // Handle Navigasi Menu Help (Reminders & Settings)
    if (customId === 'help_reminders') {
        const helpEmbed = createHelpEmbed(interaction.guild?.name, interaction.user.displayAvatarURL());
        return interaction.update({ embeds: [helpEmbed], components: [createHelpButtons()] });
    }

    if (customId === 'help_settings') {
        const settingsEmbed = createServerSettingsEmbed(interaction.guild?.id || 'dm');
        return interaction.update({ embeds: [settingsEmbed], components: [createHelpButtons()] });
    }

    // Handle Toggle Buttons User Settings
    const parts = customId.split('_');
    if (parts[0] === 'toggle') {
        const key = parts[1];
        const type = parts[2];
        const ownerId = parts[3];

        if (interaction.user.id !== ownerId) {
            return interaction.reply({ content: '❌ Ini bukan panel setting milikmu!', ephemeral: true });
        }

        const config = getUserConfig(ownerId);

        if (key === 'enable') {
            if (type === 'owoh') config.huntEnabled = !config.huntEnabled;
            if (type === 'owo') config.owoEnabled = !config.owoEnabled;
            if (type === 'owopray') config.prayEnabled = !config.prayEnabled;
        } else if (key === 'ping') {
            config.pingsEnabled = !config.pingsEnabled;
        } else if (key === 'reply') {
            config.replyEnabled = !config.replyEnabled;
        } else if (key === 'mode') {
            config.mode = config.mode === 'text' ? 'gif' : 'text';
        }

        const embed = createSettingsEmbed(interaction.user, type);
        const components = createSettingsButtons(interaction.user, type);

        return interaction.update({ embeds: [embed], components });
    }
});

client.login(process.env.TOKEN);
                                     
